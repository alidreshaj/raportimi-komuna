import { useEffect, useState } from 'react'
import { getStatusHistory } from '../api/reports'
import type { StatusHistoryItem } from '../types'
import { formatDateTime } from '../utils/format'
import StatusBadge from './StatusBadge'
import './StatusTimeline.css'

// Afati kohor i ndryshimeve të statusit të një raporti. Merr vetëm numrin e raportit dhe e ngarkon vetë historikun,
// kështu e ripërdorim te faqja e qytetarit dhe te ajo e adminit.
function StatusTimeline({ reportId }: { reportId: number }) {
  // null = ende po ngarkohet; [] = ngarkuar dhe bosh.
  const [history, setHistory] = useState<StatusHistoryItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    getStatusHistory(reportId)
      .then((list) => {
        if (!cancelled) setHistory(list)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [reportId, attempt])

  function retry() {
    setError(null)
    setHistory(null)
    setAttempt((n) => n + 1)
  }

  return (
    <section className="detail-card">
      <h2 className="detail-side-title">Historiku i statusit</h2>

      {!history && !error && (
        <p className="timeline-note" role="status">
          Po ngarkohet...
        </p>
      )}

      {error && (
        <div className="timeline-note">
          <p className="form-error" role="alert">
            {error}
          </p>
          <button type="button" className="btn-outline" onClick={retry}>
            Provo përsëri
          </button>
        </div>
      )}

      {history && history.length === 0 && <p className="timeline-note">Statusi nuk ka ndryshuar ende.</p>}

      {history && history.length > 0 && (
        <ol className="timeline">
          {history.map((item) => (
            <li key={item.id} className="timeline-item">
              <div className="timeline-change">
                <StatusBadge status={item.fromStatus} />
                <span aria-label="u bë">→</span>
                <StatusBadge status={item.toStatus} />
              </div>
              <span className="timeline-meta">
                {formatDateTime(item.changedAt)} · {item.changedByName}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default StatusTimeline
