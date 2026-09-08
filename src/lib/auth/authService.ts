import { FIXTURE_ACCOUNTS, getFixtureByEmail } from '../../fixtures/users'
import type { RegisterInput, Session, User } from './types'
import { updateProfile, defaultNotificationPrefs } from '../data/store'

const SESSION_KEY = 'sirius_session'
const REGISTERED_KEY = 'sirius_registered_users'

interface StoredUser extends User {
  password: string
}

function loadRegistered(): StoredUser[] {
  try {
    const raw = localStorage.getItem(REGISTERED_KEY)
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

function saveRegistered(users: StoredUser[]) {
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(users))
}

function toPublicUser(user: StoredUser | (typeof FIXTURE_ACCOUNTS)[0]): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    company: user.company,
    role: user.role,
  }
}

function findAccount(email: string, password: string): User | null {
  const normalized = email.trim().toLowerCase()

  const fixture = FIXTURE_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === normalized && a.password === password,
  )
  if (fixture) return toPublicUser(fixture)

  const registered = loadRegistered().find(
    (u) => u.email.toLowerCase() === normalized && u.password === password,
  )
  if (registered) return toPublicUser(registered)

  return null
}

function saveSession(user: User, remember: boolean) {
  const session: Session = {
    user,
    remember,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export async function loginWithCredentials(
  email: string,
  password: string,
  remember = false,
): Promise<User> {
  await delay(700)

  const user = findAccount(email, password)
  if (!user) {
    throw new Error('Email ou mot de passe incorrect.')
  }

  saveSession(user, remember)
  return user
}

export async function loginWithSocial(email: string): Promise<User> {
  await delay(800)

  const fixture = getFixtureByEmail(email)
  if (!fixture) {
    throw new Error('Compte de démonstration introuvable.')
  }

  const user = toPublicUser(fixture)
  saveSession(user, true)
  return user
}

export async function registerAccount(input: RegisterInput): Promise<User> {
  await delay(900)

  const email = input.email.trim().toLowerCase()
  const exists =
    FIXTURE_ACCOUNTS.some((a) => a.email.toLowerCase() === email) ||
    loadRegistered().some((u) => u.email.toLowerCase() === email)

  if (exists) {
    throw new Error('Un compte existe déjà avec cet email.')
  }

  const newUser: StoredUser = {
    id: `registered-${Date.now()}`,
    email: input.email.trim(),
    password: input.password,
    name: input.name.trim(),
    company: input.company?.trim() || undefined,
    role: 'client',
  }

  const registered = loadRegistered()
  registered.push(newUser)
  saveRegistered(registered)

  const user = toPublicUser(newUser)
  updateProfile(user.id, {
    phone: input.phone?.trim(),
    notificationPrefs: defaultNotificationPrefs(),
  })
  saveSession(user, true)
  return user
}

export function logout() {
  clearSession()
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
