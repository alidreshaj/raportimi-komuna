import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/useAuth'
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
          <NavLink to="/raportet" className="app-brand">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 21h18" />
              <path d="M5 21V10l7-5 7 5v11" />
              <path d="M9 21v-6h6v6" />
            </svg>
            <span>Raportimi në komunë</span>
          </NavLink>

          <nav className="app-nav" aria-label="Menyja kryesore">
            {/* "Raportet e mia" është aktive te lista dhe te detajet, por jo te forma e re */}
            <NavLink
              to="/raportet"
              className={({ isActive }) => (isActive && !onNewReport ? 'active' : undefined)}
            >
              Raportet e mia
            </NavLink>
            <NavLink to="/raportet/i-ri" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Raporto një problem
            </NavLink>
          </nav>

          <div className="app-user">
            <span>{user?.name}</span>
            <button type="button" className="btn-outline" onClick={handleLogout}>
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
