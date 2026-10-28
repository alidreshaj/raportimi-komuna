import type { ImageInfo } from '../types'
import { apiFetchBlob, apiUpload } from './client'

// Ngarkon foto te raporti (vetëm i zoti, vetëm kur raporti është New). Gjithçka ose asgjë:
// nëse një foto është e pavlefshme, serveri nuk ruan asnjë.
export function uploadImages(reportId: number, files: File[], onProgress?: (percent: number) => void): Promise<ImageInfo[]> {
  // FormData = trupi "multipart". Fusha duhet të quhet "files", siç e pret backend-i.
  const body = new FormData()
  for (const file of files) {
    body.append('files', file)
  }

  return apiUpload<ImageInfo[]>(`/api/reports/${reportId}/images`, body, onProgress)
}

// Merr bajtet e një foto-je të mbrojtur. "url" është adresa relative nga ImageInfo, p.sh. /api/reports/5/images/12.
export function fetchImageBlob(url: string): Promise<Blob> {
  return apiFetchBlob(url)
}
