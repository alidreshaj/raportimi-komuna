import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

interface RevealProps {
  children: ReactNode
  className?: string
  // Vonesa në ms, që disa seksione afër njëri-tjetrit të hyjnë njëri pas tjetrit.
  delay?: number
}

// Mbështjell një seksion që hyn butë (zbehje dhe ngritje e vogël) kur futet te ekrani. Kush ka "reduce motion" e sheh menjëherë.
function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const { ref, seen } = useInView<HTMLDivElement>('-40px')

  return (
    <div
      ref={ref}
      className={`reveal${seen ? ' reveal--in' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

export default Reveal
