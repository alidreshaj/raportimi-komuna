import { useEffect, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { getCommunityReports } from '../api/reports'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { CommunityReport, VoteResult } from '../types'
import { similarSearchTerms } from '../utils/reportForm'
import CategoryIcon from './CategoryIcon'
import StatusBadge from './StatusBadge'
import VoteButton from './VoteButton'
import './SimilarReports.css'

const SHOWN = 3

interface Found {
  query: string
  items: CommunityReport[]
}

// Gjatë shkrimit të titullit: nëse dikush tjetër e ka raportuar tashmë një problem të ngjashëm, e tregon këtu, që qytetari
// të shtypë "Edhe unë" në vend që të dërgojë një raport të dyfishtë. Nuk bllokon asgjë: raportin mund ta dërgosh gjithsesi.
function SimilarReports({ title }: { title: string }) {
  const query = useDebouncedValue(similarSearchTerms(title), 600)
  const [found, setFound] = useState<Found | null>(null)

  useEffect(() => {
    if (!query) return
    let cancelled = false

    getCommunityReports({ search: query, sort: 'votes', pageSize: SHOWN + 2 })
      .then((page) => {
        // Raportet e mia nuk i tregojmë: s'ka kuptim të mbështesësh veten.
        if (!cancelled) setFound({ query, items: page.items.filter((r) => !r.isMine).slice(0, SHOWN) })
      })
      .catch(() => {
        // Është vetëm një ndihmë: nëse dështon, forma vazhdon normalisht.
        if (!cancelled) setFound({ query, items: [] })
      })

    return () => {
      cancelled = true
    }
  }, [query])

  function applyVote(id: number, result: VoteResult) {
    setFound((prev) => (prev ? { ...prev, items: prev.items.map((r) => (r.id === id ? { ...r, ...result } : r)) } : prev))
  }

  // Shfaqet vetëm për titullin aktual dhe vetëm kur ka çfarë të tregojë.
  if (!query || !found || found.query !== query || found.items.length === 0) return null

  return (
    <section className="similar" aria-label="Probleme të ngjashme të raportuara tashmë">
      <div className="similar-head">
        <Lightbulb size={20} aria-hidden="true" />
        <div>
          <h2 className="similar-title">A është një nga këto problemi yt?</h2>
          <p className="similar-text">Dikush e ka raportuar tashmë. Nëse është i njëjti, shtyp &quot;Edhe unë&quot; dhe mos e dërgo përsëri.</p>
        </div>
      </div>

      <ul className="similar-list">
        {found.items.map((report) => (
          <li key={report.id} className="similar-item">
            <div className="similar-item-main">
              <span className="similar-item-top">
                <StatusBadge status={report.status} />
                <span className="similar-item-category">
                  <CategoryIcon name={report.categoryName} size={14} />
                  {report.categoryName}
                </span>
              </span>
              <span className="similar-item-title">{report.title}</span>
              <span className="similar-item-location">{report.location}</span>
            </div>
            <VoteButton report={report} onChange={(result) => applyVote(report.id, result)} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default SimilarReports
