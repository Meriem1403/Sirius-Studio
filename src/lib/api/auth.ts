import type { RegisterInput, User } from '../auth/types'
import { apiFetch, setAuthToken } from './http'

export async function apiLogin(email: string, password: string) {
  const data = await apiFetch<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setAuthToken(data.token)
  return data.user
}

export async function apiRegister(input: RegisterInput) {
  const data = await apiFetch<{ token: string; user: User; projectId?: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  setAuthToken(data.token)
  return { user: data.user, projectId: data.projectId }
}

export async function apiMe() {
  const data = await apiFetch<{ user: User }>('/auth/me')
  return data.user
}

export function apiLogout() {
  setAuthToken(null)
}

export async function apiForgotPassword(email: string) {
  return apiFetch<{ ok: true; message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function apiResetPassword(token: string, password: string) {
  return apiFetch<{ ok: true }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}
