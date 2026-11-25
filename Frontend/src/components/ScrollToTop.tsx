import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import { createScrollMemory } from '../utils/scrollMemory'

const memory = createScrollMemory()

// Sa gjatë provojmë të kthehemi te pozicioni i vjetër, ndërsa faqja ngarkon të dhënat (skeletoni është më i shkurtër).
const RESTORE_TIMEOUT_MS = 1500

// React Router nuk e menaxhon vetë scroll-in kur përdoret <BrowserRouter>. Ky komponent nuk shfaq asgjë:
// - te një faqe e re (klikim lidhjeje) e kthen faqen lart;
// - te "Mbrapa"/"Përpara" (POP) e kthen aty ku ishte, p.sh. te lista pasi ke parë detajet e një raporti.
function ScrollToTop() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const keyRef = useRef(location.key)
  const previousPath = useRef(location.pathname)

  // Shfletuesi nuk duhet të provojë vetë: ai e bën para se React të vizatojë faqen dhe del gabim.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  // Pozicioni ruhet gjatë scroll-it, për hyrjen aktuale të historikut.
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => memory.save(keyRef.current, window.scrollY))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // useLayoutEffect: çelësi i ri dhe pozicioni i synuar lexohen menjëherë pas vizatimit, para se ngjarja e scroll-it
  // (faqja e re është më e shkurtër dhe shfletuesi e shkurton pozicionin) ta mbishkruajë vlerën e ruajtur.
  useLayoutEffect(() => {
    keyRef.current = location.key
    const pathChanged = previousPath.current !== location.pathname
    previousPath.current = location.pathname

    if (navigationType !== 'POP') {
      // Ndryshimi i filtrave te adresa (?status=...) nuk e lëviz faqen; vetëm kalimi te një faqe tjetër.
      if (pathChanged) window.scrollTo(0, 0)
      return
    }

    const target = memory.get(location.key) ?? 0
    const deadline = performance.now() + RESTORE_TIMEOUT_MS
    let frame = 0
    let cancelled = false
    const stop = () => {
      cancelled = true
    }

    // Faqja mund të mos jetë ende aq e gjatë sa duhet (të dhënat po vijnë): provojmë në çdo kornizë deri sa arrihet
    // pozicioni, deri në afat, ose deri sa përdoruesi të lëvizë vetë.
    const tryRestore = () => {
      if (cancelled) return
      window.scrollTo(0, target)
      if (Math.abs(window.scrollY - target) > 1 && performance.now() < deadline) {
        frame = requestAnimationFrame(tryRestore)
      }
    }
    tryRestore()

    const userEvents = ['wheel', 'touchstart', 'keydown'] as const
    userEvents.forEach((name) => window.addEventListener(name, stop, { passive: true, once: true }))
    return () => {
      stop()
      cancelAnimationFrame(frame)
      userEvents.forEach((name) => window.removeEventListener(name, stop))
    }
  }, [location.key, location.pathname, navigationType])

  return null
}

export default ScrollToTop
