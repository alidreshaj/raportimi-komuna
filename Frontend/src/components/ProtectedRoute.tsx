import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/useAuth'

// "Roja" e faqeve që kërkojnë hyrje. Faqet brenda saj shfaqen vetëm kur ka sesion.
function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Po kontrollojmë tokenin e ruajtur: mos ridrejto ende, përndryshe çdo rifreskim të çon te hyrja.
  if (loading) {
    return <p style={{ padding: '48px 24px', textAlign: 'center' }}>Po ngarkohet...</p>
  }

  if (!user) {
    // E ruajmë faqen ku ishe duke shkuar, që pas hyrjes të të kthejmë atje.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export default ProtectedRoute
