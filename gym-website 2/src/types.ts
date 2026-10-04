// Shared data shapes for the whole app.
// Once Supabase is added, these will map closely to database tables.

export type ExerciseCategory =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Quads'
  | 'Hamstrings & Glutes'
  | 'Calves'
  | 'Core & Abs'
  | 'Full Body'
  | 'Conditioning'

// The muscle groups shown on the Home dashboard muscle map.
export type MuscleGroup =
  | 'chest'
  | 'frontDelts'
  | 'sideDelts'
  | 'rearDelts'
  | 'biceps'
  | 'triceps'
  | 'lats'
  | 'upperBack'
  | 'lowerBack'
  | 'abs'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'

export type ExerciseDef = {
  id: string
  name: string
  category: ExerciseCategory
  muscles: MuscleGroup[]
}

export type SetEntry = {
  id: string
  weightKg: number
  reps: number
  rir?: number
  notes?: string
}

export type WorkoutExercise = {
  id: string
  exerciseId: string
  exerciseName: string
  sets: SetEntry[]
}

export type Workout = {
  id: string
  name: string
  /** The date the user trained, chosen in the log form — ISO "YYYY-MM-DD". */
  date: string
  /** When this entry was saved. Used only to order same-day workouts. */
  loggedAt: number
  exercises: WorkoutExercise[]
}

export type UserProfile = {
  name: string
  email: string
  unit: 'kg' | 'lb'
}

export type PrEventType = 'heaviestWeight' | 'estimated1RM' | 'volume'

export type PrEvent = {
  exerciseName: string
  type: PrEventType
  date: string
  weightKg?: number
  reps?: number
  value: number
}
