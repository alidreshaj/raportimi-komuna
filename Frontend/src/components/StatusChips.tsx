import type { ReportStatus } from '../types'
import { STATUS_LABELS } from '../utils/format'
import type { StatusCounts } from '../utils/reportList'
import { STATUS_COLORS } from '../utils/statusColors'
import './StatusChips.css'

const ORDER: ReportStatus[] = ['New', 'InProgress', 'Resolved', 'Rejected']

interface StatusChipsProps {
  // '' = të gjitha.
  value: ReportStatus | ''
  onChange: (value: ReportStatus | '') => void
  counts: StatusCounts
}

interface ChipProps {
  label: string
  count: number
  color?: string
  active: boolean
  onClick: () => void
}

function Chip({ label, count, color, active, onClick }: ChipProps) {
  return (
    <button type="button" className={`status-chip${active ? ' status-chip--active' : ''}`} aria-pressed={active} onClick={onClick}>
      {color && <i className="status-chip-dot" style={{ background: color }} />}
      {label}
      <span className="status-chip-count">{count}</span>
    </button>
  )
}

// Çipat e statusit me numrat: me një klikim sheh vetëm raportet e atij statusi. Numrat tregojnë sa ka për secilin, edhe kur një tjetër është i zgjedhur.
function StatusChips({ value, onChange, counts }: StatusChipsProps) {
  return (
    <div className="status-chips" role="group" aria-label="Filtro sipas statusit">
      <Chip label="Të gjitha" count={counts.all} active={value === ''} onClick={() => onChange('')} />
      {ORDER.map((status) => (
        <Chip
          key={status}
          label={STATUS_LABELS[status]}
          count={counts[status]}
          color={STATUS_COLORS[status]}
          active={value === status}
          onClick={() => onChange(status)}
        />
      ))}
    </div>
  )
}

export default StatusChips
