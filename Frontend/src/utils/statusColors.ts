import type { ReportStatus } from '../types'

// Ngjyrat e statuseve te grafikët dhe te harta (variablat janë te index.css): të njëjta kudo, kështu ngjyra do të thotë gjithmonë të njëjtën gjë.
export const STATUS_COLORS: Record<ReportStatus, string> = {
  New: 'var(--chart-new)',
  InProgress: 'var(--chart-inprogress)',
  Resolved: 'var(--chart-resolved)',
  Rejected: 'var(--chart-rejected)',
}
