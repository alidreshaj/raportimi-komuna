import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { ClipboardList, Plus, SearchX } from 'lucide-react'
import { Link } from 'react-router'
import { getMyReports } from '../api/reports'
import StatTile from '../components/charts/StatTile'
import EmptyState from '../components/EmptyState'
import ReportCard from '../components/ReportCard'
import ReportListSkeleton from '../components/ReportListSkeleton'
import SearchBox from '../components/SearchBox'
import StatusChips from '../components/StatusChips'
import { useAuth } from '../context/useAuth'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useEnterOnce } from '../hooks/useEnterOnce'
import type { Report, ReportStatus } from '../types'
import { pluralize } from '../utils/format'
import { toStatusCounts } from '../utils/reportList'
import type { StatusCounts } from '../utils/reportList'
import { STATUS_COLORS } from '../utils/statusColors'
import './ReportsPage.css'

// Mbi këtë numër raportesh shfaqen çipat e statusit dhe kutia e kërkimit.
const FILTER_FROM = 5
// Sa raporte vijnë për herë; butoni "Shfaq më shumë" sjell të tjera.
const PAGE_SIZE = 10

// Një fjali që përmbledh gjendjen e raporteve të mia, p.sh. "2 presin shqyrtim, 1 është në trajtim."
function summarize(counts: StatusCounts): string {
  if (counts.all === 0) return 'Nuk ke dërguar asnjë raport ende. Dërgo të parin dhe ndiqe këtu.'

  const parts: string[] = []
  if (counts.New > 0) parts.push(`${counts.New} ${counts.New === 1 ? 'pret' : 'presin'} shqyrtim`)
  if (counts.InProgress > 0) parts.push(`${counts.InProgress} ${counts.InProgress === 1 ? 'është' : 'janë'} në trajtim`)
  if (counts.Resolved > 0) parts.push(`${counts.Resolved} ${counts.Resolved === 1 ? 'u zgjidh' : 'u zgjidhën'}`)

  const total = `Ke dërguar ${pluralize(counts.all, 'raport', 'raporte')}.`
  return parts.length > 0 ? `${total} ${parts.join(', ')}.` : total
}

// Lista e raporteve që është ngarkuar deri tani (një ose disa faqe të bashkuara), me çelësin e filtrave me të cilët u ngarkua.
interface Loaded {
  key: string
  items: Report[]
  totalCount: number
  statusCounts: StatusCounts
  loadedPage: number
}

// Faqja e parë e qytetarit: mirëseardhje, numrat e mi dhe lista e raporteve. Raportet vijnë 10 për herë nga serveri
// (butoni "Shfaq më shumë"), dhe çipat e statusit dhe kërkimi bëhen te serveri.
function ReportsPage() {
  const { user } = useAuth()
  const firstName = user?.name.trim().split(/\s+/)[0] ?? ''

  // Numrat e të gjitha raporteve të mia (pa filtra): për përmbledhjen, katër kutitë dhe vendimin nëse shfaqen çipat.
  const [overall, setOverall] = useState<StatusCounts | null>(null)

  const [status, setStatus] = useState<ReportStatus | ''>('')
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput.trim())
  const [page, setPage] = useState(1)

  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Rritet kur shtypet "Provo përsëri", që efekti të ngarkojë përsëri.
  const [attempt, setAttempt] = useState(0)

  const filtersKey = JSON.stringify([status, search])

  useEffect(() => {
    let cancelled = false

    getMyReports({ pageSize: 1 })
      .then((data) => {
        if (!cancelled) setOverall(toStatusCounts(data.statusCounts))
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  useEffect(() => {
    let cancelled = false

    getMyReports({ status, search, page, pageSize: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return
        setLoaded((prev) => {
          // Faqja e parë zëvendëson listën; faqet e tjera i shtohen asaj që ka tashmë (po me të njëjtat filtra).
          const items = page > 1 && prev && prev.key === filtersKey ? [...prev.items, ...data.items] : data.items
          return {
            key: filtersKey,
            items,
            totalCount: data.totalCount,
            statusCounts: toStatusCounts(data.statusCounts),
            loadedPage: page,
          }
        })
        setError(null)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [status, search, page, filtersKey, attempt])

  function retry() {
    setError(null)
    setLoaded(null)
    setOverall(null)
    setAttempt((n) => n + 1)
  }

  function changeStatus(next: ReportStatus | '') {
    setStatus(next)
    setPage(1)
  }

  function changeSearch(next: string) {
    setSearchInput(next)
    setPage(1)
  }

  const filterable = (overall?.all ?? 0) > FILTER_FROM
  const hasFilters = !!(status || search)
  // Lista është e ngarkuar për filtrat aktualë (jo e vjetër nga filtrat e mëparshëm).
  const current = loaded && loaded.key === filtersKey ? loaded : null
  const loadingMore = !!current && current.loadedPage < page
  const hasMore = !!current && current.items.length < current.totalCount
  const enter = useEnterOnce(!!current && current.items.length > 0)

  return (
    <>
      <section className="welcome">
        <div className="welcome-text">
          <h1 className="welcome-title">Mirësevjen, {firstName}</h1>
          <p className="welcome-summary">{overall ? summarize(overall) : 'Po ngarkohen raportet e tua...'}</p>
        </div>
        <Link viewTransition to="/raportet/i-ri" className="btn btn-light welcome-button">
          <Plus size={18} aria-hidden="true" />
          Raporto një problem
        </Link>
      </section>

      {/* Numrat e mi: vetëm kur ka raporte */}
      {overall && overall.all > 0 && (
        <div className="dash-kpis">
          <StatTile label="Raporte gjithsej" value={overall.all} />
          <StatTile label="Të reja" value={overall.New} hint="presin shqyrtim" color={STATUS_COLORS.New} />
          <StatTile label="Në trajtim" value={overall.InProgress} hint="po zgjidhen tani" color={STATUS_COLORS.InProgress} />
          <StatTile label="Të zgjidhura" value={overall.Resolved} hint="problemi u rregullua" color={STATUS_COLORS.Resolved} />
        </div>
      )}

      <h2 className="section-title">Raportet e mia</h2>

      {filterable && (
        <div className="my-filters">
          <StatusChips value={status} onChange={changeStatus} counts={current?.statusCounts ?? overall!} />
          <SearchBox value={searchInput} onChange={changeSearch} placeholder="Kërko në raportet e mia..." label="Kërko në raportet e mia" />
        </div>
      )}

      {/* Po ngarkohet */}
      {!error && !current && <ReportListSkeleton />}

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

      {/* Bosh: asnjë raport fare */}
      {current && current.totalCount === 0 && !hasFilters && (
        <EmptyState
          icon={ClipboardList}
          title="Nuk ke dërguar asnjë raport ende"
          text="Kur dërgon një raport, do ta shohësh këtu me statusin e tij."
        >
          <Link viewTransition to="/raportet/i-ri" className="btn btn-primary">
            Dërgo raportin e parë
          </Link>
        </EmptyState>
      )}

      {/* Asnjë përputhje me çipin ose kërkimin */}
      {current && current.totalCount === 0 && hasFilters && (
        <EmptyState icon={SearchX} title="Asnjë raport nuk përputhet" text="Provo një status tjetër ose ndrysho kërkimin." />
      )}

      {/* Me të dhëna */}
      {current && current.items.length > 0 && (
        <>
          <ul className={`report-list${enter ? ' report-list--enter' : ''}`}>
            {current.items.map((report, index) => (
              <li key={report.id} style={{ '--i': Math.min(index % PAGE_SIZE, 8) } as CSSProperties}>
                <ReportCard report={report} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="load-more">
              <button type="button" className="btn btn-secondary" disabled={loadingMore} onClick={() => setPage((n) => n + 1)}>
                {loadingMore ? 'Po ngarkohen...' : `Shfaq më shumë (${current.items.length} nga ${current.totalCount})`}
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default ReportsPage
