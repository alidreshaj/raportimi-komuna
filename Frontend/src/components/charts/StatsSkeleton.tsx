import Skeleton from '../Skeleton'

// Skeleti i faqes së statistikave: katër kutitë me numra dhe dy kartat e grafikëve.
function StatsSkeleton() {
  return (
    <>
      <p className="visually-hidden" role="status">
        Po ngarkohen statistikat...
      </p>
      <div className="stats-content" aria-hidden="true">
        <div className="stats-kpis">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="stat-tile">
              <Skeleton width="55%" height={14} />
              <Skeleton width="35%" height={34} />
              <Skeleton width="45%" height={12} />
            </div>
          ))}
        </div>
        <div className="stats-grid">
          {[0, 1].map((i) => (
            <div key={i} className="chart-card">
              <Skeleton width="50%" height={20} />
              <Skeleton height={200} radius={12} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default StatsSkeleton
