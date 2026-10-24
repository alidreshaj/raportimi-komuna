import type { Report, ReportStatus } from '../types'

export type SortKey = 'newest' | 'oldest' | 'title' | 'status'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Më të rejat' },
  { value: 'oldest', label: 'Më të vjetrat' },
  { value: 'title', label: 'Titulli A-Z' },
  { value: 'status', label: 'Statusi' },
]

const STATUS_ORDER: Record<ReportStatus, number> = { New: 0, InProgress: 1, Resolved: 2, Rejected: 3 }

// Pa shkronja të mëdha dhe pa shenja mbi shkronja ("Pejë" → "peje", "Çabrat" → "cabrat"), që kërkimi të gjejë edhe kur shkruan pa to.
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

// A përputhet raporti me kërkimin? Çdo fjalë e kërkimit duhet të gjendet diku te titulli, përshkrimi, vendi, kategoria ose raportuesi.
export function matchesSearch(report: Report, query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true

  const haystack = normalize(
    [report.title, report.description, report.location, report.categoryName, report.reporterName].join(' '),
  )
  return terms.every((term) => haystack.includes(term))
}

export type StatusCounts = Record<ReportStatus | 'all', number>

// Sa raporte ka për çdo status (dhe gjithsej). Për numrat te çipat.
export function countByStatus(reports: Report[]): StatusCounts {
  const counts: StatusCounts = { all: reports.length, New: 0, InProgress: 0, Resolved: 0, Rejected: 0 }
  for (const report of reports) counts[report.status] += 1
  return counts
}

// Kopje e renditur e listës (nuk ndryshon origjinalen).
export function sortReports(reports: Report[], key: SortKey): Report[] {
  const list = [...reports]
  switch (key) {
    case 'oldest':
      return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'title':
      return list.sort((a, b) => a.title.localeCompare(b.title, 'sq'))
    case 'status':
      return list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.createdAt.localeCompare(a.createdAt))
    default:
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}
