import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface AnimatedNumberProps {
  value: number
  // Ç'shtohet pas numrit, p.sh. "%".
  suffix?: string
  duration?: number
}

// Numër që "numërohet" nga 0 (ose nga vlera e mëparshme) te vlera e re, me një lëvizje që ngadalësohet në fund.
// Kush ka "reduce motion" e sheh menjëherë vlerën përfundimtare.
function AnimatedNumber({ value, suffix = '', duration = 800 }: AnimatedNumberProps) {
  const reduce = prefersReducedMotion()
  const [shown, setShown] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (reduce) return

    const start = performance.now()
    const origin = from.current
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(origin + (value - origin) * eased)
      from.current = current
      setShown(current)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [value, duration, reduce])

  return (
    <>
      {reduce ? value : shown}
      {suffix}
    </>
  )
}

export default AnimatedNumber
