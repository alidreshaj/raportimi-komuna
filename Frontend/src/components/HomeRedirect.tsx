import { Navigate } from 'react-router'
import { useAuth } from '../context/useAuth'
import { homePathFor } from '../utils/roles'

// Çon përdoruesin te faqja kryesore e rolit të tij; pa sesion, te hyrja.
function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p style={{ padding: '48px 24px', textAlign: 'center' }}>Po ngarkohet...</p>
  }

  return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />
}

export default HomeRedirect
