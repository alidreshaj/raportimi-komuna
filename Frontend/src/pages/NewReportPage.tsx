import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Send } from 'lucide-react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { uploadImages } from '../api/images'
import { createReport } from '../api/reports'
import PhotoPicker from '../components/PhotoPicker'
import Breadcrumbs from '../components/Breadcrumbs'
import LoadingButton from '../components/LoadingButton'
import ReportFields from '../components/ReportFields'
import { useCategories } from '../hooks/useCategories'
import type { GeoPoint } from '../types'
import { useToast } from '../context/useToast'
import { EMPTY_REPORT_FORM, toReportInput, validateReportForm } from '../utils/reportForm'
import type { ReportFormState } from '../utils/reportForm'
import './NewReportPage.css'

function NewReportPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { categories, error: categoriesError, retry: retryCategories } = useCategories()

  const [form, setForm] = useState<ReportFormState>(EMPTY_REPORT_FORM)
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Nëse raporti u krijua por fotot dështuan, ruajmë numrin e tij: kështu "Provo përsëri" vetëm
  // ngarkon fotot dhe nuk krijon një raport të dytë.
  const [createdId, setCreatedId] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  // Progresi i ngarkimit të fotove (0-100), ose null kur nuk po ngarkohet asgjë.
  const [uploadPercent, setUploadPercent] = useState<number | null>(null)

  // Ndryshon vetëm një fushë dhe i lë të tjerat siç janë.
  function updateField(field: keyof ReportFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function updatePoint(point: GeoPoint | null) {
    setForm((prev) => ({ ...prev, point }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Validojmë vetëm kur raporti nuk është krijuar ende (përndryshe fushat janë të bllokuara).
    if (createdId === null) {
      const problem = validateReportForm(form)
      if (problem) {
        setError(problem)
        return
      }
    }

    setError(null)
    setUploadError(null)
    setSubmitting(true)

    // Hapi 1: krijo raportin (nëse nuk është krijuar tashmë nga një përpjekje e mëparshme).
    let reportId = createdId
    if (reportId === null) {
      try {
        const report = await createReport(toReportInput(form))
        reportId = report.id
        setCreatedId(report.id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
        setSubmitting(false)
        return
      }
    }

    // Hapi 2: ngarko fotot (nëse ka). Nëse dështon, raporti mbetet i krijuar.
    if (photos.length > 0) {
      try {
        setUploadPercent(0)
        await uploadImages(reportId, photos, setUploadPercent)
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
        setSubmitting(false)
        setUploadPercent(null)
        return
      }
    }

    // Raporti i ri shfaqet i pari te lista.
    toast.show('Raporti u dërgua me sukses.')
    navigate('/raportet', { viewTransition: true })
  }

  const reportCreated = createdId !== null

  return (
    <div className="new-report">
      <Breadcrumbs items={[{ label: 'Raportet e mia', to: '/raportet' }, { label: 'Raport i ri' }]} />

      <div className="new-report-header">
        <h1 className="page-title">Raporto një problem</h1>
        <p className="page-subtitle">
          Përshkruaj çfarë po shikon. Sa më i qartë të jetë, aq më shpejt shqyrtohet.
        </p>
      </div>

      <form className="report-form" onSubmit={handleSubmit} noValidate>
        {/* Pasi raporti krijohet, fushat tekst bllokohen: ndryshimi i tyre nuk do ta ndryshonte raportin e krijuar. */}
        <fieldset className="form-fields" disabled={reportCreated}>
          <ReportFields
            form={form}
            onChange={updateField}
            onPointChange={updatePoint}
            categories={categories}
            categoriesError={categoriesError}
            onRetryCategories={retryCategories}
          />
        </fieldset>

        {/* Zona e fotove mbetet e hapur edhe pasi raporti krijohet: mund ta heqësh foton e pavlefshme. */}
        <PhotoPicker files={photos} onChange={setPhotos} />

        {uploadPercent !== null && (
          <div className="upload-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadPercent} aria-label="Ngarkimi i fotove">
            <div className="upload-progress-track">
              <div className="upload-progress-fill" style={{ '--p': uploadPercent / 100 } as CSSProperties} />
            </div>
            <span className="field-hint">Duke ngarkuar fotot... {uploadPercent}%</span>
          </div>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {uploadError && (
          <div className="form-error" role="alert">
            <p className="photo-problem">
              <strong>Raporti u krijua</strong>, por fotot nuk u ngarkuan: {uploadError}
            </p>
            <p className="photo-problem">
              Mund t'i provosh përsëri (ose të heqësh foton e pavlefshme), ose të vazhdosh pa foto.
            </p>
          </div>
        )}

        <div className="form-actions">
          {reportCreated ? (
            <Link viewTransition to="/raportet" className="btn btn-secondary">
              Vazhdo pa foto
            </Link>
          ) : (
            <Link viewTransition to="/raportet" className="btn btn-secondary">
              Anulo
            </Link>
          )}
          <LoadingButton
            type="submit"
            loading={submitting}
            loadingLabel="Duke dërguar..."
            disabled={!reportCreated && !categories}
            icon={<Send size={17} aria-hidden="true" />}
          >
            {reportCreated ? 'Provo përsëri fotot' : 'Dërgo raportimin'}
          </LoadingButton>
        </div>
      </form>
    </div>
  )
}

export default NewReportPage
