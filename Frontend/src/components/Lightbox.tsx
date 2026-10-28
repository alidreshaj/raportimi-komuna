import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import AuthImage from './AuthImage'
import './Lightbox.css'

export interface LightboxPhoto {
  url: string
  alt: string
}

interface LightboxProps {
  photos: LightboxPhoto[]
  index: number
  onChange: (index: number) => void
  onClose: () => void
}

// Galeria e madhe e fotove: shigjetat e tastierës (ose butonat) ndërrojnë foton, Esc mbyll, klikimi mbi foto e zmadhon (2x) aty ku klikove,
// dhe në telefon rrëshqit majtas/djathtas. Fokusi mbetet brenda galerisë dhe kthehet te miniatura kur mbyllet.
function Lightbox({ photos, index, onChange, onClose }: LightboxProps) {
  const [closing, setClosing] = useState(false)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const startX = useRef<number | null>(null)
  const lastFocus = useRef<Element | null>(null)

  const last = photos.length - 1

  function requestClose() {
    setClosing(true)
    window.setTimeout(onClose, 150)
  }

  function go(next: number) {
    if (next < 0 || next > last) return
    setZoom(null)
    onChange(next)
  }

  // Fokusi te butoni "Mbyll" kur hapet; i kthehet elementit të mëparshëm kur mbyllet. Faqja pas galerisë nuk lëviz.
  useEffect(() => {
    lastFocus.current = document.activeElement
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      ;(lastFocus.current as HTMLElement | null)?.focus?.()
    }
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      requestClose()
    } else if (event.key === 'ArrowLeft') {
      go(index - 1)
    } else if (event.key === 'ArrowRight') {
      go(index + 1)
    } else if (event.key === 'Tab') {
      // Fokusi qarkullon vetëm mes butonave të galerisë.
      const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const lastEl = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        lastEl.focus()
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  // Rrëshqitja në telefon: një lëvizje horizontale mbi 50 px ndërron foton.
  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    startX.current = event.clientX
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startX.current === null || zoom) return
    const delta = event.clientX - startX.current
    startX.current = null
    if (Math.abs(delta) > 50) go(delta < 0 ? index + 1 : index - 1)
  }

  // Klikimi mbi foto: zmadhim 2x me qendër aty ku klikove (përsëri për ta kthyer).
  function toggleZoom(event: MouseEvent<HTMLDivElement>) {
    if (zoom) {
      setZoom(null)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    setZoom({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 })
  }

  const photo = photos[index]

  return (
    <div
      className="lightbox"
      data-closing={closing}
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria e fotove, foto ${index + 1} nga ${photos.length}`}
      onKeyDown={handleKeyDown}
    >
      <div className="lightbox-backdrop" onClick={requestClose} />

      <button ref={closeRef} type="button" className="lightbox-btn lightbox-close" aria-label="Mbyll galerinë" onClick={requestClose}>
        <X size={22} aria-hidden="true" />
      </button>

      <div className="lightbox-counter" aria-live="polite">
        {index + 1} / {photos.length}
      </div>

      {index > 0 && (
        <button type="button" className="lightbox-btn lightbox-prev" aria-label="Foto e mëparshme" onClick={() => go(index - 1)}>
          <ChevronLeft size={26} aria-hidden="true" />
        </button>
      )}
      {index < last && (
        <button type="button" className="lightbox-btn lightbox-next" aria-label="Foto tjetër" onClick={() => go(index + 1)}>
          <ChevronRight size={26} aria-hidden="true" />
        </button>
      )}

      <div className="lightbox-stage" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
        <div
          key={photo.url}
          className={`lightbox-image${zoom ? ' lightbox-image--zoomed' : ''}`}
          style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          onClick={toggleZoom}
        >
          <AuthImage url={photo.url} alt={photo.alt} />
        </div>
      </div>

      <span className="lightbox-hint" aria-hidden="true">
        {zoom ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
        {zoom ? 'Kliko për ta zvogëluar' : 'Kliko foton për ta zmadhuar'}
      </span>
    </div>
  )
}

export default Lightbox
