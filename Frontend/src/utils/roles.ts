import type { Role } from '../types'

// Faqja kryesore e secilit rol: ku shkon përdoruesi pas hyrjes dhe kur hap një adresë që nuk e ka.
export function homePathFor(role: Role): string {
  return role === 'Admin' ? '/admin/raportet' : '/raportet'
}
