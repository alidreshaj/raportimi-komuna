// Tipet e të dhënave që kthen backend-i. Pasqyrojnë DTO-të e C# (kujdes: emrat janë të njëjtët me JSON-in).

export type Role = 'Citizen' | 'Admin'

// Vetëm këto katër vlera lejohen (si enum te C#).
export type ReportStatus = 'New' | 'InProgress' | 'Resolved' | 'Rejected'

// Përgjigja e POST /api/auth/login
export interface AuthResponse {
  token: string
  expiresAt: string
  name: string
  email: string
  role: Role
}

// Përgjigja e POST /api/auth/register
export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface Category {
  id: number
  name: string
}

export interface ImageInfo {
  id: number
  uploadedAt: string
  // Adresa relative, p.sh. /api/reports/5/images/12 (kërkon token për ta marrë)
  url: string
}

export interface Report {
  id: number
  title: string
  description: string
  location: string
  latitude: number | null
  longitude: number | null
  status: ReportStatus
  createdAt: string
  updatedAt: string
  categoryId: number
  categoryName: string
  reporterName: string
  images: ImageInfo[]
}

export interface CommentItem {
  id: number
  text: string
  createdAt: string
  authorName: string
  authorRole: Role
}

// Çfarë dërgohet për të krijuar ose ndryshuar një raport (POST dhe PUT /api/reports).
export interface ReportInput {
  title: string
  description: string
  location: string
  categoryId: number
  latitude?: number | null
  longitude?: number | null
}
