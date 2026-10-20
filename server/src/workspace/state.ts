import { pool } from '../db.js'
import type { AuthUser } from '../middleware/auth.js'
import { syncProjectsTable } from './projectsSync.js'

const COLLECTION_KEYS = [
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
] as const

export type CollectionKey = (typeof COLLECTION_KEYS)[number]

async function readCollection(key: string) {
  const { rows } = await pool.query<{ data: unknown }>(
    `SELECT data FROM workspace_collections WHERE key = $1`,
    [key],
  )
  return rows[0]?.data ?? []
}

async function writeCollection(key: string, data: unknown) {
  await pool.query(
    `INSERT INTO workspace_collections (key, data, updated_at) VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [key, JSON.stringify(data)],
  )
}

function mapMessage(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    projectTitle: row.project_title,
    from: row.from_label,
    fromUserId: row.from_user_id,
    role: row.role,
    content: row.content,
    date: (row.sent_at as Date).toISOString(),
    read: row.read,
    attachments: row.attachments ?? undefined,
    documentRequestId: row.document_request_id ?? undefined,
  }
}

function mapProspect(row: Record<string, unknown>) {
  const source = row.source === 'website' ? 'auto' : row.source
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone ?? undefined,
    sector: row.sector,
    source,
    status: row.status,
    score: row.score,
    notes: row.notes ?? undefined,
    createdAt: (row.created_at as Date).toISOString(),
    lastContactAt: row.last_contact_at ? (row.last_contact_at as Date).toISOString() : undefined,
    convertedUserId: row.converted_user_id ?? undefined,
  }
}

function mapAppointment(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    startAt: (row.start_at as Date).toISOString(),
    endAt: (row.end_at as Date).toISOString(),
    userId: row.user_id,
    clientName: row.client_name,
    projectId: row.project_id ?? undefined,
    projectTitle: row.project_title ?? undefined,
    createdBy: row.created_by,
    location: row.location ?? undefined,
    meetingUrl: row.meeting_url ?? undefined,
    type: row.type,
  }
}

function filterForUser<T extends { userId?: string }>(items: T[], user: AuthUser) {
  if (user.role === 'admin') return items
  return items.filter((i) => i.userId === user.id)
}

function filterByUserIdField<T>(items: T[], user: AuthUser, field: keyof T) {
  if (user.role === 'admin') return items
  return items.filter((i) => i[field] === user.id)
}

export async function loadWorkspaceState(user: AuthUser) {
  const collections = Object.fromEntries(
    await Promise.all(
      COLLECTION_KEYS.map(async (key) => [key, await readCollection(key)] as const),
    ),
  )

  const { rows: messageRows } = await pool.query(
    user.role === 'admin'
      ? `SELECT * FROM messages ORDER BY sent_at ASC`
      : `SELECT * FROM messages WHERE user_id = $1 ORDER BY sent_at ASC`,
    user.role === 'admin' ? [] : [user.id],
  )

  const { rows: prospectRows } =
    user.role === 'admin'
      ? await pool.query(`SELECT * FROM prospects ORDER BY created_at DESC`)
      : await pool.query(`SELECT * FROM prospects WHERE email = (SELECT email FROM users WHERE id = $1)`, [user.id])

  const projects = filterForUser(collections.projects as { userId: string }[], user)
  const activities = filterForUser(collections.activities as { userId: string }[], user)
  const notifications = filterForUser(collections.notifications as { userId: string }[], user)
  const profiles = filterByUserIdField(collections.profiles as { userId: string }[], user, 'userId')
  const deliveries = filterForUser(collections.deliveries as { userId: string }[], user)
  const documentRequests = filterForUser(collections.documentRequests as { userId: string }[], user)
  const quotes = filterForUser(collections.quotes as { userId: string }[], user)
  const invoices = filterForUser(collections.invoices as { userId: string; id: string }[], user)
  const payments = (collections.payments as { invoiceId: string }[]).filter((p) => {
    if (user.role === 'admin') return true
    return invoices.some((inv) => inv.id === p.invoiceId)
  })
  const refunds = user.role === 'admin' ? collections.refunds : []
  const accounting = user.role === 'admin' ? collections.accounting : []
  const appointments = filterForUser(collections.appointments as { userId: string }[], user)

  return {
    projects,
    activities,
    notifications,
    profiles,
    deliveries,
    documentRequests,
    prospects: user.role === 'admin' ? prospectRows.map(mapProspect) : [],
    quotes,
    invoices,
    payments,
    refunds,
    accounting,
    appointments,
    messages: messageRows.map(mapMessage),
  }
}

export async function saveWorkspaceCollection(key: CollectionKey, data: unknown, user: AuthUser) {
  const incoming = Array.isArray(data) ? (data as Record<string, unknown>[]) : [data as Record<string, unknown>]

  if (user.role === 'admin') {
    await writeCollection(key, incoming)
    if (key === 'projects') await syncProjectsTable(incoming)
    return
  }

  const mergeKeys: CollectionKey[] = [
    'profiles',
    'projects',
    'quotes',
    'invoices',
    'payments',
    'documentRequests',
    'notifications',
    'activities',
  ]

  if (!mergeKeys.includes(key)) {
    throw new Error('FORBIDDEN')
  }

  const userField = key === 'profiles' ? 'userId' : 'userId'
  for (const item of incoming) {
    if (item[userField] !== user.id) throw new Error('FORBIDDEN')
  }

  const existing = (await readCollection(key)) as Record<string, unknown>[]
  const map = new Map(existing.map((item) => [String(item.id ?? item.userId), item]))
  for (const item of incoming) {
    const mapKey = String(item.id ?? item.userId)
    map.set(mapKey, item)
  }
  const merged = [...map.values()]
  await writeCollection(key, merged)
  if (key === 'projects') await syncProjectsTable(merged)
}

export async function upsertAppointments(items: unknown[], user: AuthUser) {
  if (user.role !== 'admin') throw new Error('FORBIDDEN')
  await writeCollection('appointments', items)
  for (const raw of items as Record<string, unknown>[]) {
    await pool.query(
      `INSERT INTO appointments (id, title, description, start_at, end_at, user_id, client_name, project_id, project_title, created_by, location, meeting_url, type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         start_at = EXCLUDED.start_at,
         end_at = EXCLUDED.end_at,
         user_id = EXCLUDED.user_id,
         client_name = EXCLUDED.client_name,
         project_id = EXCLUDED.project_id,
         project_title = EXCLUDED.project_title,
         location = EXCLUDED.location,
         meeting_url = EXCLUDED.meeting_url,
         type = EXCLUDED.type`,
      [
        raw.id,
        raw.title,
        raw.description ?? null,
        raw.startAt,
        raw.endAt,
        raw.userId,
        raw.clientName,
        raw.projectId ?? null,
        raw.projectTitle ?? null,
        raw.createdBy,
        raw.location ?? null,
        raw.meetingUrl ?? null,
        raw.type,
      ],
    )
  }
}

export { readCollection, writeCollection, COLLECTION_KEYS, mapAppointment }
