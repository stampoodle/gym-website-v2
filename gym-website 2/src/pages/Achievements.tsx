import { useMemo } from 'react'
import { useWorkouts } from '../context/WorkoutsContext'
import { computeAchievements, computePrEvents } from '../lib/stats'

const GROUPS = ['Consistency', 'Progression', 'Volume'] as const

export default function Achievements() {
  const { workouts } = useWorkouts()
  const prEvents = useMemo(() => computePrEvents(workouts), [workouts])
  const achievements = useMemo(
    () => computeAchievements(workouts, prEvents),
    [workouts, prEvents],
  )

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="page-stack">
      <header className="page-head">
        <div>
          <p className="page-head__eyebrow">Achievements</p>
          <h1 className="page-head__title">
            {unlockedCount} of {achievements.length} unlocked
          </h1>
        </div>
      </header>

      {GROUPS.map((group) => {
        const items = achievements.filter((a) => a.group === group)
        return (
          <section className="section-block" key={group}>
            <div className="section-block__head">
              <h2>{group}</h2>
            </div>
            <div className="achievement-grid">
              {items.map((a) => (
                <div
                  key={a.id}
                  className={
                    'achievement-badge' +
                    (a.unlocked ? ' achievement-badge--unlocked' : '')
                  }
                >
                  <span className="achievement-badge__icon">
                    {a.unlocked ? '✓' : '🔒'}
                  </span>
                  <p className="achievement-badge__title">{a.title}</p>
                  <p className="achievement-badge__description">{a.description}</p>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
