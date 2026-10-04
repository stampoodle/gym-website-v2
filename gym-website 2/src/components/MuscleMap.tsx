import type { MuscleActivity } from '../lib/stats'
import type { MuscleGroup } from '../types'

type MuscleMapProps = {
  activity: MuscleActivity
  windowDays: number
}

function intensityClass(daysAgo: number | null, windowDays: number): string {
  if (daysAgo === null) return 'muscle--cold'
  if (daysAgo <= Math.max(1, Math.floor(windowDays / 3))) return 'muscle--hot'
  return 'muscle--warm'
}

// A clean, stylised body outline built from simple geometric shapes rather
// than a detailed anatomical illustration — this keeps it dependency-free
// and legible at small sizes, while still reading clearly as "front" and
// "back" views with each muscle group in roughly the right place.
export default function MuscleMap({ activity, windowDays }: MuscleMapProps) {
  const cls = (m: MuscleGroup) => intensityClass(activity[m], windowDays)

  return (
    <div className="muscle-map">
      <div className="muscle-map__figure">
        <svg viewBox="0 0 100 210" aria-label="Front view muscle map">
          <ellipse className="muscle-map__neutral" cx="50" cy="16" rx="11" ry="13" />
          <rect className="muscle-map__neutral" x="44" y="27" width="12" height="9" rx="3" />
          <rect className="muscle-map__neutral" x="30" y="34" width="40" height="58" rx="14" />

          <ellipse className={cls('sideDelts')} cx="21" cy="42" rx="7" ry="10" />
          <ellipse className={cls('sideDelts')} cx="79" cy="42" rx="7" ry="10" />
          <circle className={cls('frontDelts')} cx="28" cy="40" r="8" />
          <circle className={cls('frontDelts')} cx="72" cy="40" r="8" />

          <ellipse className={cls('chest')} cx="40" cy="52" rx="10" ry="12" />
          <ellipse className={cls('chest')} cx="60" cy="52" rx="10" ry="12" />

          <rect className={cls('biceps')} x="13" y="44" width="9" height="26" rx="4.5" />
          <rect className={cls('biceps')} x="78" y="44" width="9" height="26" rx="4.5" />
          <rect className="muscle-map__neutral" x="12" y="72" width="8" height="22" rx="4" />
          <rect className="muscle-map__neutral" x="80" y="72" width="8" height="22" rx="4" />

          <rect className={cls('abs')} x="37" y="78" width="26" height="26" rx="6" />

          <rect className={cls('quads')} x="33" y="106" width="15" height="44" rx="7" />
          <rect className={cls('quads')} x="52" y="106" width="15" height="44" rx="7" />
          <rect className="muscle-map__neutral" x="34" y="154" width="13" height="38" rx="6" />
          <rect className="muscle-map__neutral" x="53" y="154" width="13" height="38" rx="6" />
        </svg>
        <p className="muscle-map__caption">Front</p>
      </div>

      <div className="muscle-map__figure">
        <svg viewBox="0 0 100 210" aria-label="Back view muscle map">
          <ellipse className="muscle-map__neutral" cx="50" cy="16" rx="11" ry="13" />
          <rect className="muscle-map__neutral" x="44" y="27" width="12" height="9" rx="3" />
          <rect className="muscle-map__neutral" x="30" y="34" width="40" height="58" rx="14" />

          <circle className={cls('rearDelts')} cx="28" cy="40" r="8" />
          <circle className={cls('rearDelts')} cx="72" cy="40" r="8" />

          <rect className={cls('upperBack')} x="35" y="38" width="30" height="16" rx="7" />
          <ellipse className={cls('lats')} cx="37" cy="62" rx="10" ry="16" />
          <ellipse className={cls('lats')} cx="63" cy="62" rx="10" ry="16" />
          <rect className={cls('lowerBack')} x="41" y="80" width="18" height="14" rx="6" />

          <rect className={cls('triceps')} x="13" y="44" width="9" height="26" rx="4.5" />
          <rect className={cls('triceps')} x="78" y="44" width="9" height="26" rx="4.5" />
          <rect className="muscle-map__neutral" x="12" y="72" width="8" height="22" rx="4" />
          <rect className="muscle-map__neutral" x="80" y="72" width="8" height="22" rx="4" />

          <ellipse className={cls('glutes')} cx="40" cy="110" rx="11" ry="11" />
          <ellipse className={cls('glutes')} cx="60" cy="110" rx="11" ry="11" />

          <rect className={cls('hamstrings')} x="33" y="122" width="15" height="40" rx="7" />
          <rect className={cls('hamstrings')} x="52" y="122" width="15" height="40" rx="7" />
          <rect className={cls('calves')} x="34" y="164" width="13" height="38" rx="6" />
          <rect className={cls('calves')} x="53" y="164" width="13" height="38" rx="6" />
        </svg>
        <p className="muscle-map__caption">Back</p>
      </div>
    </div>
  )
}
