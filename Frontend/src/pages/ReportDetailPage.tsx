import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getReport } from '../api/reports'
import AuthImage from '../components/AuthImage'
import StatusBadge from '../components/StatusBadge'
import type { Report } from '../types'
import './ReportDetailPage.css'

// PËRKOHËSISHT (8.7): shfaq vetëm titullin, statusin dhe fotot, që t'i shohim fotot e ngarkuara.
// Detajet e plota dhe biseda ndërtohen në hapin 8.8.
function ReportDetailPage() {
  // useParams lexon vlerën nga adresa: te /raportet/5, id = "5".
  const { id } = useParams()
  const reportId = Number(id)
  // Vlerat që mund të llogariten gjatë vizatimit nuk duhen futur te gjendja përmes efektit.
  const validId = Number.isInteger(reportId) && reportId > 0

  const [report, setReport] = useState<Report | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const error = validId ? loadError : 'Adresa e raportit nuk është e vlefshme.'

  useEffect(() => {
    if (!validId) {
      return
    }

    let cancelled = false

    getReport(reportId)
      .then((r) => {
        if (!cancelled) setReport(r)
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [reportId, validId])

  return (
    <>
      <p>
        <Link to="/raportet">← Kthehu te raportet e mia</Link>
      </p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {!report && !error && <p role="status">Po ngarkohet...</p>}

      {report && (
        <>
          <div className="detail-top">
            <StatusBadge status={report.status} />
            <span className="detail-category">{report.categoryName}</span>
          </div>
          <h1 className="page-title">{report.title}</h1>
          <p className="page-subtitle">Detajet e plota dhe biseda vijnë në hapin e radhës.</p>

          <h2 className="detail-section-title">Fotot</h2>
          {report.images.length === 0 ? (
            <p className="page-subtitle">Ky raport nuk ka foto.</p>
          ) : (
            <ul className="detail-photos">
              {report.images.map((image, index) => (
                <li key={image.id} className="detail-photo">
                  <AuthImage url={image.url} alt={`Foto ${index + 1} e raportit "${report.title}"`} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}

export default ReportDetailPage
