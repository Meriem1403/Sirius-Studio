import { Hono } from 'hono'
import { z } from 'zod'
import { pool, uid } from '../db.js'
import { notifyAdminNewLead } from '../services/email.js'
import { pushAdminNotification } from '../services/adminNotify.js'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  siret: z.string().optional(),
  situation: z.enum(['existing', 'idea', 'unknown']),
  website: z.string().optional(),
  needs: z.array(z.string()).default([]),
  objectives: z.array(z.string()).default([]),
  message: z.string().optional(),
})

export const contactRoutes = new Hono()

contactRoutes.post('/', async (c) => {
  const body = contactSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Formulaire invalide.' }, 400)

  const data = body.data
  const prospectId = uid('prospect')
  const leadId = uid('lead')
  const company = data.company?.trim() || 'Particulier / non renseigné'
  const notes = data.message?.trim() || null

  await pool.query(
    `INSERT INTO prospects (id, name, company, email, phone, sector, source, status, score, notes)
     VALUES ($1,$2,$3,$4,$5,$6,'website','new',70,$7)`,
    [prospectId, data.name.trim(), company, data.email.trim(), data.phone?.trim() ?? null, 'Site vitrine', notes || null],
  )

  await pool.query(`INSERT INTO contact_leads (id, prospect_id, payload) VALUES ($1,$2,$3::jsonb)`, [
    leadId,
    prospectId,
    JSON.stringify(data),
  ])

  const emailSummary = [
    data.message?.trim(),
    data.needs.length ? `Besoins : ${data.needs.join(', ')}` : '',
    data.objectives.length ? `Objectifs : ${data.objectives.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  await notifyAdminNewLead({
    name: data.name,
    email: data.email,
    company,
    phone: data.phone,
    message: emailSummary || 'Nouvelle demande via le site.',
  })

  await pushAdminNotification({
    type: 'status',
    title: `Nouveau lead · ${data.name.trim()}`,
    body: `${company}${data.phone ? ` · ${data.phone.trim()}` : ''}`,
    link: '/espace-admin/prospection',
  })

  return c.json({ ok: true, prospectId }, 201)
})
