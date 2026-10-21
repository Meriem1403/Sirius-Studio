import type { ClientProject } from '../auth/types'

/** Après inscription / OAuth : une seule étape demande si aucun projet. */
export function resolveClientPostAuthPath(next: string | null | undefined, projects: ClientProject[], userId: string) {
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null
  if (safeNext && safeNext !== '/espace-client') return safeNext

  const mine = projects.filter((p) => p.userId === userId)
  if (mine.length === 0) return '/espace-client/nouvelle-demande'
  return safeNext ?? '/espace-client'
}

export const DEFAULT_AUTH_NEXT = '/espace-client/nouvelle-demande'
