import { useEffect, useState, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router'
import { getProgressSnapshot, pulseProgress, subscribeProgress } from '../utils/progress'
import './TopProgress.css'

type Phase = 'idle' | 'run' | 'done'

// Shirit i hollë lart që shfaqet kur ndërron faqja ose kur një kërkesë zgjat: ecën vetë, dhe kur mbaron plotësohet dhe zhduket.
// Kërkesat e shpejta (nën 150 ms) nuk e shfaqin fare, që të mos pulsojë shiriti kot.
function TopProgress() {
  const { busy } = useSyncExternalStore(subscribeProgress, getProgressSnapshot)
  const { pathname } = useLocation()
  const [phase, setPhase] = useState<Phase>('idle')

  // Çdo ndërrim faqeje jep një puls të shkurtër.
  useEffect(() => {
    pulseProgress(450)
  }, [pathname])

  useEffect(() => {
    if (busy) {
      const start = window.setTimeout(() => setPhase('run'), 150)
      return () => window.clearTimeout(start)
    }
    // Pa punë në vazhdim: nëse shiriti po ecte, e plotësojmë; përndryshe mbetet i fshehur.
    const finish = window.setTimeout(() => setPhase((current) => (current === 'run' ? 'done' : 'idle')), 0)
    return () => window.clearTimeout(finish)
  }, [busy])

  useEffect(() => {
    if (phase !== 'done') return
    const hide = window.setTimeout(() => setPhase('idle'), 350)
    return () => window.clearTimeout(hide)
  }, [phase])

  if (phase === 'idle') return null

  return (
    <div className="top-progress" aria-hidden="true">
      <div className={`top-progress-bar top-progress-bar--${phase}`} />
    </div>
  )
}

export default TopProgress
