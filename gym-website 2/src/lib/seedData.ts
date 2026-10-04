import type { Workout } from '../types'
import { newId } from './format'

// Demo history so the app is testable immediately, without a real
// account or database. This is local, temporary data — it lives in
// the browser only and resets if storage is cleared.

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function workout(
  daysAgo: number,
  name: string,
  exercises: Workout['exercises'],
): Workout {
  const date = isoDaysAgo(daysAgo)
  return {
    id: newId(),
    name,
    date,
    loggedAt: new Date(`${date}T18:00:00`).getTime(),
    exercises,
  }
}

function ex(exerciseId: string, exerciseName: string, sets: [number, number, number?][]) {
  return {
    id: newId(),
    exerciseId,
    exerciseName,
    sets: sets.map(([weightKg, reps, rir]) => ({
      id: newId(),
      weightKg,
      reps,
      rir,
    })),
  }
}

export const seedWorkouts: Workout[] = [
  workout(1, 'Push Day', [
    ex('barbell-bench-press', 'Barbell Bench Press', [
      [80, 8, 2],
      [80, 8, 2],
      [82.5, 6, 1],
    ]),
    ex('incline-dumbbell-bench-press', 'Incline Dumbbell Bench Press', [
      [30, 10, 2],
      [30, 9, 1],
    ]),
    ex('dumbbell-lateral-raise', 'Dumbbell Lateral Raise', [
      [10, 15],
      [10, 14],
    ]),
  ]),
  workout(3, 'Leg Day', [
    ex('barbell-back-squat', 'Barbell Back Squat', [
      [100, 6, 2],
      [100, 6, 2],
      [105, 5, 1],
    ]),
    ex('romanian-deadlift', 'Romanian Deadlift', [
      [90, 8, 2],
      [90, 8, 2],
    ]),
    ex('leg-press', 'Leg Press', [
      [160, 10],
      [160, 10],
    ]),
  ]),
  workout(5, 'Pull Day', [
    ex('conventional-deadlift', 'Conventional Deadlift', [
      [120, 5, 2],
      [130, 3, 1],
    ]),
    ex('barbell-bent-over-row', 'Barbell Bent-Over Row', [
      [70, 8, 2],
      [70, 8, 1],
    ]),
    ex('lat-pulldown', 'Lat Pulldown', [
      [55, 10],
      [55, 10],
    ]),
  ]),
  workout(8, 'Push Day', [
    ex('barbell-bench-press', 'Barbell Bench Press', [
      [77.5, 8, 2],
      [77.5, 8, 2],
      [80, 6, 2],
    ]),
    ex('barbell-overhead-press', 'Barbell Overhead Press', [
      [45, 8, 2],
      [45, 7, 1],
    ]),
  ]),
  workout(10, 'Leg Day', [
    ex('barbell-back-squat', 'Barbell Back Squat', [
      [97.5, 6, 2],
      [97.5, 6, 2],
      [100, 6, 2],
    ]),
    ex('lying-leg-curl', 'Lying Leg Curl', [
      [40, 12],
      [40, 11],
    ]),
  ]),
  workout(14, 'Pull Day', [
    ex('conventional-deadlift', 'Conventional Deadlift', [
      [115, 5, 2],
      [125, 4, 2],
    ]),
    ex('seated-cable-row', 'Seated Cable Row', [
      [60, 10],
      [60, 10],
    ]),
  ]),
  workout(17, 'Push Day', [
    ex('barbell-bench-press', 'Barbell Bench Press', [
      [75, 8, 2],
      [75, 8, 2],
      [77.5, 6, 2],
    ]),
    ex('cable-triceps-extension', 'Cable Triceps Extension', [
      [25, 12],
      [25, 11],
    ]),
  ]),
  workout(21, 'Leg Day', [
    ex('barbell-back-squat', 'Barbell Back Squat', [
      [95, 6, 2],
      [95, 6, 2],
    ]),
    ex('standing-calf-raise', 'Standing Calf Raise', [
      [80, 15],
      [80, 15],
    ]),
  ]),
]
