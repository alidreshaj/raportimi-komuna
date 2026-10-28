import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../context/useAuth'
import { homePathFor } from '../utils/roles'
import './NotFoundPage.css'

// Adresa nuk ekziston: mesazh i qartë dhe rrugë kthimi.
function NotFoundPage() {
  const { user } = useAuth()

  return (
    <main id="main" className="notfound">
      <span className="notfound-icon">
        <Compass size={36} aria-hidden="true" />
      </span>
      <p className="notfound-code">404</p>
      <h1>Kjo faqe nuk u gjet</h1>
      <p className="notfound-text">Adresa mund të jetë shkruar gabim ose faqja është hequr.</p>
      <Link viewTransition to={user ? homePathFor(user.role) : '/'} className="btn btn-primary">
        {user ? 'Kthehu te raportet' : 'Kthehu në fillim'}
      </Link>
    </main>
  )
}

export default NotFoundPage
