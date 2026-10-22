import { BarChart3, ClipboardList, Landmark, List, LogOut, PlusCircle } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/useAuth'
import { homePathFor } from '../utils/roles'
import './AppLayout.css'

// Skeleti i faqeve të brendshme: menyja lart dhe poshtë saj faqja aktuale (Outlet).
function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const onNewReport = useLocation().pathname === '/raportet/i-ri'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <NavLink to={homePathFor(user?.role ?? 'Citizen')} className="app-brand">
            <Landmark size={26} strokeWidth={1.8} aria-hidden="true" />
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
            <span>{user?.name}</span>
            <button type="button" className="btn-outline" onClick={handleLogout}>
              <LogOut size={16} aria-hidden="true" />
              Dil
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </>
  )
}

export default AppLayout
