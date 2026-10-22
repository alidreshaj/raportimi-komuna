import { CalendarDays, Image, MapPin, User } from 'lucide-react'
import { Link } from 'react-router'
import type { Report } from '../types'
import { formatDate } from '../utils/format'
import CategoryIcon from './CategoryIcon'
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
          <span className="report-card-category">
            <CategoryIcon name={report.categoryName} size={15} />
            {report.categoryName}
          </span>
        </div>
        <h3 className="report-card-title">{report.title}</h3>
        <p className="report-card-location">
          <MapPin size={15} aria-hidden="true" />
          {report.location}
        </p>
        {showReporter && (
          <p className="report-card-location">
            <User size={15} aria-hidden="true" />
            Raportuar nga {report.reporterName}
          </p>
        )}
      </div>

      <div className="report-card-meta">
        <span>
          <Image size={15} aria-hidden="true" />
          {photoCount === 1 ? '1 foto' : `${photoCount} foto`}
        </span>
        <span>
          <CalendarDays size={15} aria-hidden="true" />
          {formatDate(report.createdAt)}
        </span>
      </div>
    </Link>
  )
}

export default ReportCard
