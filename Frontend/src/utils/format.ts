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

// Data dhe ora te mesazhet. Ora në 24 orë ("10:12", jo "10:12 p.d."), me vitin vetëm kur nuk është viti aktual.
const dayFormatter = new Intl.DateTimeFormat('sq-AL', { day: 'numeric', month: 'long' })
const timeFormatter = new Intl.DateTimeFormat('sq-AL', { hour: '2-digit', minute: '2-digit', hour12: false })

// "2026-10-09T08:12:00Z" → "9 tetor, 10:12" (në orën lokale të përdoruesit)
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  const day = sameYear ? dayFormatter.format(date) : `${dayFormatter.format(date)} ${date.getFullYear()}`
  return `${day}, ${timeFormatter.format(date)}`
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
