// Rregullat e fotove, të njëjtat me ato të backend-it (ImageFileService).
// Këto kontrolle janë vetëm për lehtësi (mesazh i menjëhershëm); backend-i e kontrollon vetë përmbajtjen e vërtetë.

export const MAX_PHOTOS = 5
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB

const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png']

// Kthen mesazhin e gabimit në shqip, ose null nëse fotoja është në rregull.
export function validatePhoto(file: File): string | null {
  const name = file.name.toLowerCase()
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))

  if (!ALLOWED_TYPES.includes(file.type) || !hasAllowedExtension) {
    return `"${file.name}": lejohen vetëm foto JPG ose PNG.`
  }

  if (file.size === 0) {
    return `"${file.name}": file-i është bosh.`
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return `"${file.name}": kalon madhësinë maksimale prej 5 MB.`
  }

  return null
}

// 1887436 → "1.8 MB", 204800 → "200 KB"
export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// Dy file konsiderohen i njëjti nëse kanë të njëjtin emër, madhësi dhe datë ndryshimi.
export function isSameFile(a: File, b: File): boolean {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
}
