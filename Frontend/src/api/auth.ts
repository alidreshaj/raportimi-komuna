import type { AuthResponse, Role, SessionUser, User } from '../types'
import { apiFetch } from './client'
import { clearToken, saveToken } from './token'

// Hyrja. Ruan tokenin automatikisht dhe kthen të dhënat e përdoruesit.
export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  saveToken(result.token)
  return result
}

// Regjistrimi krijon vetëm llogarinë (Citizen). Pas tij përdoruesi bën login.
export function register(name: string, email: string, password: string): Promise<User> {
  return apiFetch<User>('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  })
}

// Kush jam unë? Përdoret kur faqja hapet dhe ka token të ruajtur, për ta rikthyer sesionin.
// Kthen 401 (ApiError) nëse tokeni ka skaduar ose është i prishur.
export async function getMe(): Promise<SessionUser> {
  const me = await apiFetch<{ name: string; email: string; role: Role }>('/api/auth/me')
  return { name: me.name, email: me.email, role: me.role }
}

// Dalja: heq tokenin (nuk ka endpoint në backend, sepse tokenat nuk ruhen te serveri).
export function logout(): void {
  clearToken()
}
