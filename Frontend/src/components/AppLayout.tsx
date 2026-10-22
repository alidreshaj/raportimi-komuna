import { BarChart3, ClipboardList, Landmark, List, LogOut, PlusCircle } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/useAuth'
import { initialsOf } from '../utils/format'
import { homePathFor } from '../utils/roles'
import './AppLayout.css'

// Skeleti i faqeve të brendshme: menyja lart dhe poshtë saj faqja aktuale (Outlet).
function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onNewReport = pathname === '/raportet/i-ri'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <NavLink to={homePathFor(user?.role ?? 'Citizen')} className="app-brand">
            <span className="app-brand-mark">
              <Landmark size={20} strokeWidth={2} aria-hidden="true" />
            </span>
            <span>Raportimi në komunë</span>
          </NavLink>

          <nav className="app-nav" aria-label="Menyja kryesore">
            {user?.role === 'Admin' ? (
              <>
                <NavLink to="/admin/raportet" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <List size={17} aria-hidden="true" />
                  Të gjitha raportet
                </NavLink>
                <NavLink to="/admin/statistika" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <BarChart3 size={17} aria-hidden="true" />
                  Statistika
                </NavLink>
              </>
            ) : (
              <>
                {/* "Raportet e mia" është aktive te lista dhe te detajet, por jo te forma e re */}
                <NavLink
                  to="/raportet"
                  className={({ isActive }) => (isActive && !onNewReport ? 'active' : undefined)}
                >
                  <ClipboardList size={17} aria-hidden="true" />
                  Raportet e mia
                </NavLink>
                <NavLink to="/raportet/i-ri" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <PlusCircle size={17} aria-hidden="true" />
                  Raporto një problem
                </NavLink>
              </>
            )}
          </nav>

          <div className="app-user">
            <span className="app-avatar" aria-hidden="true">
              {initialsOf(user?.name ?? '')}
            </span>
            <span className="app-user-text">
              <span className="app-user-name">{user?.name}</span>
              <span className="app-user-role">{user?.role === 'Admin' ? 'Administrator' : 'Qytetar'}</span>
            </span>
            <button type="button" className="btn-outline" onClick={handleLogout}>
              <LogOut size={16} aria-hidden="true" />
              Dil
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* key = adresa: sa herë ndërron faqja, ky bllok krijohet përsëri dhe luan animacionin e hyrjes. */}
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
    </>
  )
}

export default AppLayout
