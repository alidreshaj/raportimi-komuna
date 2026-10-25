import type { NotificationList } from '../types'
import { apiFetch } from './client'

// Njoftimet e mia (më të rejat të parat) dhe sa janë të palexuara gjithsej.
export function getNotifications(limit = 20): Promise<NotificationList> {
  return apiFetch<NotificationList>(`/api/notifications?limit=${limit}`)
}

// Vetëm numri i të palexuarave: kërkesë shumë e lehtë, për pyetjen periodike të zilës.
export function getUnreadCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>('/api/notifications/unread-count')
}

// E shënon një njoftim si të lexuar.
export function markNotificationRead(id: number): Promise<void> {
  return apiFetch<void>(`/api/notifications/${id}/read`, { method: 'POST' })
}

// I shënon të gjitha njoftimet e mia si të lexuara.
export function markAllNotificationsRead(): Promise<void> {
  return apiFetch<void>('/api/notifications/read-all', { method: 'POST' })
}
