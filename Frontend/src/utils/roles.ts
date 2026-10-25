import type { Role } from '../types'

// Adresa e detajeve të një raporti sipas rolit (qytetari dhe admini kanë faqe të ndryshme).
export function reportPathFor(role: Role, reportId: number): string {
  return role === 'Admin' ? `/admin/raportet/${reportId}` : `/raportet/${reportId}`
}

// Faqja kryesore e secilit rol: ku shkon përdoruesi pas hyrjes dhe kur hap një adresë që nuk e ka.
export function homePathFor(role: Role): string {
  return role === 'Admin' ? '/admin/raportet' : '/raportet'
}
