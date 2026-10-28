import { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import type { ImageInfo } from '../types'
import AuthImage from './AuthImage'
import Lightbox from './Lightbox'

// Fotot e një raporti si miniatura të klikueshme; kliko një dhe hapet galeria e madhe (zmadhim, shigjeta, tastierë).
function PhotoGallery({ images, title }: { images: ImageInfo[]; title: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  const photos = images.map((image, index) => ({ url: image.url, alt: `Foto ${index + 1} e raportit "${title}"` }))

  return (
    <>
      <ul className="detail-photos" aria-label="Fotot e raportit">
        {images.map((image, index) => (
          <li key={image.id} className="detail-photo">
            <button type="button" className="detail-photo-btn" aria-label={`Zmadho foton ${index + 1}`} onClick={() => setOpenIndex(index)}>
              <AuthImage url={image.url} alt={photos[index].alt} />
              <span className="detail-photo-zoom" aria-hidden="true">
                <ZoomIn size={18} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && <Lightbox photos={photos} index={openIndex} onChange={setOpenIndex} onClose={() => setOpenIndex(null)} />}
    </>
  )
}

export default PhotoGallery
