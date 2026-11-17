import { useEffect, useState } from 'react'
import { ChevronRight, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router'
import { getAllReports } from '../api/reports'
import type { Report } from '../types'
import { pluralize } from '../utils/format'
import CategoryIcon from './CategoryIcon'
import './TopSupportedPanel.css'

const SHOWN = 3

// Karta "Më të mbështeturat" për adminin: raportet e reja që qytetarët i kanë mbështetur më shumë ("edhe unë e kam këtë problem").
// Janë problemet që prekin më shumë njerëz dhe ende nuk janë marrë në trajtim. Nëse asnjë nuk ka mbështetje, nuk shfaqet fare.
function TopSupportedPanel() {
  const [reports, setReports] = useState<Report[] | null>(null)

  useEffect(() => {
    let cancelled = false

    getAllReports({ status: 'New', sort: 'votes', pageSize: SHOWN })
      .then((page) => {
        if (!cancelled) setReports(page.items.filter((r) => r.voteCount > 0))
      })
      .catch(() => {
        // E dytësore për faqen: lista poshtë ka vetë gabimet e saj.
        if (!cancelled) setReports([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!reports || reports.length === 0) return null

  return (
    <section className="top-supported" aria-label="Raportet më të mbështetura">
      <div className="top-supported-head">
        <ThumbsUp size={22} aria-hidden="true" />
        <div>
          <h2 className="top-supported-title">Më të mbështeturat</h2>
          <p className="top-supported-text">Probleme të reja që prekin më shumë qytetarë.</p>
        </div>
      </div>

      <ul className="top-supported-list">
        {reports.map((report) => (
          <li key={report.id}>
            <Link viewTransition to={`/admin/raportet/${report.id}`} className="top-supported-item">
              <span className="top-supported-icon">
                <CategoryIcon name={report.categoryName} size={18} />
              </span>
              <span className="top-supported-item-title">{report.title}</span>
              <span className="top-supported-votes">{pluralize(report.voteCount, 'mbështetje', 'mbështetje')}</span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TopSupportedPanel
