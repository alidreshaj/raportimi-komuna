import type { ReportStatus } from '../types'
import { STATUS_LABELS } from '../utils/format'
import './StatusBadge.css'

// Etiketa e statusit të një raporti, me ngjyrën e duhur. E ripërdorim te lista, detajet dhe paneli i adminit.
function StatusBadge({ status }: { status: ReportStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{STATUS_LABELS[status]}</span>
}

export default StatusBadge
