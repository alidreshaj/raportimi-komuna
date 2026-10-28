import { CircleCheck, CircleDot, CircleX, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReportStatus } from '../types'
import { STATUS_LABELS } from '../utils/format'
import './StatusBadge.css'

// Çdo status ka ikonën e vet, kështu nuk varet vetëm nga ngjyra për ta dalluar (e dobishme edhe për daltonistët).
const ICONS: Record<ReportStatus, LucideIcon> = {
  New: CircleDot,
  InProgress: Clock,
  Resolved: CircleCheck,
  Rejected: CircleX,
}

// Etiketa e statusit të një raporti, me ngjyrën dhe ikonën e duhur. E ripërdorim te lista, detajet, harta dhe paneli i adminit.
function StatusBadge({ status, animate = false }: { status: ReportStatus; animate?: boolean }) {
  const Icon = ICONS[status]

  return (
    <span className={`status-badge status-badge--${status}${animate ? ' status-badge--pop' : ''}`}>
      <Icon size={14} strokeWidth={2.4} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  )
}

export default StatusBadge
