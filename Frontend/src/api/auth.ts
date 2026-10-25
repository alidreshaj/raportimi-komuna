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

// Ndryshon emrin e llogarisë sime. Serveri kthen një token të ri (emri është brenda tokenit), që e ruajmë menjëherë.
export async function updateProfile(name: string): Promise<AuthResponse> {
  const result = await apiFetch<AuthResponse>('/api/auth/me', { method: 'PUT', body: { name } })
  saveToken(result.token)
  return result
}

// Ndryshon fjalëkalimin kur je i loguar. Fjalëkalimi aktual i gabuar kthen ApiError 400 me mesazh (jo 401, që të mos mbyllet sesioni).
export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return apiFetch<void>('/api/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } })
}

// "Harrova fjalëkalimin": kërkon lidhjen e rivendosjes. Serveri përgjigjet njësoj edhe kur email-i nuk ekziston.
export function forgotPassword(email: string): Promise<void> {
  return apiFetch<void>('/api/auth/forgot-password', { method: 'POST', body: { email } })
}

// Vendos fjalëkalimin e ri me kodin nga lidhja.
export function resetPassword(token: string, newPassword: string): Promise<void> {
  return apiFetch<void>('/api/auth/reset-password', { method: 'POST', body: { token, newPassword } })
}

// Dalja: heq tokenin (nuk ka endpoint në backend, sepse tokenat nuk ruhen te serveri).
export function logout(): void {
  clearToken()
}
