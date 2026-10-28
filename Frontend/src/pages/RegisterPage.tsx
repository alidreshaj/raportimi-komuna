import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { register } from '../api/auth'
import AuthShell from '../components/AuthShell'
import LoadingButton from '../components/LoadingButton'
import { useAuth } from '../context/useAuth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Validim në shqip para dërgimit. Kthen mesazhin e parë të gabimit, ose null nëse gjithçka është në rregull.
function validate(name: string, email: string, password: string): string | null {
  if (!name.trim()) return 'Shkruaj emrin tënd.'
  if (!EMAIL_PATTERN.test(email.trim())) return 'Shkruaj një email të vlefshëm.'
  if (password.length < 8) return 'Fjalëkalimi duhet të ketë të paktën 8 karaktere.'
  return null
}

function RegisterPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/raportet" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const problem = validate(name, email, password)
    if (problem) {
      setError(problem)
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await register(name.trim(), email.trim(), password)
    } catch (e) {
      // P.sh. 409: "Ky email është i regjistruar tashmë."
      setError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
      setSubmitting(false)
      return
    }

    // Llogaria u krijua. Hyjmë automatikisht, që përdoruesi të mos shkruajë gjithçka përsëri.
    try {
      await login(email.trim(), password)
      navigate('/', { replace: true, viewTransition: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }

  return (
    <AuthShell>
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div>
          <h2>Krijo llogari</h2>
          <p className="auth-subtitle">Regjistrohu për të dërguar raporte te komuna.</p>
        </div>

        <div className="field">
          <label htmlFor="name">Emri</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            placeholder="Emri dhe mbiemri"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            maxLength={200}
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
            autoComplete="new-password"
            maxLength={100}
            placeholder="Të paktën 8 karaktere"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <LoadingButton type="submit" loading={submitting} loadingLabel="Duke krijuar llogarinë...">
          Regjistrohu
        </LoadingButton>

        <div className="auth-divider" />

        <p className="auth-alt">
          Ke llogari? <Link viewTransition to="/login">Hyr</Link>
        </p>
      </form>
    </AuthShell>
  )
}

export default RegisterPage
