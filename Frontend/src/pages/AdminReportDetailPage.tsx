import { useState } from 'react'
import { Link, useParams } from 'react-router'
import AuthImage from '../components/AuthImage'
import Conversation from '../components/Conversation'
import DetailSkeleton from '../components/DetailSkeleton'
import ReportMap from '../components/maps/ReportMap'
import StatusBadge from '../components/StatusBadge'
import StatusPanel from '../components/StatusPanel'
import StatusTimeline from '../components/StatusTimeline'
import { useReport } from '../hooks/useReport'
import type { Report } from '../types'
import { STATUS_LABELS, formatDate } from '../utils/format'
import './ReportDetailPage.css'

// Detajet e një raporti për adminin: i njëjti dizajn si te qytetari, por pa Ndrysho/Fshi,
// me emrin e raportuesit dhe me panelin për ndryshimin e statusit.
function AdminReportDetailPage() {
  const { id } = useParams()
  const { report: loaded, error } = useReport(Number(id))

  // Raporti i përditësuar pas ndryshimit të statusit (përgjigjja e serverit). Kur nuk ka, përdorim të ngarkuarin.
  const [updated, setUpdated] = useState<Report | null>(null)
  // Rritet pas çdo ndryshimi statusi: biseda dhe historiku rikarkohen (arsyeja e refuzimit ruhet si koment i ri).
  const [chatVersion, setChatVersion] = useState(0)

  const report = updated && updated.id === loaded?.id ? updated : loaded

  function handleChanged(next: Report) {
    setUpdated(next)
    setChatVersion((n) => n + 1)
  }

  return (
    <>
      <p className="detail-back">
        <Link to="/admin/raportet">← Kthehu te të gjitha raportet</Link>
      </p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {!report && !error && <DetailSkeleton />}

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

            {report.latitude !== null && report.longitude !== null && (
              <ReportMap latitude={report.latitude} longitude={report.longitude} title={report.title} />
            )}

            <Conversation key={chatVersion} reportId={report.id} />
          </div>

          <aside className="detail-side">
            <StatusPanel report={report} onChanged={handleChanged} />

            <section className="detail-card">
              <h2 className="detail-side-title">Detajet</h2>
              <dl className="detail-facts">
                <div>
                  <dt>Raportuar nga</dt>
                  <dd>{report.reporterName}</dd>
                </div>
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

            <StatusTimeline key={chatVersion} reportId={report.id} />
          </aside>
        </div>
      )}
    </>
  )
}

export default AdminReportDetailPage
