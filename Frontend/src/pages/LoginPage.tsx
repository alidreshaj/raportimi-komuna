import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import AuthShell from '../components/AuthShell'
import LoadingButton from '../components/LoadingButton'
import { useAuth } from '../context/useAuth'
import { homePathFor } from '../utils/roles'

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Faqja ku ishe duke shkuar kur të ridrejtuan këtu (nëse ka), përndryshe "/" që të çon te faqja e rolit tënd.
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  // Nëse je i loguar tashmë, nuk ka kuptim të shohësh hyrjen.
  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // pa këtë shfletuesi do ta rifreskonte faqen

    if (!email.trim() || !password) {
      setError('Shkruaj email-in dhe fjalëkalimin.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await login(email.trim(), password)
      navigate(from, { replace: true, viewTransition: true })
    } catch (e) {
      // Mesazhi vjen nga serveri (p.sh. "Email ose password i gabuar.") ose nga apiFetch.
      setError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div>
          <h2>Hyr në llogari</h2>
          <p className="auth-subtitle">Për të dërguar dhe ndjekur raportet e tua.</p>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="emri@shembull.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Fjalëkalimi</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Të paktën 8 karaktere"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <p className="auth-forgot">
          <Link viewTransition to="/harrova-fjalekalimin">Harrove fjalëkalimin?</Link>
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <LoadingButton type="submit" loading={submitting} loadingLabel="Duke hyrë...">
          Hyr
        </LoadingButton>

        <div className="auth-divider" />

        <p className="auth-alt">
          Nuk ke llogari? <Link viewTransition to="/regjistrohu">Regjistrohu</Link>
        </p>
      </form>
    </AuthShell>
  )
}

export default LoginPage
