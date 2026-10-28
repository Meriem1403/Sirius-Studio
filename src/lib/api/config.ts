const base = import.meta.env.VITE_API_BASE_URL as string | undefined

export function isApiMode() {
  return Boolean(base && base.length > 0)
}

/** Comptes démo sur la page connexion — jamais en prod Netlify (voir VITE_ENABLE_DEMO_FIXTURES). */
export function isDemoFixturesEnabled() {
  if (import.meta.env.VITE_ENABLE_DEMO_FIXTURES === 'true') return true
  return import.meta.env.DEV && !isApiMode()
}

/** Google / Apple / etc. — désactivé par défaut jusqu’à configuration OAuth. */
export function isSocialLoginEnabled() {
  return import.meta.env.VITE_ENABLE_OAUTH === 'true'
}

export function apiBaseUrl() {
  if (!base) return ''
  return base.replace(/\/$/, '')
}

export const AUTH_TOKEN_KEY = 'sirius_api_token'
