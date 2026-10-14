import type { Category } from '../types'
import { apiFetch } from './client'

// Lista e kategorive (publike), e renditur sipas emrit nga backend-i.
export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/api/categories')
}
