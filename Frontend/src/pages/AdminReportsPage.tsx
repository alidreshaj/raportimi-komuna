import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Inbox, SearchX } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { getAllReports, getReportPins } from '../api/reports'
import type { ReportListQuery } from '../api/reports'
import AttentionPanel from '../components/AttentionPanel'
import EmptyState from '../components/EmptyState'
import ReportsMap from '../components/maps/ReportsMap'
import Pagination from '../components/Pagination'
import ReportCard from '../components/ReportCard'
import ReportListSkeleton from '../components/ReportListSkeleton'
import ReportTable from '../components/ReportTable'
import SearchBox from '../components/SearchBox'
import StatusChips from '../components/StatusChips'
import ViewSwitch from '../components/ViewSwitch'
import { useCategories } from '../hooks/useCategories'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useEnterOnce } from '../hooks/useEnterOnce'
import type { ReportPage, ReportPin, ReportStatus } from '../types'
import { pluralize } from '../utils/format'
import { SORT_OPTIONS, toStatusCounts } from '../utils/reportList'
import type { SortKey } from '../utils/reportList'
import './ReportsPage.css'
import './AdminReportsPage.css'

type View = 'table' | 'cards' | 'map'

const VIEWS: View[] = ['table', 'cards', 'map']
const STATUSES: ReportStatus[] = ['New', 'InProgress', 'Resolved', 'Rejected']
const SORTS = SORT_OPTIONS.map((o) => o.value)
const PAGE_SIZE = 20

// Lista e të gjitha raporteve për komunën. Filtrimin, kërkimin, radhitjen, numrat e çipave dhe faqosjen i bën serveri (databaza),
// kështu lista mbetet e shpejtë edhe me shumë raporte: këtu kërkojmë vetëm faqen që duhet. Të gjitha zgjedhjet ruhen te adresa
// (?status=New&q=...&page=2), prandaj kur kthehesh nga detajet gjen listën saktësisht ashtu siç e ke lënë.
function AdminReportsPage() {
  const { categories } = useCategories()
  const [params, setParams] = useSearchParams()

  const status = (STATUSES.includes(params.get('status') as ReportStatus) ? params.get('status') : '') as ReportStatus | ''
  const query = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const sort = (SORTS.includes(params.get('sort') as SortKey) ? params.get('sort') : 'newest') as SortKey
  const view = (VIEWS.includes(params.get('view') as View) ? params.get('view') : 'table') as View
  const page = Math.max(1, Number(params.get('page')) || 1)

  // Ndryshon një parametër te adresa; vlera bosh (ose e paracaktuar) e heq fare që adresa të mbetet e shkurtër.
  // replace: nuk shton një hap te historiku për çdo shkronjë ose çdo çip. Çdo filtër i ri kthen faqen e parë.
  function setParam(key: string, value: string, fallback = '') {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === fallback) next.delete(key)
        else next.set(key, value)
        if (key !== 'page' && key !== 'view') next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  // Kutia e kërkimit: shkruhet menjëherë, por te adresa (dhe te serveri) shkon pas një vonese të shkurtër.
  const [searchInput, setSearchInput] = useState(query)
  const debouncedSearch = useDebouncedValue(searchInput.trim())
  useEffect(() => {
    if (debouncedSearch !== query) setParam('q', debouncedSearch)
    // Vetëm kur ndryshon vlera e vonuar: ndryshimet e adresës nga jashtë (p.sh. "Pastro filtrat") nuk e rikthejnë vlerën e vjetër.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  // Filtrat për serverin (pa faqen, pa pamjen).
  const filters: ReportListQuery = useMemo(
    () => ({ status, search: query, categoryId: category ? Number(category) : '', from, to }),
    [status, query, category, from, to],
  )
  const badRange = !!from && !!to && from > to
  const requestKey = JSON.stringify([filters, sort, page])

  // Rezultati ruhet bashkë me çelësin e kërkesës: nëse çelësi nuk përputhet, po ngarkohet një faqe e re dhe lista e vjetër
  // mbetet e dukshme pak e zbehur (pa dritare boshe që "kërcen").
  const [result, setResult] = useState<{ key: string; page: ReportPage } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (badRange) return

    let cancelled = false

    getAllReports({ ...filters, sort, page, pageSize: PAGE_SIZE })
      .then((data) => {
        if (!cancelled) {
          setResult({ key: requestKey, page: data })
          setError(null)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [filters, sort, page, attempt, badRange, requestKey])

  // Pikat e hartës merren veç (të gjitha, pa faqosje) dhe vetëm kur është hapur harta.
  const pinsKey = JSON.stringify(filters)
  const [pins, setPins] = useState<{ key: string; list: ReportPin[] } | null>(null)
  useEffect(() => {
    if (view !== 'map' || badRange) return

    let cancelled = false

    getReportPins(filters)
      .then((list) => {
        if (!cancelled) setPins({ key: pinsKey, list })
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [view, filters, badRange, pinsKey])

  function retry() {
    setError(null)
    setResult(null)
    setAttempt((n) => n + 1)
  }

  function clearFilters() {
    setSearchInput('')
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

  function goToPage(next: number) {
    setParam('page', String(next), '1')
    window.scrollTo({ top: 0 })
  }

  const data = result?.page ?? null
  const loading = !!result && result.key !== requestKey
  const counts = useMemo(() => toStatusCounts(data?.statusCounts ?? []), [data])
  const hasFilters = !!(status || query || category || from || to)
  const enter = useEnterOnce(!!data && data.items.length > 0)

  return (
    <>
      <div className="reports-header">
        <div>
          <h1 className="page-title">Të gjitha raportet</h1>
          {data && !badRange && (
            <p className="page-subtitle">
              {pluralize(data.totalCount, 'raport', 'raporte')}
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
              value={searchInput}
              onChange={setSearchInput}
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

      {/* Po ngarkohet për herë të parë */}
      {!badRange && !data && !error && <ReportListSkeleton />}

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
      {!badRange && data && data.totalCount === 0 && (
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

      {/* Me të dhëna: faqja e re ngarkohet ndërsa e vjetra mbetet pak e zbehur */}
      {!badRange && data && data.totalCount > 0 && view !== 'map' && (
        <div className={loading ? 'list-loading' : undefined} aria-busy={loading}>
          {view === 'table' ? (
            <ReportTable reports={data.items} basePath="/admin/raportet" enter={enter} />
          ) : (
            <ul className={`report-list${enter ? ' report-list--enter' : ''}`}>
              {data.items.map((report, index) => (
                <li key={report.id} style={{ '--i': Math.min(index, 8) } as CSSProperties}>
                  <ReportCard report={report} to={`/admin/raportet/${report.id}`} showReporter />
                </li>
              ))}
            </ul>
          )}

          <Pagination page={data.page} totalPages={data.totalPages} totalCount={data.totalCount} onChange={goToPage} />
        </div>
      )}

      {!badRange && data && data.totalCount > 0 && view === 'map' && !pins && (
        <p className="reports-message" role="status">
          Po ngarkohet harta...
        </p>
      )}

      {/* Harta: të gjitha pikat me të njëjtat filtra; "pa vendndodhje" = raportet që përputhen por nuk kanë pikë */}
      {!badRange && data && data.totalCount > 0 && view === 'map' && pins && (
        <ReportsMap pins={pins.list} missing={Math.max(0, data.totalCount - pins.list.length)} />
      )}
    </>
  )
}

export default AdminReportsPage
