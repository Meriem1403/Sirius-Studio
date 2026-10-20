const base = import.meta.env.VITE_API_BASE_URL as string | undefined

export function isApiMode() {
  return Boolean(base && base.length > 0)
}

export function apiBaseUrl() {
  if (!base) return ''
  return base.replace(/\/$/, '')
}

export const AUTH_TOKEN_KEY = 'sirius_api_token'
