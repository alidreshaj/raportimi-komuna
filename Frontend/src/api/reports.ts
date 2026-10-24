import type { Report, ReportInput, ReportPage, ReportPin, ReportStatus, Stats, StatusHistoryItem } from '../types'
import type { SortKey } from '../utils/reportList'
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

// Parametrat e listave: filtra, kërkim, radhitje dhe faqosje. Fushat bosh nuk dërgohen fare.
// Datat janë "yyyy-MM-dd" (siç i jep <input type="date">).
export interface ReportListQuery {
  status?: ReportStatus | ''
  categoryId?: number | ''
  from?: string
  to?: string
  search?: string
  sort?: SortKey
  page?: number
  pageSize?: number
}

function toQueryString(query: ReportListQuery): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

// Një faqe e raporteve të qytetarit të loguar (backend-i e filtron sipas tokenit).
export function getMyReports(query: ReportListQuery = {}): Promise<ReportPage> {
  return apiFetch<ReportPage>(`/api/reports/my${toQueryString(query)}`)
}

// Një faqe e të gjitha raporteve (vetëm Admin), me filtra, kërkim dhe radhitje. Faqosjen, kërkimin dhe numrat e bën databaza.
export function getAllReports(query: ReportListQuery = {}): Promise<ReportPage> {
  return apiFetch<ReportPage>(`/api/reports${toQueryString(query)}`)
}

// Pikat për hartën e adminit: vetëm raportet me koordinata, me të njëjtat filtra, pa faqosje.
export function getReportPins(query: ReportListQuery = {}): Promise<ReportPin[]> {
  const { page: _page, pageSize: _pageSize, sort: _sort, ...filters } = query
  return apiFetch<ReportPin[]>(`/api/reports/map${toQueryString(filters)}`)
}

// Ndryshon statusin (vetëm Admin). `reason` është e detyrueshme për Rejected dhe ruhet si koment.
// Kthen raportin e përditësuar. 409 nëse rruga nuk lejohet (p.sh. Resolved → New).
export function updateReportStatus(id: number, status: ReportStatus, reason?: string): Promise<Report> {
  return apiFetch<Report>(`/api/reports/${id}/status`, {
    method: 'PATCH',
    body: { status, reason: reason?.trim() || undefined },
  })
}

// Historiku i ndryshimeve të statusit (i zoti ose Admin). Lista bosh = statusi nuk ka ndryshuar ende.
export function getStatusHistory(reportId: number): Promise<StatusHistoryItem[]> {
  return apiFetch<StatusHistoryItem[]>(`/api/reports/${reportId}/history`)
}

// Statistikat për komunën (vetëm Admin): totali, sipas statusit, sipas kategorisë dhe sipas muajit.
export function getStats(): Promise<Stats> {
  return apiFetch<Stats>('/api/reports/stats')
}
