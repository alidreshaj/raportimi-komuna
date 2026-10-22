import type { ReportStatus } from '../types'

// Datat vijnë nga backend-i në UTC (me "Z" në fund); new Date() i kthen në orën lokale të përdoruesit.
// Muajt i shkruajmë vetë, sepse Intl varet nga gjuhët që ka shfletuesi: pa shqipen, data del në anglisht ("October 18").
export const MONTHS = [
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

// Shkurtimet për boshtet e grafikëve (vend i pakët): "tetor" → "tet".
export const MONTHS_SHORT = ['jan', 'shk', 'mar', 'pri', 'maj', 'qer', 'kor', 'gus', 'sht', 'tet', 'nën', 'dhj']

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

// Përqindja e plotë e një pjese nga totali; 0 kur totali është 0 (që të mos dalë NaN).
export function percentOf(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

// Inicialet për avatarin: "Ali Test" → "AT", "Ali" → "A". Deri në dy shkronja të para nga fjalët e emrit.
export function initialsOf(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
  return letters.join('') || '?'
}

// Sa ditë të plota kanë kaluar që nga një datë (0 = sot). Përdoret te "pret prej X ditësh".
export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
}
