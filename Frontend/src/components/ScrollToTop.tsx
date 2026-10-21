import { useEffect } from 'react'
import { useLocation } from 'react-router'

// Kur kalon nga një faqe te tjetra, React Router nuk e kthen vetë faqen lart: mbetet aty ku ishe zhvendosur.
// Ky komponent nuk shfaq asgjë; vetëm e kthen faqen lart sa herë ndryshon adresa.
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default ScrollToTop
