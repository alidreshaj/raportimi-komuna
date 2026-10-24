import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Inbox, SearchX } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { getAllReports } from '../api/reports'
import AttentionPanel from '../components/AttentionPanel'
import EmptyState from '../components/EmptyState'
import ReportsMap from '../components/maps/ReportsMap'
import ReportCard from '../components/ReportCard'
import ReportListSkeleton from '../components/ReportListSkeleton'
import ReportTable from '../components/ReportTable'
import SearchBox from '../components/SearchBox'
import StatusChips from '../components/StatusChips'
import ViewSwitch from '../components/ViewSwitch'
import { useCategories } from '../hooks/useCategories'
import type { Report, ReportStatus } from '../types'
import { pluralize } from '../utils/format'
import { SORT_OPTIONS, countByStatus, matchesSearch, sortReports } from '../utils/reportList'
import type { SortKey } from '../utils/reportList'
import './ReportsPage.css'
import './AdminReportsPage.css'

type View = 'table' | 'cards' | 'map'

const VIEWS: View[] = ['table', 'cards', 'map']
const SORTS = SORT_OPTIONS.map((o) => o.value)

// Lista e të gjitha raporteve për komunën. Kategoria dhe datat i filtron backend-i; statusi, kërkimi dhe radhitja bëhen këtu,
// kështu çipat ndërrojnë menjëherë pa kërkesë të re dhe numrat tregojnë gjendjen e vërtetë. Të gjitha zgjedhjet ruhen te adresa
// (?status=New&q=...), prandaj kur kthehesh nga detajet gjen listën saktësisht ashtu siç e ke lënë.
function AdminReportsPage() {
  const { categories } = useCategories()
  const [params, setParams] = useSearchParams()

  const status = (['New', 'InProgress', 'Resolved', 'Rejected'].includes(params.get('status') ?? '') ? params.get('status') : '') as
    | ReportStatus
    | ''
  const query = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const sort = (SORTS.includes(params.get('sort') as SortKey) ? params.get('sort') : 'newest') as SortKey
  const view = (VIEWS.includes(params.get('view') as View) ? params.get('view') : 'table') as View

  // Ndryshon një parametër te adresa; vlera bosh (ose e paracaktuar) e heq fare që adresa të mbetet e shkurtër.
  // replace: nuk shton një hap te historiku për çdo shkronjë të shkruar ose çdo çip.
  function setParam(key: string, value: string, fallback = '') {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === fallback) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )
  }

  const [reports, setReports] = useState<Report[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  // Data "nga" pas datës "deri" nuk ka kuptim: backend-i kthen 400, prandaj nuk e dërgojmë fare.
  const badRange = !!from && !!to && from > to

  useEffect(() => {
    if (badRange) return

    let cancelled = false

    getAllReports({ categoryId: category ? Number(category) : '', from, to })
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
  }, [category, from, to, attempt, badRange])

  function retry() {
    setError(null)
    setReports(null)
    setAttempt((n) => n + 1)
  }

  function clearFilters() {
    setParams(
      (prev) => {
        const next = new URLSearchParams()
        // Pamja dhe radhitja mbeten: nuk janë filtra.
        for (const key of ['view', 'sort']) if (prev.get(key)) next.set(key, prev.get(key)!)
        return next
      },
      { replace: true },
    )
  }

  // Numrat te çipat vijnë nga raportet që përputhen me kërkimin; lista shfaq vetëm statusin e zgjedhur.
  const searched = useMemo(() => (reports ?? []).filter((r) => matchesSearch(r, query)), [reports, query])
  const counts = useMemo(() => countByStatus(searched), [searched])
  const visible = useMemo(
    () => sortReports(status ? searched.filter((r) => r.status === status) : searched, sort),
    [searched, status, sort],
  )

  const hasFilters = !!(status || query || category || from || to)

  return (
    <>
      <div className="reports-header">
        <div>
          <h1 className="page-title">Të gjitha raportet</h1>
          {reports && !badRange && (
            <p className="page-subtitle">
              {pluralize(visible.length, 'raport', 'raporte')}
              {hasFilters ? ' me këto filtra.' : '.'}
            </p>
          )}
        </div>

        <ViewSwitch
          label="Pamja"
          options={[
            { value: 'table', label: 'Tabelë' },
            { value: 'cards', label: 'Kartë' },
            { value: 'map', label: 'Hartë' },
          ]}
          value={view}
          onChange={(value) => setParam('view', value, 'table')}
        />
      </div>

      <AttentionPanel />

      <div className="admin-filters">
        <StatusChips value={status} onChange={(value) => setParam('status', value)} counts={counts} />

        <form className="admin-filters-row" onSubmit={(e) => e.preventDefault()}>
          <div className="field admin-search">
            <label htmlFor="f-q">Kërko</label>
            <SearchBox
              id="f-q"
              value={query}
              onChange={(value) => setParam('q', value)}
              placeholder="Titulli, vendi, emri i raportuesit..."
              label="Kërko në raporte"
            />
          </div>

          <div className="field">
            <label htmlFor="f-category">Kategoria</label>
            <select id="f-category" value={category} onChange={(e) => setParam('category', e.target.value)}>
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
            <input id="f-from" type="date" value={from} max={to || undefined} onChange={(e) => setParam('from', e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="f-to">Deri më</label>
            <input id="f-to" type="date" value={to} min={from || undefined} onChange={(e) => setParam('to', e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="f-sort">Radhit</label>
            <select id="f-sort" value={sort} onChange={(e) => setParam('sort', e.target.value, 'newest')}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="btn-outline" disabled={!hasFilters} onClick={clearFilters}>
            Pastro filtrat
          </button>
        </form>
      </div>

      {badRange && (
        <p className="form-error" role="alert">
          Data "Nga" nuk mund të jetë pas datës "Deri më".
        </p>
      )}

      {/* Po ngarkohet */}
      {!badRange && !reports && !error && <ReportListSkeleton />}

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
      {!badRange && reports && visible.length === 0 && (
        <EmptyState
          icon={hasFilters ? SearchX : Inbox}
          title={hasFilters ? 'Asnjë raport nuk përputhet me filtrat' : 'Nuk ka raporte ende'}
          text={
            hasFilters
              ? 'Provo t\'i ndryshosh ose t\'i pastrosh filtrat.'
              : 'Kur qytetarët dërgojnë raporte, do t\'i shohësh këtu.'
          }
        />
      )}

      {/* Me të dhëna */}
      {!badRange && visible.length > 0 && view === 'table' && <ReportTable reports={visible} basePath="/admin/raportet" />}

      {!badRange && visible.length > 0 && view === 'cards' && (
        <ul className="report-list">
          {visible.map((report, index) => (
            <li key={report.id} style={{ '--i': Math.min(index, 8) } as CSSProperties}>
              <ReportCard report={report} to={`/admin/raportet/${report.id}`} showReporter />
            </li>
          ))}
        </ul>
      )}

      {/* Harta përdor të njëjtat raporte dhe të njëjtat filtra si lista. */}
      {!badRange && visible.length > 0 && view === 'map' && <ReportsMap reports={visible} />}
    </>
  )
}

export default AdminReportsPage
