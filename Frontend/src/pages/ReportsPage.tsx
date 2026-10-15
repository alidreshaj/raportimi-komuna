import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getMyReports } from '../api/reports'
import ReportCard from '../components/ReportCard'
import type { Report } from '../types'
import { pluralize } from '../utils/format'
import './ReportsPage.css'

// Lista e raporteve të qytetarit. Katër gjendje: po ngarkohet, gabim, bosh, me të dhëna.
function ReportsPage() {
  // null = ende nuk e kemi listën; [] = e kemi dhe është bosh.
  const [reports, setReports] = useState<Report[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Rritet kur shtypet "Provo përsëri", që efekti të ngarkojë përsëri.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    getMyReports()
      .then((list) => {
        if (!cancelled) setReports(list)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  function retry() {
    setError(null)
    setReports(null)
    setAttempt((n) => n + 1)
  }

  return (
    <>
      <div className="reports-header">
        <div>
          <h1 className="page-title">Raportet e mia</h1>
          {reports && reports.length > 0 && (
            <p className="page-subtitle">
              {pluralize(reports.length, 'raport', 'raporte')}. Statusin e përditëson komuna.
            </p>
          )}
        </div>
        <Link to="/raportet/i-ri" className="btn btn-primary">
          Raporto një problem
        </Link>
      </div>

      {/* Po ngarkohet */}
      {!reports && !error && (
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
      {reports && reports.length === 0 && (
        <div className="reports-empty">
          <h2>Nuk ke dërguar asnjë raport ende</h2>
          <p>Kur dërgon një raport, do ta shohësh këtu me statusin e tij.</p>
          <Link to="/raportet/i-ri" className="btn btn-primary">
            Dërgo raportin e parë
          </Link>
        </div>
      )}

      {/* Me të dhëna */}
      {reports && reports.length > 0 && (
        <ul className="report-list">
          {reports.map((report) => (
            <li key={report.id}>
              <ReportCard report={report} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default ReportsPage
