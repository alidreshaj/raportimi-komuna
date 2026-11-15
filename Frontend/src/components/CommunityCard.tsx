import { CalendarDays, MapPin } from 'lucide-react'
import type { CommunityReport, VoteResult } from '../types'
import { formatDate } from '../utils/format'
import CategoryIcon from './CategoryIcon'
import StatusBadge from './StatusBadge'
import VoteButton from './VoteButton'
import './CommunityCard.css'

interface CommunityCardProps {
  report: CommunityReport
  onVote: (id: number, result: VoteResult) => void
}

// Karta e një problemi të komunës: e dhënat kryesore (pa raportuesin) dhe butoni "Edhe unë".
function CommunityCard({ report, onVote }: CommunityCardProps) {
  return (
    <article className={`community-card community-card--${report.status}`}>
      <div className="community-card-main">
        <div className="community-card-top">
          <StatusBadge status={report.status} />
          <span className="community-card-category">
            <CategoryIcon name={report.categoryName} size={15} />
            {report.categoryName}
          </span>
        </div>
        <h3 className="community-card-title">{report.title}</h3>
        <p className="community-card-text">
          {report.description}
          {report.description.length >= 200 && '…'}
        </p>
        <p className="community-card-meta">
          <span>
            <MapPin size={15} aria-hidden="true" />
            {report.location}
          </span>
          <span>
            <CalendarDays size={15} aria-hidden="true" />
            {formatDate(report.createdAt)}
          </span>
        </p>
      </div>

      <VoteButton report={report} onChange={(result) => onVote(report.id, result)} />
    </article>
  )
}

export default CommunityCard
