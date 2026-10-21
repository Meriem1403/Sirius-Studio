import { pool, uid } from '../db.js'
import { readCollection, writeCollection } from '../workspace/state.js'

async function adminUserIds() {
  const { rows } = await pool.query<{ id: string }>(`SELECT id FROM users WHERE role = 'admin'`)
  return rows.map((r) => r.id)
}

export async function pushAdminNotification(input: {
  type: string
  title: string
  body: string
  link?: string
}) {
  const admins = await adminUserIds()
  if (!admins.length) return

  const notifications = (await readCollection('notifications')) as Record<string, unknown>[]
  const date = new Date().toISOString()
  for (const userId of admins) {
    notifications.unshift({
      id: uid('notif'),
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      date,
      read: false,
      link: input.link ?? '/espace-admin/notifications',
    })
  }
  await writeCollection('notifications', notifications)
}
