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
  const data = await apiFetch<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  setAuthToken(data.token)
  return data.user
}

export async function apiMe() {
  const data = await apiFetch<{ user: User }>('/auth/me')
  return data.user
}

export function apiLogout() {
  setAuthToken(null)
}
