import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import './Confetti.css'

const COLORS = ['var(--chart-new)', 'var(--chart-inprogress)', 'var(--chart-resolved)', 'var(--chart-rejected)', 'var(--accent)']
const PIECES = 26

// Një shpërthim i shkurtër konfeti (rreth 1 sekondë) kur një raport bëhet "U zgjidh". Pjesët janë të pandryshueshme (pa rastësi),
// luajnë vetëm transform dhe opacity, dhe nuk shfaqen fare për kush ka "reduce motion".
function Confetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1500)
    return () => window.clearTimeout(timer)
  }, [onDone])

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: PIECES }, (_, i) => {
        const angle = (i / PIECES) * Math.PI * 2 + (i % 3) * 0.25
        const distance = 110 + ((i * 37) % 110)
        const style = {
          '--dx': `${Math.round(Math.cos(angle) * distance)}px`,
          '--dy': `${Math.round(Math.sin(angle) * distance - 70)}px`,
          '--rot': `${(i * 83) % 360}deg`,
          background: COLORS[i % COLORS.length],
          animationDelay: `${(i % 5) * 25}ms`,
          width: 6 + (i % 3) * 2,
          height: 9 + (i % 4) * 2,
        } as CSSProperties
        return <i key={i} className="confetti-piece" style={style} />
      })}
    </div>
  )
}

export default Confetti
