import type { AuthResponse, User } from '../types'
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

// Dalja: heq tokenin (nuk ka endpoint në backend, sepse tokenat nuk ruhen te serveri).
export function logout(): void {
  clearToken()
}
