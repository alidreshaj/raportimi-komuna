import type { CSSProperties } from 'react'
import './Skeleton.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  // Rrezja e cepave; për rreth përdor 999.
  radius?: number
  style?: CSSProperties
}

// Një kuti gri me shkëlqim që lëviz: zë vendin e përmbajtjes derisa të ngarkohet, kështu faqja nuk "kërcen" kur vjen.
// Është dekorative (aria-hidden); lexuesit e ekranit marrin një tekst "po ngarkohet" nga faqja.
function Skeleton({ width = '100%', height = 14, radius = 8, style }: SkeletonProps) {
  return <span className="skeleton" style={{ width, height, borderRadius: radius, ...style }} aria-hidden="true" />
}

export default Skeleton
