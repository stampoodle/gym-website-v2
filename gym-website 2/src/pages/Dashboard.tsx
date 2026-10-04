import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useWorkouts } from '../context/WorkoutsContext'
import { useProfile } from '../context/ProfileContext'
import MuscleMap from '../components/MuscleMap'
import {
  computeAchievements,
  computeMuscleActivity,
  computePrEvents,
} from '../lib/stats'
import { estimate1RM, formatDate, startOfWeek, totalVolume } from '../lib/format'

const WINDOW_OPTIONS = [7, 14, 30] as const

export default function Dashboard() {
  const { workouts } = useWorkouts()
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [windowDays, setWindowDays] = useState<(typeof WINDOW_OPTIONS)[number]>(7)

  const firstName = profile.name.trim() ? profile.name.trim().split(' ')[0] : 'there'

  const weekStats = useMemo(() => {
    const weekStart = startOfWeek(new Date()).getTime()
    const thisWeek = workouts.filter(
      (w) => new Date(`${w.date}T12:00:00`).getTime() >= weekStart,
    )
    const totalSets = thisWeek.reduce(
      (n, w) => n + w.exercises.reduce((s, e) => s + e.sets.length, 0),
      0,
    )
    const volume = thisWeek.reduce(
      (sum, w) => sum + w.exercises.reduce((s, e) => s + totalVolume(e.sets), 0),
      0,
    )
    const exerciseCount = new Set(
      thisWeek.flatMap((w) => w.exercises.map((e) => e.exerciseName)),
    ).size
    return { workoutCount: thisWeek.length, totalSets, volume, exerciseCount }
  }, [workouts])

  const streak = useMemo(() => {
    // Consecutive weeks (ending this week) with at least one workout.
    let weeks = 0
    const cursor = startOfWeek(new Date())
    for (;;) {
      const weekEnd = cursor.getTime() + 7 * 24 * 60 * 60 * 1000
      const hasWorkout = workouts.some((w) => {
        const t = new Date(`${w.date}T12:00:00`).getTime()
        return t >= cursor.getTime() && t < weekEnd
      })
      if (!hasWorkout) break
      weeks += 1
      cursor.setDate(cursor.getDate() - 7)
    }
    return weeks
  }, [workouts])

  const prEvents = useMemo(() => computePrEvents(workouts), [workouts])
  const recentPRs = prEvents.slice(0, 3)

  const recentWorkouts = useMemo(
    () => [...workouts].sort((a, b) => (a.date === b.date ? b.loggedAt - a.loggedAt : a.date < b.date ? 1 : -1)).slice(0, 3),
    [workouts],
  )

  const muscleActivity = useMemo(
    () => computeMuscleActivity(workouts, windowDays),
    [workouts, windowDays],
  )

  const unlockedAchievementCount = useMemo(
    () => computeAchievements(workouts, prEvents).filter((a) => a.unlocked).length,
    [workouts, prEvents],
  )

  return (
    <div className="page-stack">
      <header className="page-head">
        <div>
          <p className="page-head__eyebrow">Home</p>
          <h1 className="page-head__title">Welcome back, {firstName}</h1>
        </div>
        <div className="page-head__actions">
          <button className="btn btn--solid btn--lg" onClick={() => navigate('/app/log')}>
            Log workout
          </button>
        </div>
      </header>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-card__value">{weekStats.workoutCount}</span>
          <span className="stat-card__label">Workouts this week</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{weekStats.totalSets}</span>
          <span className="stat-card__label">Total sets</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{Math.round(weekStats.volume)} kg</span>
          <span className="stat-card__label">Training volume</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{weekStats.exerciseCount}</span>
          <span className="stat-card__label">Exercises performed</span>
        </div>
        {streak > 0 && (
          <div className="stat-card stat-card--accent">
            <span className="stat-card__value">{streak}</span>
            <span className="stat-card__label">
              Week{streak === 1 ? '' : 's'} training streak
            </span>
          </div>
        )}
      </div>

      <section className="section-block">
        <div className="section-block__head">
          <h2>Muscles trained</h2>
          <div className="segmented" role="group" aria-label="Timeframe">
            {WINDOW_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                className={
                  'segmented__option' + (windowDays === d ? ' segmented__option--active' : '')
                }
                onClick={() => setWindowDays(d)}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <MuscleMap activity={muscleActivity} windowDays={windowDays} />
        <div className="muscle-map__legend">
          <span><i className="legend-dot legend-dot--hot" aria-hidden="true" /> Trained recently</span>
          <span><i className="legend-dot legend-dot--warm" aria-hidden="true" /> Trained this period</span>
          <span><i className="legend-dot legend-dot--cold" aria-hidden="true" /> Not trained</span>
        </div>
      </section>

      <section className="section-block">
        <div className="section-block__head">
          <h2>Recent personal records</h2>
        </div>
        {recentPRs.length === 0 ? (
          <p className="empty-note">
            Log a few workouts and your best sets will show up here.
          </p>
        ) : (
          <ul className="pr-list">
            {recentPRs.map((pr, i) => (
              <li key={i} className="pr-row">
                <div>
                  <p className="pr-row__name">{pr.exerciseName}</p>
                  <p className="pr-row__meta">{formatDate(pr.date)}</p>
                </div>
                <div className="pr-row__figures">
                  <span className="pr-row__weight">
                    {pr.type === 'volume'
                      ? `${Math.round(pr.value)} kg volume`
                      : `${pr.weightKg} kg × ${pr.reps}`}
                  </span>
                  <span className="pr-row__est">
                    {pr.type === 'heaviestWeight' && 'Heaviest weight'}
                    {pr.type === 'estimated1RM' &&
                      `est. 1RM ${Math.round(estimate1RM(pr.weightKg ?? 0, pr.reps ?? 1))} kg`}
                    {pr.type === 'volume' && 'Best session volume'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section-block">
        <div className="section-block__head">
          <h2>Recent workouts</h2>
          <Link className="link-more" to="/app/history">
            See all
          </Link>
        </div>
        {recentWorkouts.length === 0 ? (
          <p className="empty-note">No workouts yet — log one to see it here.</p>
        ) : (
          <ul className="workout-list">
            {recentWorkouts.map((w) => {
              const sets = w.exercises.reduce((n, e) => n + e.sets.length, 0)
              const volume = w.exercises.reduce((s, e) => s + totalVolume(e.sets), 0)
              return (
                <li key={w.id}>
                  <Link className="workout-row" to={`/app/history/${w.id}`}>
                    <div>
                      <p className="workout-row__name">{w.name}</p>
                      <p className="workout-row__meta">
                        {formatDate(w.date)} · {w.exercises.length} exercises · {sets} sets
                      </p>
                    </div>
                    <span className="workout-row__stat">{Math.round(volume)} kg</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="section-block">
        <div className="quick-actions">
          <button className="quick-action" onClick={() => navigate('/app/log')}>
            Log workout
          </button>
          <button className="quick-action" onClick={() => navigate('/app/history')}>
            View history
          </button>
          <button className="quick-action" onClick={() => navigate('/app/progress')}>
            View progress
          </button>
          <button className="quick-action" onClick={() => navigate('/app/achievements')}>
            {unlockedAchievementCount} achievements unlocked
          </button>
        </div>
      </section>
    </div>
  )
}
