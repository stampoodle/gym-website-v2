import type { MuscleGroup, PrEvent, SetEntry, Workout } from '../types'
import { estimate1RM, totalVolume } from './format'
import { exerciseLibrary } from './exerciseLibrary'

// --------------------------------------------------------------------------
// Personal records
// --------------------------------------------------------------------------

/**
 * Walks every workout in chronological order and records a PR event each
 * time an exercise's heaviest weight, estimated 1RM, or single-set volume
 * exceeds everything logged for it so far. This is what powers "recent
 * PRs" on the dashboard, the exercise page, and the calendar.
 */
export function computePrEvents(workouts: Workout[]): PrEvent[] {
  const chronological = [...workouts].sort((a, b) =>
    a.date === b.date ? a.loggedAt - b.loggedAt : a.date < b.date ? -1 : 1,
  )

  const bestWeight = new Map<string, number>()
  const bestEst1RM = new Map<string, number>()
  const bestVolume = new Map<string, number>()
  const events: PrEvent[] = []

  for (const w of chronological) {
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        if (s.weightKg <= 0 || s.reps <= 0) continue

        const prevWeight = bestWeight.get(ex.exerciseName) ?? 0
        if (s.weightKg > prevWeight) {
          bestWeight.set(ex.exerciseName, s.weightKg)
          events.push({
            exerciseName: ex.exerciseName,
            type: 'heaviestWeight',
            date: w.date,
            weightKg: s.weightKg,
            reps: s.reps,
            value: s.weightKg,
          })
        }

        const est = estimate1RM(s.weightKg, s.reps)
        const prevEst = bestEst1RM.get(ex.exerciseName) ?? 0
        if (est > prevEst) {
          bestEst1RM.set(ex.exerciseName, est)
          events.push({
            exerciseName: ex.exerciseName,
            type: 'estimated1RM',
            date: w.date,
            weightKg: s.weightKg,
            reps: s.reps,
            value: est,
          })
        }
      }

      const vol = totalVolume(ex.sets)
      const prevVol = bestVolume.get(ex.exerciseName) ?? 0
      if (vol > prevVol && vol > 0) {
        bestVolume.set(ex.exerciseName, vol)
        events.push({
          exerciseName: ex.exerciseName,
          type: 'volume',
          date: w.date,
          value: vol,
        })
      }
    }
  }

  return events.sort((a, b) => (a.date < b.date ? 1 : -1))
}

// --------------------------------------------------------------------------
// Per-exercise stats page
// --------------------------------------------------------------------------

export type ExerciseHistoryRow = {
  workoutId: string
  date: string
  weightKg: number
  reps: number
  rir?: number
  volume: number
}

export type ExerciseStats = {
  estimated1RM: number
  bestWorkingSet: SetEntry | null
  heaviestWeight: number
  totalVolume: number
  timesPerformed: number
  lastPerformed: string | null
  history: ExerciseHistoryRow[]
}

/**
 * "Best working set" favours a strong, meaningful set rather than just the
 * heaviest single weight — e.g. a low-rep near-max single shouldn't drown
 * out a solid 80kg x 8 if the 1RM estimates are close. We use the set with
 * the highest estimated 1RM, which naturally balances weight and reps.
 */
export function computeExerciseStats(
  workouts: Workout[],
  exerciseName: string,
): ExerciseStats {
  const history: ExerciseHistoryRow[] = []
  let bestWorkingSet: SetEntry | null = null
  let bestWorkingSetEst = 0
  let heaviestWeight = 0
  let volumeSum = 0
  let lastPerformed: string | null = null

  const sorted = [...workouts].sort((a, b) => (a.date < b.date ? -1 : 1))

  for (const w of sorted) {
    for (const ex of w.exercises) {
      if (ex.exerciseName !== exerciseName) continue
      for (const s of ex.sets) {
        if (s.weightKg <= 0 || s.reps <= 0) continue
        history.push({
          workoutId: w.id,
          date: w.date,
          weightKg: s.weightKg,
          reps: s.reps,
          rir: s.rir,
          volume: s.weightKg * s.reps,
        })
        volumeSum += s.weightKg * s.reps
        heaviestWeight = Math.max(heaviestWeight, s.weightKg)
        const est = estimate1RM(s.weightKg, s.reps)
        if (est > bestWorkingSetEst) {
          bestWorkingSetEst = est
          bestWorkingSet = s
        }
        lastPerformed = w.date
      }
    }
  }

  return {
    estimated1RM: bestWorkingSetEst,
    bestWorkingSet,
    heaviestWeight,
    totalVolume: volumeSum,
    timesPerformed: new Set(history.map((h) => h.workoutId)).size,
    lastPerformed,
    history: history.reverse(), // most recent first
  }
}

// --------------------------------------------------------------------------
// Muscle map
// --------------------------------------------------------------------------

export type MuscleActivity = Record<MuscleGroup, number | null> // days ago, or null if not trained in window

const exerciseMuscleMap = new Map(
  exerciseLibrary.map((e) => [e.name, e.muscles]),
)

export function computeMuscleActivity(
  workouts: Workout[],
  windowDays: number,
): MuscleActivity {
  const result = {} as MuscleActivity
  const allMuscles: MuscleGroup[] = [
    'chest',
    'frontDelts',
    'sideDelts',
    'rearDelts',
    'biceps',
    'triceps',
    'lats',
    'upperBack',
    'lowerBack',
    'abs',
    'glutes',
    'quads',
    'hamstrings',
    'calves',
  ]
  for (const m of allMuscles) result[m] = null

  const now = Date.now()
  const windowStart = now - windowDays * 24 * 60 * 60 * 1000

  for (const w of workouts) {
    const workoutTime = new Date(`${w.date}T12:00:00`).getTime()
    if (workoutTime < windowStart) continue
    const daysAgo = Math.max(0, Math.floor((now - workoutTime) / (24 * 60 * 60 * 1000)))

    for (const ex of w.exercises) {
      if (ex.sets.length === 0) continue
      const muscles = exerciseMuscleMap.get(ex.exerciseName) ?? []
      for (const m of muscles) {
        const current = result[m]
        if (current === null || daysAgo < current) {
          result[m] = daysAgo
        }
      }
    }
  }

  return result
}

// --------------------------------------------------------------------------
// Achievements
// --------------------------------------------------------------------------

export type Achievement = {
  id: string
  title: string
  description: string
  unlocked: boolean
  group: 'Consistency' | 'Progression' | 'Volume'
}

function weekKey(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

export function computeAchievements(
  workouts: Workout[],
  prEvents: PrEvent[],
): Achievement[] {
  const count = workouts.length

  const perWeek = new Map<string, number>()
  for (const w of workouts) {
    const k = weekKey(w.date)
    perWeek.set(k, (perWeek.get(k) ?? 0) + 1)
  }
  const maxInWeek = perWeek.size ? Math.max(...perWeek.values()) : 0

  const totalVolumeAllTime = workouts.reduce(
    (sum, w) =>
      sum + w.exercises.reduce((s, ex) => s + totalVolume(ex.sets), 0),
    0,
  )

  const hasHundredKgLift = workouts.some((w) =>
    w.exercises.some((ex) => ex.sets.some((s) => s.weightKg >= 100)),
  )

  const prCount = prEvents.length

  const milestones: Achievement[] = [
    {
      id: 'first-workout',
      title: 'First Workout',
      description: 'Log your first workout.',
      unlocked: count >= 1,
      group: 'Consistency',
    },
    {
      id: 'workouts-5',
      title: '5 Workouts',
      description: 'Log 5 workouts in total.',
      unlocked: count >= 5,
      group: 'Consistency',
    },
    {
      id: 'workouts-10',
      title: '10 Workouts',
      description: 'Log 10 workouts in total.',
      unlocked: count >= 10,
      group: 'Consistency',
    },
    {
      id: 'workouts-25',
      title: '25 Workouts',
      description: 'Log 25 workouts in total.',
      unlocked: count >= 25,
      group: 'Consistency',
    },
    {
      id: 'workouts-50',
      title: '50 Workouts',
      description: 'Log 50 workouts in total.',
      unlocked: count >= 50,
      group: 'Consistency',
    },
    {
      id: 'workouts-100',
      title: '100 Workouts',
      description: 'Log 100 workouts in total.',
      unlocked: count >= 100,
      group: 'Consistency',
    },
    {
      id: 'week-3',
      title: '3 Workouts in a Week',
      description: 'Log 3 workouts within a single week.',
      unlocked: maxInWeek >= 3,
      group: 'Consistency',
    },
    {
      id: 'week-4',
      title: '4 Workouts in a Week',
      description: 'Log 4 workouts within a single week.',
      unlocked: maxInWeek >= 4,
      group: 'Consistency',
    },
    {
      id: 'first-pr',
      title: 'First PR',
      description: 'Set your first personal record.',
      unlocked: prCount >= 1,
      group: 'Progression',
    },
    {
      id: 'pr-10',
      title: '10 PRs',
      description: 'Set 10 personal records.',
      unlocked: prCount >= 10,
      group: 'Progression',
    },
    {
      id: 'pr-25',
      title: '25 PRs',
      description: 'Set 25 personal records.',
      unlocked: prCount >= 25,
      group: 'Progression',
    },
    {
      id: 'pr-50',
      title: '50 PRs',
      description: 'Set 50 personal records.',
      unlocked: prCount >= 50,
      group: 'Progression',
    },
    {
      id: 'hundred-kg',
      title: 'First 100 kg Lift',
      description: 'Log a set of 100 kg or more on any exercise.',
      unlocked: hasHundredKgLift,
      group: 'Progression',
    },
    {
      id: 'volume-10k',
      title: '10,000 kg Total Volume',
      description: 'Reach 10,000 kg of total training volume.',
      unlocked: totalVolumeAllTime >= 10_000,
      group: 'Volume',
    },
    {
      id: 'volume-50k',
      title: '50,000 kg Total Volume',
      description: 'Reach 50,000 kg of total training volume.',
      unlocked: totalVolumeAllTime >= 50_000,
      group: 'Volume',
    },
    {
      id: 'volume-100k',
      title: '100,000 kg Total Volume',
      description: 'Reach 100,000 kg of total training volume.',
      unlocked: totalVolumeAllTime >= 100_000,
      group: 'Volume',
    },
    {
      id: 'volume-500k',
      title: '500,000 kg Total Volume',
      description: 'Reach 500,000 kg of total training volume.',
      unlocked: totalVolumeAllTime >= 500_000,
      group: 'Volume',
    },
  ]

  return milestones
}
