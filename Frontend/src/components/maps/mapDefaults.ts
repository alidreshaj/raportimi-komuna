// Qendra e paracaktuar e hartës: Peja. Përdoret kur nuk kemi koordinata të tjera.
export const DEFAULT_CENTER: [number, number] = [42.6593, 20.2887]
export const DEFAULT_ZOOM = 13

// Kosova përafërsisht (jug-perëndim dhe veri-lindje) me një rezervë të vogël rreth saj.
// Harta nuk lejohet të lëvizë përtej këtij drejtkëndëshi.
export const KOSOVO_BOUNDS: [[number, number], [number, number]] = [
  [41.65, 19.85],
  [43.45, 21.95],
]

// Zmadhimi më i vogël që lejohet. Në 8 shfaqet e gjithë Kosova edhe në një hartë të ulët, por jo më shumë se aq.
export const MIN_ZOOM = 8
