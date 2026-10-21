import { pool, uid } from '../db.js'
import { readCollection, writeCollection } from '../workspace/state.js'
import { syncProjectsTable } from '../workspace/projectsSync.js'
import {
  notifyAdminNewClientRequest,
  notifyClientRequestReceived,
} from './email.js'
import { pushAdminNotification } from './adminNotify.js'

export type ClientProjectRequestInput = {
  title: string
  type: string
  message: string
  needs?: string[]
  source: 'signup' | 'portal' | 'contact'
}

async function ensureProfile(userId: string, phone?: string | null) {
  const profiles = (await readCollection('profiles')) as Record<string, unknown>[]
  if (profiles.some((p) => p.userId === userId)) return
  profiles.push({
    userId,
    phone: phone ?? undefined,
    notificationPrefs: {
      email: true,
      sms: Boolean(phone),
      mockupReady: true,
      messages: true,
      quotes: true,
      statusUpdates: true,
    },
  })
  await writeCollection('profiles', profiles)
}

async function upsertProspectForUser(user: {
  id: string
  email: string
  name: string
  company?: string | null
  phone?: string | null
  notes?: string
}) {
  const { rows } = await pool.query(`SELECT id FROM prospects WHERE LOWER(email) = LOWER($1)`, [user.email])
  if (rows[0]) {
    await pool.query(
      `UPDATE prospects SET status = CASE WHEN status = 'converted' THEN status ELSE 'qualified' END, notes = COALESCE($2, notes), last_contact_at = NOW() WHERE id = $1`,
      [rows[0].id, user.notes ?? null],
    )
    return rows[0].id as string
  }

  const prospectId = uid('prospect')
  await pool.query(
    `INSERT INTO prospects (id, name, company, email, phone, sector, source, status, score, notes)
     VALUES ($1,$2,$3,$4,$5,$6,'website','qualified',75,$7)`,
    [
      prospectId,
      user.name,
      user.company?.trim() || 'Particulier / non renseigné',
      user.email,
      user.phone ?? null,
      'Espace client',
      user.notes ?? null,
    ],
  )
  return prospectId
}

export async function createClientProjectRequest(
  user: { id: string; email: string; name: string; company?: string | null; phone?: string | null },
  input: ClientProjectRequestInput,
) {
  const title = input.title.trim()
  const type = input.type.trim() || 'Site web'
  const message = input.message.trim()

  const projects = (await readCollection('projects')) as Record<string, unknown>[]
  const projectId = uid('proj')
  const today = new Date().toISOString().slice(0, 10)
  const needsLine = input.needs?.length ? `Besoins : ${input.needs.join(', ')}` : ''
  const description = [message, needsLine].filter(Boolean).join('\n')

  const project = {
    id: projectId,
    userId: user.id,
    title,
    type,
    status: 'en_cours',
    progress: 5,
    updatedAt: today,
    startedAt: today,
    nextStep: 'Prise en charge par l’équipe Sirius',
    description,
    milestones: [
      { id: uid('m'), label: 'Brief client', done: true },
      { id: uid('m'), label: 'Maquette', done: false },
      { id: uid('m'), label: 'Livraison', done: false },
    ],
  }

  projects.unshift(project)
  await writeCollection('projects', projects)
  await syncProjectsTable(projects)

  await ensureProfile(user.id, user.phone)

  const msgId = uid('msg')
  const preview = message.slice(0, 2000)
  await pool.query(
    `INSERT INTO messages (id, user_id, project_id, project_title, from_label, from_user_id, role, content)
     VALUES ($1,$2,$3,$4,$5,$6,'client',$7)`,
    [msgId, user.id, projectId, title, user.name, user.id, preview],
  )

  const activities = (await readCollection('activities')) as Record<string, unknown>[]
  activities.unshift({
    id: uid('act'),
    userId: user.id,
    projectId,
    type: 'status',
    label: `Demande envoyée · ${title}`,
    date: new Date().toISOString(),
  })
  await writeCollection('activities', activities)

  const clientNotifications = (await readCollection('notifications')) as Record<string, unknown>[]
  clientNotifications.unshift({
    id: uid('notif'),
    userId: user.id,
    type: 'status',
    title: 'Demande bien reçue',
    body: `Nous étudions votre projet « ${title} » et revenons vers vous rapidement.`,
    date: new Date().toISOString(),
    read: false,
    link: `/espace-client/projets/${projectId}`,
  })
  await writeCollection('notifications', clientNotifications)

  await upsertProspectForUser({
    ...user,
    notes: [message, needsLine, `(source: ${input.source})`].filter(Boolean).join('\n'),
  })

  await notifyAdminNewClientRequest({
    clientName: user.name,
    clientEmail: user.email,
    projectTitle: title,
    preview,
    projectId,
  })

  await notifyClientRequestReceived({
    to: user.email,
    name: user.name,
    projectTitle: title,
  })

  await pushAdminNotification({
    type: 'status',
    title: `Nouvelle demande client · ${title}`,
    body: `${user.name} · ${user.email}`,
    link: `/espace-admin/projets/${projectId}`,
  })

  const projectsAfter = (await readCollection('projects')) as Record<string, unknown>[]

  return { project, projectId, projects: projectsAfter }
}
