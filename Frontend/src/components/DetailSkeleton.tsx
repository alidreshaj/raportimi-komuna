import Skeleton from './Skeleton'

// Skeleti i faqes së detajeve (kolona kryesore dhe ajo anësore), derisa raporti ngarkohet.
function DetailSkeleton() {
  return (
    <>
      <p className="visually-hidden" role="status">
        Po ngarkohet raporti...
      </p>
      <div className="detail-layout" aria-hidden="true">
        <div className="detail-main">
          <div className="detail-card">
            <Skeleton width={150} height={24} radius={999} />
            <Skeleton width="65%" height={32} />
            <Skeleton height={14} />
            <Skeleton width="90%" height={14} />
            <Skeleton width="40%" height={14} />
            <div style={{ display: 'flex', gap: 12 }}>
              <Skeleton width={150} height={110} radius={10} />
              <Skeleton width={150} height={110} radius={10} />
            </div>
          </div>
          <div className="detail-card">
            <Skeleton width="40%" height={22} />
            <Skeleton height={60} radius={12} />
          </div>
        </div>
        <div className="detail-side">
          <div className="detail-card">
            <Skeleton width="50%" height={18} />
            <Skeleton height={14} />
            <Skeleton height={14} />
            <Skeleton height={14} />
          </div>
        </div>
      </div>
    </>
  )
}

export default DetailSkeleton
