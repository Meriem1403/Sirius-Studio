import { createHash, randomBytes } from 'node:crypto'
import { Hono } from 'hono'
import { z } from 'zod'
import { pool } from '../db.js'
import { uid } from '../db.js'
import { config } from '../config.js'
import { hashPassword, signToken, verifyPassword } from '../services/auth.js'
import { requireAuth } from '../middleware/auth.js'
import { notifyClientWelcome, notifyPasswordReset } from '../services/email.js'
import { createClientProjectRequest } from '../services/clientProjectRequest.js'
import { maquetteBriefSchema, resolveBriefTitle, resolveBriefType } from '../schemas/maquetteBrief.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  company: z.string().optional(),
  phone: z.string().optional(),
  siret: z.string().optional(),
  projectRequest: maquetteBriefSchema,
})

export const authRoutes = new Hono()

const loginFailures = new Map<string, { count: number; resetAt: number }>()

function loginLimited(key: string) {
  const now = Date.now()
  const current = loginFailures.get(key)
  if (!current || current.resetAt < now) return false
  return current.count >= 8
}

function noteLoginFailure(key: string) {
  const now = Date.now()
  const current = loginFailures.get(key)
  if (!current || current.resetAt < now) {
    loginFailures.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return
  }
  current.count += 1
}

authRoutes.post('/login', async (c) => {
  const body = loginSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Données invalides.' }, 400)

  const email = body.data.email.trim().toLowerCase()
  if (loginLimited(email)) {
    return c.json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }, 429)
  }
  const { rows } = await pool.query<{
    id: string
    email: string
    name: string
    company: string | null
    role: 'client' | 'admin'
    phone: string | null
    password_hash: string
    blocked_at: string | null
  }>(`SELECT * FROM users WHERE LOWER(email) = $1`, [email])

  const row = rows[0]
  if (!row?.password_hash || !(await verifyPassword(body.data.password, row.password_hash))) {
    noteLoginFailure(email)
    return c.json({ error: 'Email ou mot de passe incorrect.' }, 401)
  }
  if (row.blocked_at) {
    return c.json(
      { error: 'Votre accès à Sirius Studio est suspendu. Pour toute question ou pour exercer vos droits : contact@studio-sirius.fr' },
      403,
    )
  }
  loginFailures.delete(email)

  const token = await signToken(row.id)
  const user = {
    id: row.id,
    email: row.email,
    name: row.name,
    company: row.company ?? undefined,
    role: row.role,
    phone: row.phone ?? undefined,
  }

  return c.json({ token, user })
})

authRoutes.post('/register', async (c) => {
  const body = registerSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Données invalides.' }, 400)

  const email = body.data.email.trim().toLowerCase()
  const exists = await pool.query('SELECT 1 FROM users WHERE LOWER(email) = $1', [email])
  if (exists.rowCount) return c.json({ error: 'Un compte existe déjà avec cet email.' }, 409)

  const id = uid('user')
  const password_hash = await hashPassword(body.data.password)
  await pool.query(
    `INSERT INTO users (id, email, password_hash, name, company, phone, role) VALUES ($1,$2,$3,$4,$5,$6,'client')`,
    [id, body.data.email.trim(), password_hash, body.data.name.trim(), body.data.company?.trim() ?? null, body.data.phone?.trim() ?? null],
  )

  const token = await signToken(id)
  const user = {
    id,
    email: body.data.email.trim(),
    name: body.data.name.trim(),
    company: body.data.company?.trim(),
    role: 'client' as const,
    phone: body.data.phone?.trim(),
  }

  await notifyClientWelcome({ to: user.email, name: user.name })

  const pr = body.data.projectRequest
  const created = await createClientProjectRequest(
    {
      id,
      email: user.email,
      name: user.name,
      company: user.company ?? null,
      phone: user.phone ?? null,
    },
    {
      title: resolveBriefTitle(pr, user.company),
      type: resolveBriefType(pr),
      message: pr.message.trim(),
      needs: pr.needs,
      situation: pr.situation,
      website: pr.website,
      objectives: pr.objectives,
      siret: body.data.siret,
      source: 'signup',
    },
  )

  return c.json({ token, user, projectId: created.projectId }, 201)
})

const forgotSchema = z.object({
  email: z.string().email(),
})

const resetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8),
})

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

authRoutes.post('/forgot-password', async (c) => {
  const body = forgotSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Indiquez une adresse email valide.' }, 400)

  const email = body.data.email.trim().toLowerCase()
  const { rows } = await pool.query<{ id: string; name: string; email: string }>(
    `SELECT id, name, email FROM users WHERE LOWER(email) = $1`,
    [email],
  )
  const user = rows[0]

  if (user) {
    const recent = await pool.query(
      `SELECT 1 FROM password_resets WHERE user_id = $1 AND used_at IS NULL AND created_at > NOW() - INTERVAL '2 minutes'`,
      [user.id],
    )
    if (!recent.rowCount) {
      const token = randomBytes(32).toString('hex')
      const tokenHash = hashResetToken(token)
      await pool.query(`UPDATE password_resets SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`, [user.id])
      await pool.query(
        `INSERT INTO password_resets (id, user_id, token_hash, expires_at) VALUES ($1,$2,$3, NOW() + INTERVAL '1 hour')`,
        [uid('reset'), user.id, tokenHash],
      )
      const link = `${config.publicAppUrl}/mot-de-passe-oublie/nouveau?token=${token}`
      await notifyPasswordReset({ to: user.email, name: user.name, link })
    }
  }

  return c.json({
    ok: true,
    message: 'Si un compte existe avec cette adresse, un email vient de partir. Le lien est valable 1 heure.',
  })
})

authRoutes.post('/reset-password', async (c) => {
  const body = resetSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, 400)

  const tokenHash = hashResetToken(body.data.token.trim())
  const { rows } = await pool.query<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM password_resets
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
    [tokenHash],
  )
  const reset = rows[0]
  if (!reset) return c.json({ error: 'Ce lien n’est plus valable. Demandez-en un nouveau.' }, 400)

  const password_hash = await hashPassword(body.data.password)
  await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [password_hash, reset.user_id])
  await pool.query(`UPDATE password_resets SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`, [reset.user_id])

  return c.json({ ok: true })
})

authRoutes.get('/me', requireAuth, (c) => {
  const user = c.get('user')
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company ?? undefined,
      role: user.role,
      phone: user.phone ?? undefined,
    },
  })
})
