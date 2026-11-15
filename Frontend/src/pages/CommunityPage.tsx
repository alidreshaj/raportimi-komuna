import { useEffect, useState } from 'react'
import { SearchX, Users } from 'lucide-react'
import { Link } from 'react-router'
import { getCommunityReports } from '../api/reports'
import CommunityCard from '../components/CommunityCard'
import EmptyState from '../components/EmptyState'
import ReportListSkeleton from '../components/ReportListSkeleton'
import SearchBox from '../components/SearchBox'
import { useCategories } from '../hooks/useCategories'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { usePageTitle } from '../hooks/usePageTitle'
import type { CommunityReport, VoteResult } from '../types'
import './CommunityPage.css'

// Sa probleme vijnë për herë; butoni "Shfaq më shumë" sjell të tjera.
const PAGE_SIZE = 10

type CommunitySort = 'votes' | 'newest'

// Lista e ngarkuar deri tani (një ose disa faqe të bashkuara), me çelësin e filtrave me të cilët u ngarkua.
interface Loaded {
  key: string
  items: CommunityReport[]
  totalCount: number
  loadedPage: number
}

// Problemet e komunës: qytetari sheh çfarë kanë raportuar të tjerët dhe shtyp "Edhe unë" nëse e ka të njëjtin problem.
// Kështu admini sheh cilat probleme prekin më shumë njerëz, dhe shmangen raportet e dyfishta.
function CommunityPage() {
  usePageTitle('Problemet e komunës')
  const { categories } = useCategories()

  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput.trim())
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState<CommunitySort>('votes')
  const [page, setPage] = useState(1)

  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const filtersKey = JSON.stringify([search, categoryId, sort])

  useEffect(() => {
    let cancelled = false

    getCommunityReports({ search, categoryId: categoryId ? Number(categoryId) : '', sort, page, pageSize: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return
        setLoaded((prev) => {
          // Faqja e parë zëvendëson listën; të tjerat i shtohen (po me të njëjtat filtra).
          const items = page > 1 && prev && prev.key === filtersKey ? [...prev.items, ...data.items] : data.items
          return { key: filtersKey, items, totalCount: data.totalCount, loadedPage: page }
        })
        setError(null)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [search, categoryId, sort, page, filtersKey, attempt])

  function retry() {
    setError(null)
    setLoaded(null)
    setAttempt((n) => n + 1)
  }

  function changeSearch(next: string) {
    setSearchInput(next)
    setPage(1)
  }

  // Votimi ndryshon vetëm një kartë; nuk e ngarkojmë përsëri gjithë listën.
  function applyVote(id: number, result: VoteResult) {
    setLoaded((prev) =>
      prev ? { ...prev, items: prev.items.map((r) => (r.id === id ? { ...r, ...result } : r)) } : prev,
    )
  }

  const hasFilters = !!(search || categoryId)
  const current = loaded && loaded.key === filtersKey ? loaded : null
  const loadingMore = !!current && current.loadedPage < page
  const hasMore = !!current && current.items.length < current.totalCount

  return (
    <>
      <div className="community-header">
        <h1 className="page-title">Problemet e komunës</h1>
        <p className="page-subtitle">
          Shiko çfarë kanë raportuar të tjerët. Nëse e ke të njëjtin problem, shtyp &quot;Edhe unë&quot; në vend që ta raportosh përsëri:
          komuna sheh cilat probleme prekin më shumë njerëz.
        </p>
      </div>

      <div className="community-filters">
        <SearchBox value={searchInput} onChange={changeSearch} placeholder="Kërko problem (p.sh. gropë, ndriçim)..." label="Kërko te problemet e komunës" />

        <div className="community-selects">
          <div className="field">
            <label htmlFor="c-category">Kategoria</label>
            <select
              id="c-category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
                setPage(1)
              }}
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
            <label htmlFor="c-sort">Radhit</label>
            <select
              id="c-sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as CommunitySort)
                setPage(1)
              }}
            >
              <option value="votes">Më të mbështeturat</option>
              <option value="newest">Më të rejat</option>
            </select>
          </div>
        </div>
      </div>

      {!error && !current && <ReportListSkeleton />}

      {error && (
        <div className="community-message">
          <p className="form-error" role="alert">
            {error}
          </p>
          <button type="button" className="btn-outline" onClick={retry}>
            Provo përsëri
          </button>
        </div>
      )}

      {current && current.totalCount === 0 && !hasFilters && (
        <EmptyState icon={Users} title="Ende nuk ka probleme të raportuara" text="Kur qytetarët dërgojnë raporte, do t'i shohësh këtu.">
          <Link viewTransition to="/raportet/i-ri" className="btn btn-primary">
            Raporto një problem
          </Link>
        </EmptyState>
      )}

      {current && current.totalCount === 0 && hasFilters && (
        <EmptyState icon={SearchX} title="Nuk u gjet asgjë" text="Nuk ka problem që përputhet. Mund ta raportosh vetë.">
          <Link viewTransition to="/raportet/i-ri" className="btn btn-primary">
            Raporto një problem
          </Link>
        </EmptyState>
      )}

      {current && current.items.length > 0 && (
        <>
          <ul className="community-list">
            {current.items.map((report) => (
              <li key={report.id}>
                <CommunityCard report={report} onVote={applyVote} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="community-more">
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

export default CommunityPage
