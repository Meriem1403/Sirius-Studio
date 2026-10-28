import { pool, uid } from '../db.js'
import { hashPassword } from './auth.js'

/** Compte admin réel depuis .env (prod) — upsert à chaque démarrage API. */
export async function ensureBootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD?.trim()
  const name = process.env.ADMIN_NAME?.trim() || 'Administrateur Sirius'

  if (!email || !password) {
    if (process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD) {
      console.warn('[bootstrap] ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis ensemble.')
    }
    return
  }

  if (password.length < 8) {
    console.warn('[bootstrap] ADMIN_PASSWORD trop court (8 caractères minimum).')
    return
  }

  const password_hash = await hashPassword(password)
  const { rows } = await pool.query<{ id: string }>(`SELECT id FROM users WHERE LOWER(email) = $1`, [email])

  if (rows[0]) {
    await pool.query(
      `UPDATE users SET password_hash = $1, name = $2, role = 'admin' WHERE id = $3`,
      [password_hash, name, rows[0].id],
    )
    console.info(`[bootstrap] Compte admin mis à jour : ${email}`)
    return
  }

  const id = uid('user')
  await pool.query(
    `INSERT INTO users (id, email, password_hash, name, role) VALUES ($1,$2,$3,$4,'admin')`,
    [id, email, password_hash, name],
  )
  console.info(`[bootstrap] Compte admin créé : ${email}`)
}
