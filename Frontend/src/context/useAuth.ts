import { useContext } from 'react'
import { AuthContext } from './auth-context'
import type { AuthContextValue } from './auth-context'

// Mënyra e shkurtër që komponentët të lexojnë sesionin: const { user, login, logout } = useAuth()
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (value === null) {
    throw new Error('useAuth duhet përdorur brenda AuthProvider.')
  }
  return value
}
