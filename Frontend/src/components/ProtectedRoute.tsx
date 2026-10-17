import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/useAuth'
import type { Role } from '../types'
import { homePathFor } from '../utils/roles'

// "Roja" e faqeve që kërkojnë hyrje. Faqet brenda saj shfaqen vetëm kur ka sesion.
// Me `role`, lejon vetëm atë rol; të tjerët çohen te faqja e tyre kryesore.
function ProtectedRoute({ role }: { role?: Role }) {
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

  // Roli i gabuar (p.sh. qytetari te /admin/...): API do të kthente 403, prandaj nuk e lejojmë fare.
  if (role && user.role !== role) {
    return <Navigate to={homePathFor(user.role)} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
