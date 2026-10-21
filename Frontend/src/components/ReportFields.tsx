import type { Category, GeoPoint } from '../types'
import LocationPicker from './maps/LocationPicker'
import { LIMITS } from '../utils/reportForm'
import type { ReportFormState } from '../utils/reportForm'

interface ReportFieldsProps {
  form: ReportFormState
  onChange: (field: keyof ReportFormState, value: string) => void
  // Pika në hartë ndryshon veçmas, sepse nuk është tekst.
  onPointChange: (point: GeoPoint | null) => void
  categories: Category[] | null
  categoriesError: string | null
  onRetryCategories: () => void
}

// Fushat e formës së raportit (titulli, kategoria, përshkrimi, vendi dhe pika në hartë). I përdorin krijimi dhe ndryshimi.
function ReportFields({ form, onChange, onPointChange, categories, categoriesError, onRetryCategories }: ReportFieldsProps) {
  return (
    <>
      <div className="field">
        <label htmlFor="title">Titulli</label>
        <input
          id="title"
          type="text"
          autoComplete="off"
          maxLength={LIMITS.title}
          placeholder="P.sh. Drita e rrugës nuk punon"
          value={form.title}
          onChange={(e) => onChange('title', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="category">Kategoria</label>
        {categoriesError ? (
          <>
            <p className="form-error" role="alert">
              {categoriesError}
            </p>
            <button type="button" className="btn-outline" onClick={onRetryCategories}>
              Provo përsëri
            </button>
          </>
        ) : (
          <select
            id="category"
            value={form.categoryId}
            disabled={!categories}
            onChange={(e) => onChange('categoryId', e.target.value)}
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
          onChange={(e) => onChange('description', e.target.value)}
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
          onChange={(e) => onChange('location', e.target.value)}
        />
        <span className="field-hint">Adresa ose një përshkrim i vendit.</span>
      </div>

      <LocationPicker value={form.point} onChange={onPointChange} />
    </>
  )
}

export default ReportFields
