import { apiBaseUrl, isApiMode } from './config'
export type SocialProvider = 'google' | 'apple' | 'microsoft' | 'github'

const API_PROVIDERS: SocialProvider[] = ['google', 'github', 'microsoft', 'apple']

export function isApiOAuthProvider(provider: SocialProvider) {
  return isApiMode() && API_PROVIDERS.includes(provider)
}

export function startOAuthLogin(provider: SocialProvider, next: string) {
  const base = apiBaseUrl()
  const path = next.startsWith('/') ? next : '/espace-client/nouvelle-demande'
  window.location.href = `${base}/auth/oauth/${provider}/start?next=${encodeURIComponent(path)}`
}

export async function fetchConfiguredOAuthProviders(): Promise<SocialProvider[]> {
  if (!isApiMode()) return []
  try {
    const res = await fetch(`${apiBaseUrl()}/auth/oauth/providers`)
    if (!res.ok) return []
    const data = (await res.json()) as { providers?: SocialProvider[] }
    return data.providers ?? []
  } catch {
    return []
  }
}
