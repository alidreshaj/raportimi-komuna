import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { ClipboardList, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { getMyReports } from '../api/reports'
import StatTile from '../components/charts/StatTile'
import EmptyState from '../components/EmptyState'
import ReportCard from '../components/ReportCard'
import ReportListSkeleton from '../components/ReportListSkeleton'
import { useAuth } from '../context/useAuth'
import type { Report, ReportStatus } from '../types'
import { pluralize } from '../utils/format'
import { STATUS_COLORS } from '../utils/statusColors'
import './ReportsPage.css'

// Një fjali që përmbledh gjendjen e raporteve të mia, p.sh. "2 presin shqyrtim, 1 është në trajtim."
function summarize(reports: Report[]): string {
  if (reports.length === 0) return 'Nuk ke dërguar asnjë raport ende. Dërgo të parin dhe ndiqe këtu.'

  const count = (status: ReportStatus) => reports.filter((r) => r.status === status).length
  const pending = count('New')
  const inProgress = count('InProgress')
  const resolved = count('Resolved')

  const parts: string[] = []
  if (pending > 0) parts.push(`${pending} ${pending === 1 ? 'pret' : 'presin'} shqyrtim`)
  if (inProgress > 0) parts.push(`${inProgress} ${inProgress === 1 ? 'është' : 'janë'} në trajtim`)
  if (resolved > 0) parts.push(`${resolved} ${resolved === 1 ? 'u zgjidh' : 'u zgjidhën'}`)

  const total = `Ke dërguar ${pluralize(reports.length, 'raport', 'raporte')}.`
  return parts.length > 0 ? `${total} ${parts.join(', ')}.` : total
}

// Faqja e parë e qytetarit: mirëseardhje, numrat e mi dhe lista e raporteve. Katër gjendje për listën: po ngarkohet, gabim, bosh, me të dhëna.
function ReportsPage() {
  const { user } = useAuth()
  const firstName = user?.name.trim().split(/\s+/)[0] ?? ''

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
      <section className="welcome">
        <div className="welcome-text">
          <h1 className="welcome-title">Mirësevjen, {firstName}</h1>
          <p className="welcome-summary">{reports ? summarize(reports) : 'Po ngarkohen raportet e tua...'}</p>
        </div>
        <Link to="/raportet/i-ri" className="btn btn-light welcome-button">
          <Plus size={18} aria-hidden="true" />
          Raporto një problem
        </Link>
      </section>

      {/* Numrat e mi: vetëm kur ka raporte */}
      {reports && reports.length > 0 && (
        <div className="dash-kpis">
          <StatTile label="Raporte gjithsej" value={reports.length} />
          <StatTile
            label="Të reja"
            value={reports.filter((r) => r.status === 'New').length}
            hint="presin shqyrtim"
            color={STATUS_COLORS.New}
          />
          <StatTile
            label="Në trajtim"
            value={reports.filter((r) => r.status === 'InProgress').length}
            hint="po zgjidhen tani"
            color={STATUS_COLORS.InProgress}
          />
          <StatTile
            label="Të zgjidhura"
            value={reports.filter((r) => r.status === 'Resolved').length}
            hint="problemi u rregullua"
            color={STATUS_COLORS.Resolved}
          />
        </div>
      )}

      <h2 className="section-title">Raportet e mia</h2>

      {/* Po ngarkohet */}
      {!reports && !error && <ReportListSkeleton />}

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
        <EmptyState
          icon={ClipboardList}
          title="Nuk ke dërguar asnjë raport ende"
          text="Kur dërgon një raport, do ta shohësh këtu me statusin e tij."
        >
          <Link to="/raportet/i-ri" className="btn btn-primary">
            Dërgo raportin e parë
          </Link>
        </EmptyState>
      )}

      {/* Me të dhëna */}
      {reports && reports.length > 0 && (
        <ul className="report-list">
          {reports.map((report, index) => (
            <li key={report.id} style={{ '--i': Math.min(index, 8) } as CSSProperties}>
              <ReportCard report={report} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default ReportsPage
