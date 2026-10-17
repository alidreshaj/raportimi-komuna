import type { CommentItem } from '../types'
import { apiFetch } from './client'

// Komentet e një raporti, nga më i vjetri te më i riu (i zoti i raportit ose Admin).
export function getComments(reportId: number): Promise<CommentItem[]> {
  return apiFetch<CommentItem[]>(`/api/reports/${reportId}/comments`)
}

// Shton një koment (mesazh) te raporti. Lejohet edhe kur raporti është i mbyllur.
export function addComment(reportId: number, text: string): Promise<CommentItem> {
  return apiFetch<CommentItem>(`/api/reports/${reportId}/comments`, {
    method: 'POST',
    body: { text },
  })
}
