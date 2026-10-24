import type { ReportStatus, StatusCount } from '../types'

export type SortKey = 'newest' | 'oldest' | 'title' | 'status'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Më të rejat' },
  { value: 'oldest', label: 'Më të vjetrat' },
  { value: 'title', label: 'Titulli A-Z' },
  { value: 'status', label: 'Statusi' },
]

export type StatusCounts = Record<ReportStatus | 'all', number>

// Numrat që kthen serveri (një për çdo status) në formën që i duhet çipave, plus totali "all".
export function toStatusCounts(list: StatusCount[]): StatusCounts {
  const counts: StatusCounts = { all: 0, New: 0, InProgress: 0, Resolved: 0, Rejected: 0 }
  for (const item of list) {
    counts[item.status] = item.count
    counts.all += item.count
  }
  return counts
}
