import type { ReportStatus } from '../types'

// Datat vijnë nga backend-i në UTC (me "Z" në fund). Intl i shfaq në shqip dhe në orën lokale të përdoruesit.
const dateFormatter = new Intl.DateTimeFormat('sq-AL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

// "2026-10-12T14:30:00Z" → "12 tetor 2026"
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

// Emrat shqip të statuseve. Record<...> detyron TypeScript të kontrollojë që nuk harrojmë asnjë status.
export const STATUS_LABELS: Record<ReportStatus, string> = {
  New: 'E re',
  InProgress: 'Në trajtim',
  Resolved: 'U zgjidh',
  Rejected: 'Refuzuar',
}

// pluralize(1, 'raport', 'raporte') → "1 raport"; pluralize(4, ...) → "4 raporte"
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}
