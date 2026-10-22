import { Construction, Droplets, Lightbulb, Tag, Trash2, Trees, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Një ikonë për secilën kategori fillestare, sipas emrit. Kategoritë e reja pa ikonë marrin një etiketë të përgjithshme.
const ICONS: Record<string, LucideIcon> = {
  rrugë: Construction,
  ndriçim: Lightbulb,
  mbeturina: Trash2,
  ujë: Droplets,
  kanalizim: Waves,
  'hapësira publike': Trees,
}

// Ikona e kategorisë së një raporti. Është dekorative: emri i kategorisë shkruhet gjithmonë pranë saj.
function CategoryIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = ICONS[name.trim().toLowerCase()] ?? Tag
  return <Icon size={size} strokeWidth={2} aria-hidden="true" />
}

export default CategoryIcon
