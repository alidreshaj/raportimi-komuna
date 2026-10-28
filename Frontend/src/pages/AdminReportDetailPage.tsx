import { useState } from 'react'
import { useParams } from 'react-router'
import Breadcrumbs from '../components/Breadcrumbs'
import Confetti from '../components/Confetti'
import Conversation from '../components/Conversation'
import DetailSkeleton from '../components/DetailSkeleton'
import ReportMap from '../components/maps/ReportMap'
import PhotoGallery from '../components/PhotoGallery'
import Reveal from '../components/Reveal'
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

  // Konfeti kur admini e shënon raportin "U zgjidh" (numri ndryshon sa herë, që të luhet çdo herë).
  const [confetti, setConfetti] = useState(0)

  function handleChanged(next: Report) {
    setUpdated(next)
    setChatVersion((n) => n + 1)
    if (next.status === 'Resolved') setConfetti((n) => n + 1)
  }

  return (
    <>
      {confetti > 0 && <Confetti key={confetti} onDone={() => setConfetti(0)} />}

      <Breadcrumbs items={[{ label: 'Të gjitha raportet', to: '/admin/raportet' }, { label: report?.title ?? 'Raporti' }]} />

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {!report && !error && <DetailSkeleton />}

      {report && (
        <div className="detail-layout fade-in">
          <div className="detail-main">
            <article className="detail-card">
              <div className="detail-top">
                <StatusBadge key={report.status} status={report.status} animate />
                <span className="detail-category">{report.categoryName}</span>
              </div>

              <h1 className="detail-title">{report.title}</h1>
              <p className="detail-description">{report.description}</p>
              <p className="detail-location">{report.location}</p>

              <PhotoGallery images={report.images} title={report.title} />
            </article>

            {report.latitude !== null && report.longitude !== null && (
              <Reveal><ReportMap latitude={report.latitude} longitude={report.longitude} title={report.title} /></Reveal>
            )}

            <Reveal><Conversation key={chatVersion} reportId={report.id} /></Reveal>
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

            <Reveal><StatusTimeline key={chatVersion} reportId={report.id} /></Reveal>
          </aside>
        </div>
      )}
    </>
  )
}

export default AdminReportDetailPage
