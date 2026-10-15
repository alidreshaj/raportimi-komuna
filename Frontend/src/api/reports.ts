import type { Report } from '../types'
import { apiFetch } from './client'

// Raportet e qytetarit të loguar, më të rejat të parat (backend-i e filtron sipas tokenit).
export function getMyReports(): Promise<Report[]> {
  return apiFetch<Report[]>('/api/reports/my')
}
