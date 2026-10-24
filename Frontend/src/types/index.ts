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

// Përdoruesi i loguar, siç e mban aplikacioni (nga login ose nga GET /api/auth/me). Pa token.
export interface SessionUser {
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

// Një pikë në hartë (koordinata gjeografike).
export interface GeoPoint {
  latitude: number
  longitude: number
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
  commentCount: number
  images: ImageInfo[]
}

export interface CommentItem {
  id: number
  text: string
  createdAt: string
  authorName: string
  authorRole: Role
}

// Një ndryshim statusi te historiku i raportit (GET /api/reports/{id}/history), nga më i vjetri te më i riu.
export interface StatusHistoryItem {
  id: number
  fromStatus: ReportStatus
  toStatus: ReportStatus
  changedAt: string
  changedByName: string
}

// Statistikat për komunën (GET /api/reports/stats, vetëm Admin): vetëm numra.
export interface StatusCount {
  status: ReportStatus
  count: number
}

export interface CategoryCount {
  categoryId: number
  categoryName: string
  count: number
}

export interface MonthCount {
  year: number
  // 1-12
  month: number
  count: number
}

export interface Stats {
  total: number
  // Raporte të reja që presin mbi 3 ditë
  lateNew: number
  byStatus: StatusCount[]
  byCategory: CategoryCount[]
  // 6 muajt e fundit, nga më i vjetri
  byMonth: MonthCount[]
}

// Një faqe e listës së raporteve (GET /api/reports dhe /api/reports/my).
export interface ReportPage {
  items: Report[]
  page: number
  pageSize: number
  // Sa raporte ka gjithsej me filtrat (jo vetëm në këtë faqe)
  totalCount: number
  totalPages: number
  // Sa raporte ka për secilin status sipas filtrave të tjerë (pa statusin): për çipat
  statusCounts: StatusCount[]
}

// Një raport për hartën (GET /api/reports/map): vetëm ç'i duhet shenjës dhe kartës së saj.
export interface ReportPin {
  id: number
  title: string
  location: string
  status: ReportStatus
  categoryName: string
  createdAt: string
  latitude: number
  longitude: number
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
