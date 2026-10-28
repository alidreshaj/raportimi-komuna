import { useEffect, useState } from 'react'
import { BarChart3, ClipboardList, Landmark, List, PlusCircle } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/useAuth'
import BackToTop from './BackToTop'
import CommandPalette from './CommandPalette'
import NotificationBell from './NotificationBell'
import UserMenu from './UserMenu'
import { homePathFor } from '../utils/roles'
import './AppLayout.css'

// Skeleti i faqeve të brendshme: menyja lart dhe poshtë saj faqja aktuale (Outlet).
function AppLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  // Menyja merr hije dhe kufi vetëm pasi zbret faqja (lart është e pastër).
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const onNewReport = pathname === '/raportet/i-ri'

  return (
    <>
      <header className="app-header" data-scrolled={scrolled}>
        <div className="app-header-inner">
          <NavLink viewTransition to={homePathFor(user?.role ?? 'Citizen')} className="app-brand">
            <span className="app-brand-mark">
              <Landmark size={20} strokeWidth={2} aria-hidden="true" />
            </span>
            <span>Raportimi në komunë</span>
          </NavLink>

          <nav className="app-nav" aria-label="Menyja kryesore">
            {user?.role === 'Admin' ? (
              <>
                <NavLink viewTransition to="/admin/raportet" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <List size={17} aria-hidden="true" />
                  Të gjitha raportet
                </NavLink>
                <NavLink viewTransition to="/admin/statistika" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <BarChart3 size={17} aria-hidden="true" />
                  Statistika
                </NavLink>
              </>
            ) : (
              <>
                {/* "Raportet e mia" është aktive te lista dhe te detajet, por jo te forma e re */}
                <NavLink viewTransition
                  to="/raportet"
                  className={({ isActive }) => (isActive && !onNewReport ? 'active' : undefined)}
                >
                  <ClipboardList size={17} aria-hidden="true" />
                  Raportet e mia
                </NavLink>
                <NavLink viewTransition to="/raportet/i-ri" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <PlusCircle size={17} aria-hidden="true" />
                  Raporto një problem
                </NavLink>
              </>
            )}
          </nav>

          <div className="app-user">
            <CommandPalette />
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      <main id="main" className="app-main" tabIndex={-1}>
        {/* key = adresa: sa herë ndërron faqja, ky bllok krijohet përsëri dhe luan animacionin e hyrjes. */}
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>

      <BackToTop />
    </>
  )
}

export default AppLayout
