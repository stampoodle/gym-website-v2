import type { Workout } from '../types'
import { seedWorkouts } from '../lib/seedData'

// This file is the only place that knows the data lives in localStorage.
// When Supabase is wired up, these four functions are what gets replaced —
// nothing else in the app (context, pages, components) talks to storage
// directly, so swapping the implementation here is enough.

const STORAGE_KEY = 'gymtraina_workouts_v2'

export function listWorkouts(): Workout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Workout[]
  } catch {
    // malformed storage — fall through to seed data
  }
  return seedWorkouts
}

export function saveWorkouts(workouts: Workout[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
}

export function addWorkout(workout: Workout): Workout[] {
  const next = [workout, ...listWorkouts()]
  saveWorkouts(next)
  return next
}

export function deleteWorkout(id: string): Workout[] {
  const next = listWorkouts().filter((w) => w.id !== id)
  saveWorkouts(next)
  return next
}
