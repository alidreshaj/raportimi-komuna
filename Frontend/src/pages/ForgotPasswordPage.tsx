import { useState } from 'react'
import type { FormEvent } from 'react'
import { MailCheck } from 'lucide-react'
import { Link, Navigate } from 'react-router'
import { forgotPassword } from '../api/auth'
import AuthShell from '../components/AuthShell'
import LoadingButton from '../components/LoadingButton'
import { useAuth } from '../context/useAuth'
import { homePathFor } from '../utils/roles'

// "Harrova fjalëkalimin": shkruan email-in dhe merr një lidhje për ta vendosur të riun. Përgjigjja është gjithmonë e njëjtë,
// edhe kur email-i nuk ekziston, që askush të mos zbulojë cilat email-e janë të regjistruara.
function ForgotPasswordPage() {
  const { user } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim()) {
      setError('Shkruaj email-in.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await forgotPassword(email.trim())
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      {sent ? (
        <div className="auth-card auth-notice" role="status">
          <MailCheck size={36} aria-hidden="true" />
          <h2>Kontrollo email-in</h2>
          <p>
            Nëse ekziston një llogari me këtë email, do të marrësh një lidhje për të vendosur fjalëkalimin e ri. Lidhja vlen 30 minuta.
          </p>
          <Link viewTransition to="/login">Kthehu te hyrja</Link>
        </div>
      ) : (
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div>
            <h2>Harrova fjalëkalimin</h2>
            <p className="auth-subtitle">Shkruaj email-in dhe të dërgojmë një lidhje për ta vendosur të riun.</p>
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

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <LoadingButton type="submit" loading={submitting} loadingLabel="Duke dërguar...">
            Dërgo lidhjen
          </LoadingButton>

          <div className="auth-divider" />

          <p className="auth-alt">
            E mbajte mend? <Link viewTransition to="/login">Hyr</Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}

export default ForgotPasswordPage
