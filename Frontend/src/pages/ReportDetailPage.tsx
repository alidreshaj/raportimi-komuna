import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getReport } from '../api/reports'
import AuthImage from '../components/AuthImage'
import Conversation from '../components/Conversation'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/useAuth'
import type { Report } from '../types'
import { STATUS_LABELS, formatDate } from '../utils/format'
import './ReportDetailPage.css'

// Detajet e një raporti: përshkrimi, fotot, informacioni anash, dhe biseda me komunën.
function ReportDetailPage() {
  const { user } = useAuth()

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
      <p className="detail-back">
        <Link to="/raportet">← Kthehu te raportet e mia</Link>
      </p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {!report && !error && <p role="status">Po ngarkohet...</p>}

      {report && (
        <div className="detail-layout">
          <div className="detail-main">
            <article className="detail-card">
              <div className="detail-top">
                <StatusBadge status={report.status} />
                <span className="detail-category">{report.categoryName}</span>
              </div>

              <h1 className="detail-title">{report.title}</h1>
              <p className="detail-description">{report.description}</p>
              <p className="detail-location">{report.location}</p>

              {report.images.length > 0 && (
                <ul className="detail-photos" aria-label="Fotot e raportit">
                  {report.images.map((image, index) => (
                    <li key={image.id} className="detail-photo">
                      <AuthImage url={image.url} alt={`Foto ${index + 1} e raportit "${report.title}"`} />
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <Conversation reportId={report.id} />
          </div>

          <aside className="detail-side">
            <section className="detail-card">
              <h2 className="detail-side-title">Detajet</h2>
              <dl className="detail-facts">
                <div>
                  <dt>Statusi</dt>
                  <dd>{STATUS_LABELS[report.status]}</dd>
                </div>
                <div>
                  <dt>Kategoria</dt>
                  <dd>{report.categoryName}</dd>
                </div>
                <div>
                  <dt>Dërguar më</dt>
                  <dd>{formatDate(report.createdAt)}</dd>
                </div>
                <div>
                  <dt>Përditësuar më</dt>
                  <dd>{formatDate(report.updatedAt)}</dd>
                </div>
              </dl>
            </section>

            {/* Rregulli i planit: qytetari ndryshon ose fshin raportin vetëm kur është New.
                Kur është New, butonat e vërtetë shtohen në hapin 8.9. */}
            {user?.role === 'Citizen' && report.status !== 'New' && (
              <section className="detail-card">
                <h2 className="detail-side-title">Veprimet</h2>
                <div className="detail-actions">
                  <button type="button" className="btn-disabled" disabled>
                    Ndrysho raportin
                  </button>
                  <button type="button" className="btn-disabled" disabled>
                    Fshi raportin
                  </button>
                </div>
                <p className="detail-actions-note">
                  Raporti nuk mund të ndryshohet ose të fshihet pasi komuna e ka marrë në shqyrtim. Mund të
                  vazhdosh bisedën.
                </p>
              </section>
            )}
          </aside>
        </div>
      )}
    </>
  )
}

export default ReportDetailPage
