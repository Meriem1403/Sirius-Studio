import type { ClientProject } from '../auth/types'

const ONBOARDING_PATH = '/espace-client/nouvelle-demande'

function safePath(next: string | null | undefined) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null
}

/** Après inscription / OAuth : demande obligatoire seulement sans projet. */
export function resolveClientPostAuthPath(next: string | null | undefined, projects: ClientProject[], userId: string) {
  const mine = projects.filter((p) => p.userId === userId)
  const safeNext = safePath(next)

  if (mine.length === 0) {
    return safeNext ?? ONBOARDING_PATH
  }

  if (!safeNext || safeNext === '/espace-client' || safeNext === ONBOARDING_PATH) {
    return mine.length === 1 ? `/espace-client/projets/${mine[0]!.id}` : '/espace-client'
  }

  return safeNext
}

export const DEFAULT_AUTH_NEXT = '/espace-client/nouvelle-demande'
