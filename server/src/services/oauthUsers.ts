import { randomBytes } from 'node:crypto'
import { pool, uid } from '../db.js'
import { hashPassword } from './auth.js'
import { notifyClientWelcome } from './email.js'

export type OAuthProfile = {
  provider: 'google' | 'github' | 'microsoft' | 'apple'
  subject: string
  email: string
  name: string
  emailVerified?: boolean
}

export async function findOrCreateOAuthUser(profile: OAuthProfile) {
  if (!profile.email?.trim()) {
    throw new Error('EMAIL_REQUIRED')
  }

  const email = profile.email.trim().toLowerCase()
  const { rows: byOAuth } = await pool.query<{ id: string }>(
    `SELECT id FROM users WHERE oauth_provider = $1 AND oauth_subject = $2`,
    [profile.provider, profile.subject],
  )
  if (byOAuth[0]) {
    return loadUser(byOAuth[0].id)
  }

  const { rows: byEmail } = await pool.query<{ id: string; oauth_provider: string | null }>(
    `SELECT id, oauth_provider FROM users WHERE LOWER(email) = $1`,
    [email],
  )
  if (byEmail[0]) {
    await pool.query(
      `UPDATE users SET oauth_provider = $1, oauth_subject = $2, name = COALESCE(NULLIF(name, ''), $3) WHERE id = $4`,
      [profile.provider, profile.subject, profile.name.trim(), byEmail[0].id],
    )
    return loadUser(byEmail[0].id)
  }

  const id = uid('user')
  const password_hash = await hashPassword(randomBytes(32).toString('hex'))
  await pool.query(
    `INSERT INTO users (id, email, password_hash, name, role, oauth_provider, oauth_subject)
     VALUES ($1,$2,$3,$4,'client',$5,$6)`,
    [id, email, password_hash, profile.name.trim() || email.split('@')[0], profile.provider, profile.subject],
  )

  await notifyClientWelcome({ to: email, name: profile.name.trim() || 'Client' })

  return loadUser(id)
}

async function loadUser(id: string) {
  const { rows } = await pool.query<{
    id: string
    email: string
    name: string
    company: string | null
    role: 'client' | 'admin'
    phone: string | null
  }>(`SELECT id, email, name, company, role, phone FROM users WHERE id = $1`, [id])
  const row = rows[0]
  if (!row) throw new Error('USER_NOT_FOUND')
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    company: row.company ?? undefined,
    role: row.role,
    phone: row.phone ?? undefined,
  }
}
