import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getMe, login as apiLogin, logout as apiLogout } from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'
import { getToken } from '../api/token'
import type { SessionUser } from '../types'
import { AuthContext } from './auth-context'

// Mban sesionin e përdoruesit për gjithë aplikacionin. Vendoset një herë, lart te aplikacioni.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  // Nëse ka token të ruajtur, duhet ta kontrollojmë para se të vendosim nëse je i loguar.
  const [loading, setLoading] = useState<boolean>(() => getToken() !== null)

  // Rikthen sesionin kur faqja hapet (p.sh. pas rifreskimit).
  useEffect(() => {
    if (getToken() === null) {
      return
    }

    let cancelled = false

    getMe()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        // Tokeni ka skaduar ose është i prishur: apiFetch e ka fshirë tashmë. Mbetemi pa sesion.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Nëse çfarëdo kërkese kthen 401 me token (sesioni skadoi), pastrojmë përdoruesin.
  // Faqet e mbrojtura e shohin user = null dhe të çojnë vetë te hyrja.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  async function login(email: string, password: string): Promise<void> {
    const result = await apiLogin(email, password)
    setUser({ name: result.name, email: result.email, role: result.role })
  }

  function logout(): void {
    apiLogout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}
