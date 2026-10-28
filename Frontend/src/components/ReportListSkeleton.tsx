import type { CSSProperties } from 'react'
import Skeleton from './Skeleton'

// Tre karta bosh me formën e kartave të vërteta, që shfaqen kur po ngarkohet lista e raporteve.
function ReportListSkeleton() {
  return (
    <>
      <p className="visually-hidden" role="status">
        Po ngarkohen raportet...
      </p>
      <ul className="report-list report-list--enter" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <li key={i} style={{ '--i': i } as CSSProperties}>
            <div className="report-card report-card--skeleton">
              <Skeleton width={112} height={88} radius={10} style={{ flex: 'none' }} />
              <div className="skeleton-lines">
                <Skeleton width={120} height={22} radius={999} />
                <Skeleton width="70%" height={20} />
                <Skeleton width="45%" height={14} />
              </div>
              <Skeleton width={110} height={14} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export default ReportListSkeleton
