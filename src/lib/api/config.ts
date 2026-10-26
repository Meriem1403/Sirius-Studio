const base = import.meta.env.VITE_API_BASE_URL as string | undefined

export function isApiMode() {
  return Boolean(base && base.length > 0)
}

/** Comptes démo sur la page connexion — jamais en prod Netlify (voir VITE_ENABLE_DEMO_FIXTURES). */
export function isDemoFixturesEnabled() {
  if (import.meta.env.VITE_ENABLE_DEMO_FIXTURES === 'true') return true
  return import.meta.env.DEV && !isApiMode()
}

export function apiBaseUrl() {
  if (!base) return ''
  return base.replace(/\/$/, '')
}

export const AUTH_TOKEN_KEY = 'sirius_api_token'
