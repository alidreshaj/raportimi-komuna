import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { deleteReport } from '../api/reports'
import AuthImage from '../components/AuthImage'
import ConfirmDialog from '../components/ConfirmDialog'
import Conversation from '../components/Conversation'
import DetailSkeleton from '../components/DetailSkeleton'
import ReportMap from '../components/maps/ReportMap'
import StatusBadge from '../components/StatusBadge'
import StatusTimeline from '../components/StatusTimeline'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import { useReport } from '../hooks/useReport'
import { STATUS_LABELS, formatDate } from '../utils/format'
import './ReportDetailPage.css'

// Detajet e një raporti: përshkrimi, fotot, informacioni anash, veprimet, dhe biseda me komunën.
function ReportDetailPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  // useParams lexon vlerën nga adresa: te /raportet/5, id = "5".
  const { id } = useParams()
  const { report, error } = useReport(Number(id))

  // Dritarja e konfirmimit të fshirjes.
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function openConfirm() {
    setDeleteError(null)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (!report) return

    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteReport(report.id)
      // replace: butoni "mbrapa" të mos të kthejë te një raport që nuk ekziston më.
      toast.show('Raporti u fshi.')
      navigate('/raportet', { replace: true })
    } catch (e) {
      // P.sh. 409 nëse komuna e mori raportin në shqyrtim ndërkohë. Dritarja mbetet e hapur me gabimin.
      setDeleteError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
      setDeleting(false)
    }
  }

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

            <StatusTimeline reportId={report.id} />

            {/* Rregulli i planit: qytetari ndryshon ose fshin raportin vetëm kur është New. */}
            {user?.role === 'Citizen' && (
              <section className="detail-card">
                <h2 className="detail-side-title">Veprimet</h2>

                {report.status === 'New' ? (
                  <div className="detail-actions">
                    <Link to={`/raportet/${report.id}/ndrysho`} className="btn btn-secondary">
                      Ndrysho raportin
                    </Link>
                    <button type="button" className="btn btn-danger-outline" onClick={openConfirm}>
                      Fshi raportin
                    </button>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </section>
            )}
          </aside>

          <ConfirmDialog
            open={confirmOpen}
            title="Të fshihet raporti?"
            message="Raporti, komentet dhe fotot e tij do të fshihen përgjithmonë. Ky veprim nuk kthehet."
            confirmLabel="Fshi raportin"
            busyLabel="Duke fshirë..."
            busy={deleting}
            error={deleteError}
            onConfirm={handleDelete}
            onCancel={() => setConfirmOpen(false)}
          />
        </div>
      )}
    </>
  )
}

export default ReportDetailPage
