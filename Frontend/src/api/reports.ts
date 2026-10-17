import type { Report, ReportInput } from '../types'
import { apiFetch } from './client'

// Detajet e një raporti (i zoti ose Admin). Kthen 404 nëse nuk ekziston ose nuk është i yti.
export function getReport(id: number): Promise<Report> {
  return apiFetch<Report>(`/api/reports/${id}`)
}

// Ndryshon raportin e vet (vetëm i zoti, vetëm kur është New). Kthen raportin e përditësuar.
export function updateReport(id: number, input: ReportInput): Promise<Report> {
  return apiFetch<Report>(`/api/reports/${id}`, { method: 'PUT', body: input })
}

// Fshin raportin e vet (vetëm kur është New). Fshin edhe komentet dhe fotot e tij.
export function deleteReport(id: number): Promise<void> {
  return apiFetch<void>(`/api/reports/${id}`, { method: 'DELETE' })
}

// Krijon një raport të ri (vetëm qytetari). Kthen raportin e krijuar, me status "New".
export function createReport(input: ReportInput): Promise<Report> {
  return apiFetch<Report>('/api/reports', { method: 'POST', body: input })
}

// Raportet e qytetarit të loguar, më të rejat të parat (backend-i e filtron sipas tokenit).
export function getMyReports(): Promise<Report[]> {
  return apiFetch<Report[]>('/api/reports/my')
}
