import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { resetPassword } from '../api/auth'
import AuthShell from '../components/AuthShell'
import { useToast } from '../context/useToast'

const MIN_PASSWORD = 8

// Faqja ku të çon lidhja e rivendosjes (/rivendos-fjalekalimin?token=...): vendos fjalëkalimin e ri dhe të kthen te hyrja.
function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const toast = useToast()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password.length < MIN_PASSWORD) {
      setError(`Fjalëkalimi duhet të ketë të paktën ${MIN_PASSWORD} karaktere.`)
      return
    }
    if (password !== confirm) {
      setError('Fjalëkalimet nuk përputhen.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await resetPassword(token, password)
      toast.show('Fjalëkalimi u ndryshua. Hyr me fjalëkalimin e ri.')
      navigate('/login', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
      setSubmitting(false)
    }
  }

  // Pa kod te adresa nuk ka çfarë të bëjmë këtu.
  if (!token) {
    return (
      <AuthShell>
        <div className="auth-card auth-notice">
          <h2>Lidhje e pavlefshme</h2>
          <p>Kjo lidhje nuk ka kod rivendosjeje. Kërko një të re.</p>
          <Link to="/harrova-fjalekalimin">Kërko lidhje të re</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div>
          <h2>Fjalëkalim i ri</h2>
          <p className="auth-subtitle">Zgjidh një fjalëkalim të ri për llogarinë tënde.</p>
        </div>

        <div className="field">
          <label htmlFor="password">Fjalëkalimi i ri</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Të paktën 8 karaktere"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="confirm">Përsërite fjalëkalimin</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}{' '}
            {error.includes('Lidhja') && <Link to="/harrova-fjalekalimin">Kërko një të re.</Link>}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Duke ruajtur...' : 'Ruaj fjalëkalimin'}
        </button>
      </form>
    </AuthShell>
  )
}

export default ResetPasswordPage
