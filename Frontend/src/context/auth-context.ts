import { createContext } from 'react'
import type { SessionUser } from '../types'

// Çfarë ofron konteksti i sesionit te çdo komponent poshtë AuthProvider.
export interface AuthContextValue {
  // Përdoruesi i loguar, ose null nëse nuk ka sesion.
  user: SessionUser | null
  // true derisa aplikacioni kontrollon tokenin e ruajtur (para se të dimë nëse je i loguar).
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
