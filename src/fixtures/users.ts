import type { UserRole } from '../lib/auth/types'

export interface FixtureAccount {
  id: string
  email: string
  password: string
  name: string
  company?: string
  role: UserRole
  description: string
}

/** Comptes de démonstration pour tester l'espace client */
export const FIXTURE_ACCOUNTS: FixtureAccount[] = [
  {
    id: 'fixture-client-1',
    email: 'marie@demo.sirius',
    password: 'Demo2026!',
    name: 'Marie Laurent',
    company: 'Laurent Design',
    role: 'client',
    description: 'Cliente avec 2 projets en cours',
  },
  {
    id: 'fixture-client-2',
    email: 'thomas@demo.sirius',
    password: 'Demo2026!',
    name: 'Thomas Mercier',
    company: 'Mercier & Co',
    role: 'client',
    description: 'Client avec maquette en validation',
  },
  {
    id: 'fixture-admin-1',
    email: 'admin@sirius.studio',
    password: 'Admin2026!',
    name: 'Alex Sirius',
    company: 'Sirius Studio',
    role: 'admin',
    description: 'Compte admin (vue étendue)',
  },
]

/** Mapping OAuth mock → compte fixture */
export const FIXTURE_SOCIAL_MAP = {
  google: 'marie@demo.sirius',
  apple: 'thomas@demo.sirius',
  microsoft: 'admin@sirius.studio',
  github: 'marie@demo.sirius',
} as const

export function getFixtureByEmail(email: string) {
  return FIXTURE_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase())
}

export function getFixtureCredentialsLabel(account: FixtureAccount) {
  return `${account.email} · ${account.password}`
}
