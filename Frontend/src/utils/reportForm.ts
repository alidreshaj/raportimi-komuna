import type { GeoPoint, Report, ReportInput } from '../types'

// Gjithçka e përbashkët për formën e raportit (krijim dhe ndryshim).

// Kufijtë e gjatësisë, të njëjtë me ata të backend-it (CreateReportDto dhe UpdateReportDto).
export const LIMITS = { title: 200, description: 2000, location: 300 }

// Fushat e formës në një objekt. categoryId ruhet si tekst, sepse <select> punon me tekst.
// point është pika në hartë (opsionale): null kur qytetari nuk ka zgjedhur asnjë.
export interface ReportFormState {
  title: string
  categoryId: string
  description: string
  location: string
  point: GeoPoint | null
}

export const EMPTY_REPORT_FORM: ReportFormState = {
  title: '',
  categoryId: '',
  description: '',
  location: '',
  point: null,
}

// Forma e mbushur me të dhënat e një raporti ekzistues (për ndryshimin).
export function formFromReport(report: Report): ReportFormState {
  return {
    title: report.title,
    categoryId: String(report.categoryId),
    description: report.description,
    location: report.location,
    // Raportet e vjetra nuk kanë koordinata: pika mbetet bosh.
    point:
      report.latitude !== null && report.longitude !== null
        ? { latitude: report.latitude, longitude: report.longitude }
        : null,
  }
}

// Validim në shqip para dërgimit. Kthen mesazhin e parë të gabimit, ose null nëse gjithçka është në rregull.
export function validateReportForm(form: ReportFormState): string | null {
  if (!form.title.trim()) return 'Shkruaj titullin.'
  if (!form.categoryId) return 'Zgjidh kategorinë.'
  if (!form.description.trim()) return 'Shkruaj përshkrimin.'
  if (!form.location.trim()) return 'Shkruaj vendin.'
  return null
}

// Forma → ajo që pret backend-i (pa hapësira të tepërta, me kategorinë si numër).
export function toReportInput(form: ReportFormState): ReportInput {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    location: form.location.trim(),
    categoryId: Number(form.categoryId),
    // null e heq pikën (te ndryshimi), kështu qytetari mund ta fshijë vendndodhjen që kishte vendosur.
    latitude: form.point?.latitude ?? null,
    longitude: form.point?.longitude ?? null,
  }
}
