import { useCallback, useEffect, useRef, useState } from 'react'

export type PopoverPhase = 'closed' | 'open' | 'closing'

// Gjendja e një paneli që hapet dhe mbyllet me animacion (zile, meny, paletë): 'open', pastaj 'closing' për pak çaste (që të luhet
// animacioni i mbylljes), pastaj 'closed' (hiqet nga faqja). Mbyllet me Esc ose duke klikuar jashtë `ref`-it.
export function usePopover(exitMs = 150) {
  const [phase, setPhase] = useState<PopoverPhase>('closed')
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)

  const open = useCallback(() => {
    window.clearTimeout(timer.current)
    setPhase('open')
  }, [])

  const close = useCallback(() => {
    setPhase((current) => (current === 'open' ? 'closing' : current))
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setPhase('closed'), exitMs)
  }, [exitMs])

  const toggle = useCallback(() => {
    if (phase === 'open') close()
    else open()
  }, [phase, open, close])

  // Esc dhe klikimi jashtë e mbyllin vetëm kur paneli është i hapur.
  useEffect(() => {
    if (phase !== 'open') return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [phase, close])

  // Kur komponenti hiqet, pastrojmë kohëmatësin.
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { phase, isOpen: phase !== 'closed', open, close, toggle, ref }
}
