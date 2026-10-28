import { useState } from 'react'
import type { FormEvent } from 'react'
import { KeyRound, UserRound } from 'lucide-react'
import { changePassword, updateProfile } from '../api/auth'
import LoadingButton from '../components/LoadingButton'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import './AccountPage.css'

const MIN_PASSWORD = 8
const MAX_NAME = 100

// "Llogaria ime": ndrysho emrin dhe fjalëkalimin. Email-i dhe roli shihen por nuk ndryshohen.
function AccountPage() {
  const { user, updateUser } = useAuth()
  const toast = useToast()

  // ---- Profili ----
  const [name, setName] = useState(user?.name ?? '')
  const [nameError, setNameError] = useState<string | null>(null)
  const [savingName, setSavingName] = useState(false)
  // Pas ruajtjes butoni tregon një shenjë kontrolli për një çast.
  const [nameSaved, setNameSaved] = useState(false)

  async function handleName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Shkruaj emrin.')
      return
    }

    setNameError(null)
    setSavingName(true)

    try {
      // Serveri kthen token të ri (emri është brenda tokenit); api/auth.ts e ruan, ne vetëm përditësojmë ekranin.
      const result = await updateProfile(trimmed)
      updateUser({ name: result.name, email: result.email, role: result.role })
      setName(result.name)
      toast.show('Emri u ruajt.')
      setNameSaved(true)
      window.setTimeout(() => setNameSaved(false), 1800)
    } catch (e) {
      setNameError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
    } finally {
      setSavingName(false)
    }
  }

  // ---- Fjalëkalimi ----
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!current) {
      setPasswordError('Shkruaj fjalëkalimin aktual.')
      return
    }
    if (next.length < MIN_PASSWORD) {
      setPasswordError(`Fjalëkalimi i ri duhet të ketë të paktën ${MIN_PASSWORD} karaktere.`)
      return
    }
    if (next !== confirm) {
      setPasswordError('Fjalëkalimet e reja nuk përputhen.')
      return
    }

    setPasswordError(null)
    setSavingPassword(true)

    try {
      await changePassword(current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      toast.show('Fjalëkalimi u ndryshua.')
      setPasswordSaved(true)
      window.setTimeout(() => setPasswordSaved(false), 1800)
    } catch (e) {
      // P.sh. "Fjalëkalimi aktual është i gabuar." (400, kështu sesioni nuk mbyllet).
      setPasswordError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <>
      <div className="reports-header">
        <div>
          <h1 className="page-title">Llogaria ime</h1>
          <p className="page-subtitle">Ndrysho emrin dhe fjalëkalimin.</p>
        </div>
      </div>

      <div className="account-grid fade-in">
        <form className="account-card" onSubmit={handleName} noValidate>
          <h2 className="account-card-title">
            <UserRound size={20} aria-hidden="true" />
            Profili
          </h2>

          <div className="field">
            <label htmlFor="name">Emri</label>
            <input id="name" type="text" maxLength={MAX_NAME} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={user?.email ?? ''} disabled />
            <span className="field-hint">Email-i nuk ndryshohet.</span>
          </div>

          <div className="field">
            <label htmlFor="role">Roli</label>
            <input id="role" type="text" value={user?.role === 'Admin' ? 'Administrator' : 'Qytetar'} disabled />
          </div>

          {nameError && (
            <p className="form-error" role="alert">
              {nameError}
            </p>
          )}

          <div className="account-actions">
            <LoadingButton type="submit" loading={savingName} loadingLabel="Duke ruajtur..." success={nameSaved} disabled={name.trim() === user?.name}>
              Ruaj emrin
            </LoadingButton>
          </div>
        </form>

        <form className="account-card" onSubmit={handlePassword} noValidate>
          <h2 className="account-card-title">
            <KeyRound size={20} aria-hidden="true" />
            Fjalëkalimi
          </h2>

          <div className="field">
            <label htmlFor="current">Fjalëkalimi aktual</label>
            <input id="current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="new">Fjalëkalimi i ri</label>
            <input
              id="new"
              type="password"
              autoComplete="new-password"
              placeholder="Të paktën 8 karaktere"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="confirm">Përsërite fjalëkalimin e ri</label>
            <input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>

          {passwordError && (
            <p className="form-error" role="alert">
              {passwordError}
            </p>
          )}

          <div className="account-actions">
            <LoadingButton type="submit" loading={savingPassword} loadingLabel="Duke ruajtur..." success={passwordSaved}>
              Ndrysho fjalëkalimin
            </LoadingButton>
          </div>
        </form>
      </div>
    </>
  )
}

export default AccountPage
