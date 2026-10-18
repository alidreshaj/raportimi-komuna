import type { ReportStatus } from '../types'

// Datat vijnë nga backend-i në UTC (me "Z" në fund); new Date() i kthen në orën lokale të përdoruesit.
// Muajt i shkruajmë vetë, sepse Intl varet nga gjuhët që ka shfletuesi: pa shqipen, data del në anglisht ("October 18").
const MONTHS = [
  'janar',
  'shkurt',
  'mars',
  'prill',
  'maj',
  'qershor',
  'korrik',
  'gusht',
  'shtator',
  'tetor',
  'nëntor',
  'dhjetor',
]

// "2026-10-12T14:30:00Z" → "12 tetor 2026"
export function formatDate(iso: string): string {
  const date = new Date(iso)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

// Data dhe ora te mesazhet. Ora në 24 orë ("10:12"), me vitin vetëm kur nuk është viti aktual.
// "2026-10-09T08:12:00Z" → "9 tetor, 10:12" (në orën lokale të përdoruesit)
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  const day = `${date.getDate()} ${MONTHS[date.getMonth()]}${sameYear ? '' : ` ${date.getFullYear()}`}`
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  return `${day}, ${time}`
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
