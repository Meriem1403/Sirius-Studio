import { uid } from '../db.js'
import { readCollection, writeCollection } from '../workspace/state.js'

const ADMIN_USER_ID = 'fixture-admin-1'

export async function pushAdminNotification(input: {
  type: string
  title: string
  body: string
  link?: string
}) {
  const notifications = (await readCollection('notifications')) as Record<string, unknown>[]
  notifications.unshift({
    id: uid('notif'),
    userId: ADMIN_USER_ID,
    type: input.type,
    title: input.title,
    body: input.body,
    date: new Date().toISOString(),
    read: false,
    link: input.link ?? '/espace-admin/notifications',
  })
  await writeCollection('notifications', notifications)
}
