import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import './BackToTop.css'

// Shfaqet kur ke zbritur shumë dhe të kthen lart me një klikim. Respekton "reduce motion" (kthehet menjëherë).
function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function goUp() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  if (!visible) return null

  return (
    <button type="button" className="back-to-top" onClick={goUp} aria-label="Kthehu lart" title="Kthehu lart">
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  )
}

export default BackToTop
