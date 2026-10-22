import { useEffect, useState } from 'react'
import { CircleCheck, ChevronRight, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'
import { getAllReports } from '../api/reports'
import type { Report } from '../types'
import { daysSince, pluralize } from '../utils/format'
import CategoryIcon from './CategoryIcon'
import './AttentionPanel.css'

// Pas sa ditësh një raport i ri konsiderohet "i vonuar".
const LATE_AFTER_DAYS = 3
const SHOWN = 3

// Karta "Kërkon vëmendje" për adminin: sa raporte të reja presin shqyrtim dhe më të vjetrat prej tyre.
// I merr vetë raportet e reja, pavarësisht filtrave të listës poshtë saj, kështu numrat nuk ndryshojnë kur filtron.
function AttentionPanel() {
  const [waiting, setWaiting] = useState<Report[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    getAllReports({ status: 'New' })
      .then((list) => {
        if (!cancelled) setWaiting(list)
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

  if (waiting.length === 0) {
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

  // Më të vjetrat të parat.
  const oldest = [...waiting].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(0, SHOWN)
  const late = waiting.filter((r) => daysSince(r.createdAt) >= LATE_AFTER_DAYS).length

  return (
    <section className="attention" aria-label="Raporte që kërkojnë vëmendje">
      <div className="attention-head">
        <TriangleAlert size={22} aria-hidden="true" />
        <div>
          <h2 className="attention-title">Kërkon vëmendje</h2>
          <p className="attention-text">
            {pluralize(waiting.length, 'raport i ri', 'raporte të reja')}{' '}
            {waiting.length === 1 ? 'pret' : 'presin'} shqyrtim
            {late > 0 && `, ${late} prej tyre mbi ${LATE_AFTER_DAYS} ditë`}.
          </p>
        </div>
      </div>

      <ul className="attention-list">
        {oldest.map((report) => {
          const days = daysSince(report.createdAt)
          return (
            <li key={report.id}>
              <Link to={`/admin/raportet/${report.id}`} className="attention-item">
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
