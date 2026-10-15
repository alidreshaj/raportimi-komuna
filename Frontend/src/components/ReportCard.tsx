import { Link } from 'react-router'
import type { Report } from '../types'
import { formatDate } from '../utils/format'
import StatusBadge from './StatusBadge'
import './ReportCard.css'

// Karta e një raporti te lista. E gjithë karta është lidhje drejt detajeve të raportit.
function ReportCard({ report }: { report: Report }) {
  const photoCount = report.images.length

  return (
    <Link to={`/raportet/${report.id}`} className="report-card">
      <div className="report-card-main">
        <div className="report-card-top">
          <StatusBadge status={report.status} />
          <span className="report-card-category">{report.categoryName}</span>
        </div>
        <h3 className="report-card-title">{report.title}</h3>
        <p className="report-card-location">{report.location}</p>
      </div>

      <div className="report-card-meta">
        <span>{photoCount === 1 ? '1 foto' : `${photoCount} foto`}</span>
        <span>{formatDate(report.createdAt)}</span>
      </div>
    </Link>
  )
}

export default ReportCard
