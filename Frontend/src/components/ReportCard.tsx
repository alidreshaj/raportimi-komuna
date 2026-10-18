import { Link } from 'react-router'
import type { Report } from '../types'
import { formatDate } from '../utils/format'
import StatusBadge from './StatusBadge'
import './ReportCard.css'

interface ReportCardProps {
  report: Report
  // Ku çon karta; qytetari te /raportet/:id, admini te /admin/raportet/:id.
  to?: string
  // Admini duhet të shohë kush e ka dërguar raportin.
  showReporter?: boolean
}

// Karta e një raporti te lista. E gjithë karta është lidhje drejt detajeve të raportit.
function ReportCard({ report, to = `/raportet/${report.id}`, showReporter = false }: ReportCardProps) {
  const photoCount = report.images.length

  return (
    <Link to={to} className="report-card">
      <div className="report-card-main">
        <div className="report-card-top">
          <StatusBadge status={report.status} />
          <span className="report-card-category">{report.categoryName}</span>
        </div>
        <h3 className="report-card-title">{report.title}</h3>
        <p className="report-card-location">{report.location}</p>
        {showReporter && <p className="report-card-location">Raportuar nga {report.reporterName}</p>}
      </div>

      <div className="report-card-meta">
        <span>{photoCount === 1 ? '1 foto' : `${photoCount} foto`}</span>
        <span>{formatDate(report.createdAt)}</span>
      </div>
    </Link>
  )
}

export default ReportCard
