import { pool, uid } from '../db.js'
import { hashPassword } from './auth.js'
import { readCollection, writeCollection } from '../workspace/state.js'
import { syncProjectsTable } from '../workspace/projectsSync.js'

function randomPassword() {
  return `Sirius${Math.random().toString(36).slice(2, 10)}!`
}

export async function convertProspectToClient(
  prospectId: string,
  input: { projectTitle: string; projectType: string },
) {
  const { rows } = await pool.query(`SELECT * FROM prospects WHERE id = $1`, [prospectId])
  const row = rows[0]
  if (!row) throw new Error('NOT_FOUND')

  let userId = row.converted_user_id as string | null
  let tempPassword: string | undefined

  const { rows: existingUsers } = await pool.query<{ id: string }>(
    `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`,
    [row.email],
  )
  if (existingUsers[0]) {
    userId = existingUsers[0].id
  } else {
    userId = uid('user')
    tempPassword = randomPassword()
    const password_hash = await hashPassword(tempPassword)
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, company, phone, role) VALUES ($1,$2,$3,$4,$5,$6,'client')`,
      [userId, row.email, password_hash, row.name, row.company, row.phone ?? null],
    )
  }

  const projects = (await readCollection('projects')) as Record<string, unknown>[]
  const existingForUser = projects.find((p) => p.userId === userId && p.title === input.projectTitle)
  const projectId = existingForUser ? String(existingForUser.id) : uid('proj')

  let createdProject: Record<string, unknown> | null = existingForUser
    ? (existingForUser as Record<string, unknown>)
    : null

  if (!existingForUser) {
    const today = new Date().toISOString().slice(0, 10)
    const project = {
      id: projectId,
      userId,
      title: input.projectTitle,
      type: input.projectType,
      status: 'maquette',
      progress: 5,
      updatedAt: today,
      startedAt: today,
      nextStep: 'Premier échange et cadrage du besoin',
      description: `Projet ouvert depuis la prospection (${row.name}).`,
      milestones: [
        { id: uid('m'), label: 'Brief client', done: false },
        { id: uid('m'), label: 'Maquette', done: false },
        { id: uid('m'), label: 'Livraison', done: false },
      ],
    }
    createdProject = project
    projects.unshift(project)
    await writeCollection('projects', projects)
    await syncProjectsTable(projects)
  }

  const projectsAfter = (await readCollection('projects')) as Record<string, unknown>[]

  const profiles = (await readCollection('profiles')) as Record<string, unknown>[]
  if (!profiles.some((p) => p.userId === userId)) {
    profiles.push({
      userId,
      phone: row.phone ?? undefined,
      notificationPrefs: {
        email: true,
        sms: Boolean(row.phone),
        mockupReady: true,
        messages: true,
        quotes: true,
        statusUpdates: true,
      },
    })
    await writeCollection('profiles', profiles)
  }

  await pool.query(
    `UPDATE prospects SET status = 'converted', converted_user_id = $1, last_contact_at = NOW() WHERE id = $2`,
    [userId, prospectId],
  )

  return {
    userId,
    projectId,
    project: createdProject,
    projects: projectsAfter,
    tempPassword,
    email: row.email as string,
    name: row.name as string,
    createdAccount: Boolean(tempPassword),
  }
}
