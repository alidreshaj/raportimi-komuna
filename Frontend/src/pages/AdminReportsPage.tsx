import { useEffect, useState } from 'react'
import { getAllReports } from '../api/reports'
import type { ReportFilters } from '../api/reports'
import AttentionPanel from '../components/AttentionPanel'
import ReportsMap from '../components/maps/ReportsMap'
import ReportCard from '../components/ReportCard'
import ViewSwitch from '../components/ViewSwitch'
import { useCategories } from '../hooks/useCategories'
import type { Report, ReportStatus } from '../types'
import { STATUS_LABELS, pluralize } from '../utils/format'
import './ReportsPage.css'
import './AdminReportsPage.css'

const STATUSES = Object.keys(STATUS_LABELS) as ReportStatus[]

const NO_FILTERS: ReportFilters = { status: '', categoryId: '', from: '', to: '' }

// Lista e të gjitha raporteve për komunën, me filtra. Filtrimin e bën backend-i: çdo ndryshim i filtrit
// e kërkon listën përsëri me parametrat e rinj. Katër gjendje si te lista e qytetarit.
function AdminReportsPage() {
  const { categories } = useCategories()

  const [view, setView] = useState<'list' | 'map'>('list')
  const [filters, setFilters] = useState<ReportFilters>(NO_FILTERS)
  const [reports, setReports] = useState<Report[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  // Data "nga" pas datës "deri" nuk ka kuptim: backend-i kthen 400, prandaj nuk e dërgojmë fare.
  const badRange = !!filters.from && !!filters.to && filters.from > filters.to

  useEffect(() => {
    if (badRange) return

    let cancelled = false

    getAllReports(filters)
      .then((list) => {
        if (!cancelled) {
          setReports(list)
          setError(null)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [filters, attempt, badRange])

  function change(patch: Partial<ReportFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  function retry() {
    setError(null)
    setReports(null)
    setAttempt((n) => n + 1)
  }

  const hasFilters = Object.values(filters).some((v) => v !== '')

  return (
    <>
      <div className="reports-header">
        <div>
          <h1 className="page-title">Të gjitha raportet</h1>
          {reports && !badRange && (
            <p className="page-subtitle">
              {pluralize(reports.length, 'raport', 'raporte')}
              {hasFilters ? ' me këto filtra.' : '.'}
            </p>
          )}
        </div>

        <ViewSwitch
          label="Pamja"
          options={[
            { value: 'list', label: 'Listë' },
            { value: 'map', label: 'Hartë' },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      <AttentionPanel />

      <form className="admin-filters" onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <label htmlFor="f-status">Statusi</label>
          <select
            id="f-status"
            value={filters.status}
            onChange={(e) => change({ status: e.target.value as ReportStatus | '' })}
          >
            <option value="">Të gjitha</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-category">Kategoria</label>
          <select
            id="f-category"
            value={filters.categoryId}
            onChange={(e) => change({ categoryId: e.target.value ? Number(e.target.value) : '' })}
          >
            <option value="">Të gjitha</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-from">Nga data</label>
          <input id="f-from" type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => change({ from: e.target.value })} />
        </div>

        <div className="field">
          <label htmlFor="f-to">Deri më</label>
          <input id="f-to" type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => change({ to: e.target.value })} />
        </div>

        <button type="button" className="btn-outline" disabled={!hasFilters} onClick={() => setFilters(NO_FILTERS)}>
          Pastro filtrat
        </button>
      </form>

      {badRange && (
        <p className="form-error" role="alert">
          Data "Nga" nuk mund të jetë pas datës "Deri më".
        </p>
      )}

      {/* Po ngarkohet */}
      {!badRange && !reports && !error && (
        <p className="reports-message" role="status">
          Po ngarkohen raportet...
        </p>
      )}

      {/* Gabim */}
      {error && (
        <div className="reports-message">
          <p className="form-error" role="alert">
            {error}
          </p>
          <button type="button" className="btn-outline" onClick={retry}>
            Provo përsëri
          </button>
        </div>
      )}

      {/* Bosh */}
      {!badRange && reports && reports.length === 0 && (
        <div className="reports-empty">
          <h2>{hasFilters ? 'Asnjë raport nuk përputhet me filtrat' : 'Nuk ka raporte ende'}</h2>
          <p>
            {hasFilters
              ? 'Provo t\'i ndryshosh ose t\'i pastrosh filtrat.'
              : 'Kur qytetarët dërgojnë raporte, do t\'i shohësh këtu.'}
          </p>
        </div>
      )}

      {/* Me të dhëna */}
      {!badRange && reports && reports.length > 0 && view === 'list' && (
        <ul className="report-list">
          {reports.map((report) => (
            <li key={report.id}>
              <ReportCard report={report} to={`/admin/raportet/${report.id}`} showReporter />
            </li>
          ))}
        </ul>
      )}

      {/* Harta përdor të njëjtat raporte dhe të njëjtat filtra si lista. */}
      {!badRange && reports && reports.length > 0 && view === 'map' && <ReportsMap reports={reports} />}
    </>
  )
}

export default AdminReportsPage
