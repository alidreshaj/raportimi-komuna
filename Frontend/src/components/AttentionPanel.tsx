import { useEffect, useState } from 'react'
import { CircleCheck, ChevronRight, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'
import { getAllReports, getStats } from '../api/reports'
import type { Report } from '../types'
import { daysSince, pluralize } from '../utils/format'
import CategoryIcon from './CategoryIcon'
import './AttentionPanel.css'

// Pas sa ditësh një raport i ri quhet "i vonuar" (njësoj si te backend-i, që e llogarit te statistikat).
const LATE_AFTER_DAYS = 3
const SHOWN = 3

interface Waiting {
  // Sa raporte të reja presin gjithsej, dhe sa prej tyre presin mbi LATE_AFTER_DAYS ditë.
  total: number
  late: number
  // Tre më të vjetrat.
  oldest: Report[]
}

// Karta "Kërkon vëmendje" për adminin: sa raporte të reja presin shqyrtim dhe më të vjetrat prej tyre.
// Merr vetëm atë që i duhet (tre më të vjetrat dhe numrat), pavarësisht filtrave të listës poshtë saj.
function AttentionPanel() {
  const [waiting, setWaiting] = useState<Waiting | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([getAllReports({ status: 'New', sort: 'oldest', pageSize: SHOWN }), getStats()])
      .then(([page, stats]) => {
        if (!cancelled) setWaiting({ total: page.totalCount, late: stats.lateNew, oldest: page.items })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Është e dytësore për faqen: nëse dështon ose po ngarkohet, nuk shfaqim asgjë (lista poshtë ka vetë gabimet e saj).
  if (failed || !waiting) return null

  if (waiting.total === 0) {
    return (
      <section className="attention attention--ok" aria-label="Raporte që kërkojnë vëmendje">
        <CircleCheck size={22} aria-hidden="true" />
        <div>
          <h2 className="attention-title">Gjithçka është nën kontroll</h2>
          <p className="attention-text">Asnjë raport i ri nuk pret shqyrtim.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="attention" aria-label="Raporte që kërkojnë vëmendje">
      <div className="attention-head">
        <TriangleAlert size={22} aria-hidden="true" />
        <div>
          <h2 className="attention-title">Kërkon vëmendje</h2>
          <p className="attention-text">
            {pluralize(waiting.total, 'raport i ri', 'raporte të reja')} {waiting.total === 1 ? 'pret' : 'presin'} shqyrtim
            {waiting.late > 0 && `, ${waiting.late} prej tyre mbi ${LATE_AFTER_DAYS} ditë`}.
          </p>
        </div>
      </div>

      <ul className="attention-list">
        {waiting.oldest.map((report) => {
          const days = daysSince(report.createdAt)
          return (
            <li key={report.id}>
              <Link viewTransition to={`/admin/raportet/${report.id}`} className="attention-item">
                <span className="attention-item-icon">
                  <CategoryIcon name={report.categoryName} size={18} />
                </span>
                <span className="attention-item-title">{report.title}</span>
                <span className={`attention-item-wait${days >= LATE_AFTER_DAYS ? ' attention-item-wait--late' : ''}`}>
                  {days === 0 ? 'Sot' : `Pret prej ${pluralize(days, 'dite', 'ditësh')}`}
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default AttentionPanel
