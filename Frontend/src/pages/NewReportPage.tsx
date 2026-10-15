import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { getCategories } from '../api/categories'
import { uploadImages } from '../api/images'
import { createReport } from '../api/reports'
import PhotoPicker from '../components/PhotoPicker'
import type { Category } from '../types'
import './NewReportPage.css'

// Kufijtë e gjatësisë, të njëjtë me ata të backend-it (CreateReportDto).
const LIMITS = { title: 200, description: 2000, location: 300 }

// Të gjitha fushat tekst të formës në një objekt. categoryId ruhet si tekst, sepse <select> punon me tekst.
interface FormState {
  title: string
  categoryId: string
  description: string
  location: string
}

const EMPTY_FORM: FormState = { title: '', categoryId: '', description: '', location: '' }

// Validim në shqip para dërgimit. Kthen mesazhin e parë të gabimit, ose null nëse gjithçka është në rregull.
function validate(form: FormState): string | null {
  if (!form.title.trim()) return 'Shkruaj titullin.'
  if (!form.categoryId) return 'Zgjidh kategorinë.'
  if (!form.description.trim()) return 'Shkruaj përshkrimin.'
  if (!form.location.trim()) return 'Shkruaj vendin.'
  return null
}

function NewReportPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Nëse raporti u krijua por fotot dështuan, ruajmë numrin e tij: kështu "Provo përsëri" vetëm
  // ngarkon fotot dhe nuk krijon një raport të dytë.
  const [createdId, setCreatedId] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Kategoritë për <select>. null = ende po ngarkohen.
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    getCategories()
      .then((list) => {
        if (!cancelled) setCategories(list)
      })
      .catch((e: Error) => {
        if (!cancelled) setCategoriesError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  function retryCategories() {
    setCategoriesError(null)
    setAttempt((n) => n + 1)
  }

  // Ndryshon vetëm një fushë dhe i lë të tjerat siç janë.
  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Validojmë vetëm kur raporti nuk është krijuar ende (përndryshe fushat janë të bllokuara).
    if (createdId === null) {
      const problem = validate(form)
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
        const report = await createReport({
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          categoryId: Number(form.categoryId),
        })
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
        await uploadImages(reportId, photos)
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
        setSubmitting(false)
        return
      }
    }

    // Raporti i ri shfaqet i pari te lista.
    navigate('/raportet')
  }

  const reportCreated = createdId !== null

  return (
    <div className="new-report">
      <div className="new-report-header">
        <h1 className="page-title">Raporto një problem</h1>
        <p className="page-subtitle">
          Përshkruaj çfarë po shikon. Sa më i qartë të jetë, aq më shpejt shqyrtohet.
        </p>
      </div>

      <form className="report-form" onSubmit={handleSubmit} noValidate>
        {/* Pasi raporti krijohet, fushat tekst bllokohen: ndryshimi i tyre nuk do ta ndryshonte raportin e krijuar. */}
        <fieldset className="form-fields" disabled={reportCreated}>
          <div className="field">
            <label htmlFor="title">Titulli</label>
            <input
              id="title"
              type="text"
              autoComplete="off"
              maxLength={LIMITS.title}
              placeholder="P.sh. Drita e rrugës nuk punon"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="category">Kategoria</label>
            {categoriesError ? (
              <>
                <p className="form-error" role="alert">
                  {categoriesError}
                </p>
                <button type="button" className="btn-outline" onClick={retryCategories}>
                  Provo përsëri
                </button>
              </>
            ) : (
              <select
                id="category"
                value={form.categoryId}
                disabled={!categories}
                onChange={(e) => updateField('categoryId', e.target.value)}
              >
                <option value="">{categories ? 'Zgjidh kategorinë' : 'Po ngarkohen kategoritë...'}</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="field">
            <label htmlFor="description">Përshkrimi</label>
            <textarea
              id="description"
              rows={4}
              maxLength={LIMITS.description}
              placeholder="Çfarë ka ndodhur dhe pse është problem?"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
            <span className="field-hint">
              {form.description.length}/{LIMITS.description}
            </span>
          </div>

          <div className="field">
            <label htmlFor="location">Vendi</label>
            <input
              id="location"
              type="text"
              autoComplete="off"
              maxLength={LIMITS.location}
              placeholder="P.sh. Pejë, Rruga Mbretëresha Teutë, afër shkollës"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
            <span className="field-hint">Adresa ose një përshkrim i vendit.</span>
          </div>
        </fieldset>

        {/* Zona e fotove mbetet e hapur edhe pasi raporti krijohet: mund ta heqësh foton e pavlefshme. */}
        <PhotoPicker files={photos} onChange={setPhotos} />

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
            <Link to="/raportet" className="btn btn-secondary">
              Vazhdo pa foto
            </Link>
          ) : (
            <Link to="/raportet" className="btn btn-secondary">
              Anulo
            </Link>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || (!reportCreated && !categories)}
          >
            {submitting ? 'Duke dërguar...' : reportCreated ? 'Provo përsëri fotot' : 'Dërgo raportimin'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewReportPage
