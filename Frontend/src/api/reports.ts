import type { Report, ReportInput } from '../types'
import { apiFetch } from './client'

// Krijon një raport të ri (vetëm qytetari). Kthen raportin e krijuar, me status "New".
export function createReport(input: ReportInput): Promise<Report> {
  return apiFetch<Report>('/api/reports', { method: 'POST', body: input })
}

// Raportet e qytetarit të loguar, më të rejat të parat (backend-i e filtron sipas tokenit).
export function getMyReports(): Promise<Report[]> {
  return apiFetch<Report[]>('/api/reports/my')
}
