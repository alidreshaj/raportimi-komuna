import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { updateReport } from '../api/reports'
import ReportFields from '../components/ReportFields'
import { useAuth } from '../context/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useReport } from '../hooks/useReport'
import type { GeoPoint, Report } from '../types'
import { useToast } from '../context/useToast'
import { formFromReport, toReportInput, validateReportForm } from '../utils/reportForm'
import type { ReportFormState } from '../utils/reportForm'
// Përdor të njëjtat stile si forma e krijimit (.new-report, .report-form, .form-actions).
import './NewReportPage.css'

// Forma e ndryshimit. Krijohet vetëm kur raporti është ngarkuar, dhe e fillon formën me të dhënat e tij.
function EditReportForm({ report }: { report: Report }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { categories, error: categoriesError, retry: retryCategories } = useCategories()

  // useState me funksion fillestar: forma mbushet një herë me të dhënat e raportit.
  const [form, setForm] = useState<ReportFormState>(() => formFromReport(report))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function updateField(field: keyof ReportFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function updatePoint(point: GeoPoint | null) {
    setForm((prev) => ({ ...prev, point }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const problem = validateReportForm(form)
    if (problem) {
      setError(problem)
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await updateReport(report.id, toReportInput(form))
      // Kthehemi te detajet, ku shihet ndryshimi.
      toast.show('Ndryshimet u ruajtën.')
      navigate(`/raportet/${report.id}`)
    } catch (e) {
      // P.sh. 409 nëse komuna e mori raportin në shqyrtim ndërkohë.
      setError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
      setSubmitting(false)
    }
  }

  return (
    <form className="report-form" onSubmit={handleSubmit} noValidate>
      <div className="form-fields">
        <ReportFields
          form={form}
          onChange={updateField}
          onPointChange={updatePoint}
          categories={categories}
          categoriesError={categoriesError}
          onRetryCategories={retryCategories}
        />
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <Link to={`/raportet/${report.id}`} className="btn btn-secondary">
          Anulo
        </Link>
        <button type="submit" className="btn btn-primary" disabled={submitting || !categories}>
          {submitting ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
        </button>
      </div>
    </form>
  )
}

function EditReportPage() {
  const { user } = useAuth()
  const { id } = useParams()
  const { report, error } = useReport(Number(id))

  return (
    <div className="new-report">
      <p className="detail-back">
        <Link to={`/raportet/${id}`}>← Kthehu te raporti</Link>
      </p>

      <div className="new-report-header">
        <h1 className="page-title">Ndrysho raportin</h1>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {!report && !error && <p role="status">Po ngarkohet...</p>}

      {/* Rregullat e planit: vetëm qytetari, dhe vetëm kur raporti është New. */}
      {report && user?.role !== 'Citizen' && (
        <p className="form-error" role="alert">
          Vetëm qytetari mund ta ndryshojë raportin e vet.
        </p>
      )}

      {report && user?.role === 'Citizen' && report.status !== 'New' && (
        <p className="form-error" role="alert">
          Ky raport nuk mund të ndryshohet pasi komuna e ka marrë në shqyrtim.
        </p>
      )}

      {report && user?.role === 'Citizen' && report.status === 'New' && <EditReportForm report={report} />}
    </div>
  )
}

export default EditReportPage
