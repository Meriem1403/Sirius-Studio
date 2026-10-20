import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, uid } from './db.js'
import { hashPassword } from './services/auth.js'
import { writeCollection } from './workspace/state.js'
import { syncProjectsTable } from './workspace/projectsSync.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

type SeedPayload = {
  projects: unknown[]
  activities: unknown[]
  notifications: unknown[]
  profiles: unknown[]
  deliveries: unknown[]
  documentRequests: unknown[]
  quotes: unknown[]
  invoices: unknown[]
  payments: unknown[]
  refunds: unknown[]
  accounting: unknown[]
  appointments: unknown[]
  messages: Record<string, unknown>[]
  prospects: Record<string, unknown>[]
}

export async function seedIfEmpty() {
  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM users')
  if (Number(rows[0]?.count) > 0) return

  const users = [
    { id: 'fixture-admin-1', email: 'admin@sirius.studio', password: 'Admin2026!', name: 'Alex Sirius', company: 'Sirius Studio', role: 'admin' as const },
    { id: 'fixture-client-1', email: 'marie@demo.sirius', password: 'Demo2026!', name: 'Marie Laurent', company: 'Laurent Design', role: 'client' as const },
    { id: 'fixture-client-2', email: 'thomas@demo.sirius', password: 'Demo2026!', name: 'Thomas Mercier', company: 'Mercier & Co', role: 'client' as const },
  ]

  for (const u of users) {
    const password_hash = await hashPassword(u.password)
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, company, role) VALUES ($1,$2,$3,$4,$5,$6)`,
      [u.id, u.email, password_hash, u.name, u.company ?? null, u.role],
    )
  }

  const seedPath = path.join(__dirname, '../fixtures/workspace-seed.json')
  if (!fs.existsSync(seedPath)) {
    console.warn('[seed] workspace-seed.json absent — seed minimal uniquement.')
    return
  }

  const data = JSON.parse(fs.readFileSync(seedPath, 'utf8')) as SeedPayload

  await syncProjectsTable((data.projects ?? []) as Record<string, unknown>[])

  for (const key of [
    'projects',
    'activities',
    'notifications',
    'profiles',
    'deliveries',
    'documentRequests',
    'quotes',
    'invoices',
    'payments',
    'refunds',
    'accounting',
    'appointments',
  ] as const) {
    await writeCollection(key, data[key] ?? [])
  }

  for (const p of data.prospects ?? []) {
    await pool.query(
      `INSERT INTO prospects (id, name, company, email, phone, sector, source, status, score, notes, created_at, last_contact_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [
        p.id,
        p.name,
        p.company,
        p.email,
        p.phone ?? null,
        p.sector ?? 'Non renseigné',
        p.source === 'auto' ? 'website' : 'manual',
        p.status ?? 'new',
        p.score ?? 50,
        p.notes ?? null,
        p.createdAt ?? new Date().toISOString(),
        p.lastContactAt ?? null,
      ],
    )
  }

  for (const m of data.messages ?? []) {
    await pool.query(
      `INSERT INTO messages (id, user_id, project_id, project_title, from_label, from_user_id, role, content, sent_at, read, attachments, document_request_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12)
       ON CONFLICT (id) DO NOTHING`,
      [
        m.id,
        m.userId,
        m.projectId,
        m.projectTitle,
        m.from,
        m.fromUserId,
        m.role,
        m.content,
        m.date ?? new Date().toISOString(),
        m.read ?? false,
        m.attachments ? JSON.stringify(m.attachments) : null,
        m.documentRequestId ?? null,
      ],
    )
  }

  console.info('[seed] Workspace complet chargé (fixtures).')
}
