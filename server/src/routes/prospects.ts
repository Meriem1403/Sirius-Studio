import { Hono } from 'hono'
import { z } from 'zod'
import { pool, uid } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { convertProspectToClient } from '../services/prospectConvert.js'
import { pushAdminNotification } from '../services/adminNotify.js'

function parseLeadPayload(raw: unknown) {
  if (!raw || typeof raw !== 'object') return undefined
  const p = raw as Record<string, unknown>
  return {
    situation: p.situation as 'existing' | 'idea' | 'unknown' | undefined,
    website: (p.website as string | undefined) ?? undefined,
    needs: Array.isArray(p.needs) ? (p.needs as string[]) : undefined,
    objectives: Array.isArray(p.objectives) ? (p.objectives as string[]) : undefined,
    message: (p.message as string | undefined) ?? undefined,
    siret: (p.siret as string | undefined) ?? undefined,
  }
}

function mapProspect(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    company: row.company as string,
    email: row.email as string,
    phone: (row.phone as string | null) ?? undefined,
    sector: row.sector as string,
    source: row.source === 'website' ? 'auto' : (row.source as string),
    status: row.status as string,
    score: row.score as number,
    notes: (row.notes as string | null) ?? undefined,
    lead: parseLeadPayload(row.lead_payload),
    createdAt: (row.created_at as Date).toISOString(),
    lastContactAt: row.last_contact_at ? (row.last_contact_at as Date).toISOString() : undefined,
    convertedUserId: (row.converted_user_id as string | null) ?? undefined,
  }
}

export const prospectRoutes = new Hono()

prospectRoutes.use('*', requireAdmin)

prospectRoutes.get('/', async (c) => {
  const { rows } = await pool.query(
    `SELECT p.*, cl.payload AS lead_payload
     FROM prospects p
     LEFT JOIN contact_leads cl ON cl.prospect_id = p.id
     ORDER BY p.created_at DESC`,
  )
  return c.json({ prospects: rows.map(mapProspect) })
})

const createSchema = z.object({
  name: z.string().min(2),
  company: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  sector: z.string().optional(),
  notes: z.string().optional(),
})

prospectRoutes.post('/', async (c) => {
  const body = createSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Données invalides.' }, 400)

  const id = uid('prospect')
  await pool.query(
    `INSERT INTO prospects (id, name, company, email, phone, sector, source, status, score, notes)
     VALUES ($1,$2,$3,$4,$5,$6,'manual','new',55,$7)`,
    [
      id,
      body.data.name,
      body.data.company,
      body.data.email,
      body.data.phone ?? null,
      body.data.sector ?? 'Non renseigné',
      body.data.notes ?? null,
    ],
  )
  const { rows } = await pool.query(`SELECT * FROM prospects WHERE id = $1`, [id])
  return c.json({ prospect: mapProspect(rows[0]) }, 201)
})

const convertSchema = z.object({
  projectTitle: z.string().min(2),
  projectType: z.string().min(1).default('Site web'),
})

prospectRoutes.post('/:id/convert', async (c) => {
  const id = c.req.param('id')
  const body = convertSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Données invalides.' }, 400)

  try {
    const result = await convertProspectToClient(id, body.data)
    await pushAdminNotification({
      type: 'status',
      title: `Client activé · ${result.name}`,
      body: `Projet « ${body.data.projectTitle} » prêt dans Projets clients.`,
      link: `/espace-admin/projets/${result.projectId}`,
    })
    const { rows } = await pool.query(
      `SELECT p.*, cl.payload AS lead_payload
       FROM prospects p
       LEFT JOIN contact_leads cl ON cl.prospect_id = p.id
       WHERE p.id = $1`,
      [id],
    )
    return c.json({ ...result, prospect: mapProspect(rows[0]) })
  } catch (e) {
    if (e instanceof Error && e.message === 'NOT_FOUND') {
      return c.json({ error: 'Prospect introuvable.' }, 404)
    }
    throw e
  }
})

prospectRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const patch = z
    .object({
      status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
      notes: z.string().optional(),
      score: z.number().int().min(0).max(100).optional(),
    })
    .safeParse(await c.req.json())

  if (!patch.success) return c.json({ error: 'Mise à jour invalide.' }, 400)

  const fields: string[] = []
  const values: unknown[] = []
  let i = 1
  for (const [key, val] of Object.entries(patch.data)) {
    if (val === undefined) continue
    fields.push(`${key === 'lastContactAt' ? 'last_contact_at' : key} = $${i++}`)
    values.push(val)
  }
  if (!fields.length) return c.json({ error: 'Rien à mettre à jour.' }, 400)

  values.push(id)
  await pool.query(`UPDATE prospects SET ${fields.join(', ')}, last_contact_at = NOW() WHERE id = $${i}`, values)
  const { rows } = await pool.query(
    `SELECT p.*, cl.payload AS lead_payload
     FROM prospects p
     LEFT JOIN contact_leads cl ON cl.prospect_id = p.id
     WHERE p.id = $1`,
    [id],
  )
  if (!rows[0]) return c.json({ error: 'Prospect introuvable.' }, 404)
  return c.json({ prospect: mapProspect(rows[0]) })
})
