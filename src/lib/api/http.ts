import { AUTH_TOKEN_KEY, apiBaseUrl } from './config'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export const AUTH_SESSION_EXPIRED_EVENT = 'sirius-auth-session-expired'

function notifySessionExpired() {
  setAuthToken(null)
  try {
    localStorage.removeItem('sirius_session')
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT))
}

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token)
  else localStorage.removeItem(AUTH_TOKEN_KEY)
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${apiBaseUrl()}${path}`, { ...init, headers })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }

  if (!res.ok) {
    if (res.status === 401 && token) notifySessionExpired()
    throw new ApiError(data.error ?? 'Erreur serveur.', res.status)
  }

  return data
}
