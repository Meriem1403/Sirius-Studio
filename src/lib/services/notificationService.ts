import type { NotificationDelivery, NotificationType, User } from '../auth/types'
import {
  appendDelivery,
  appendNotification,
  getDeliveries,
  getNotifications,
  getProfile,
  saveNotifications,
  uid,
} from '../data/store'
import { FIXTURE_ACCOUNTS } from '../../fixtures/users'

function shouldSend(type: NotificationType, prefs: ReturnType<typeof getProfile>['notificationPrefs'], channel: 'email' | 'sms') {
  if (channel === 'email' && !prefs.email) return false
  if (channel === 'sms' && !prefs.sms) return false

  switch (type) {
    case 'mockup_ready':
      return prefs.mockupReady
    case 'message':
      return prefs.messages
    case 'document_request':
    case 'document_received':
    case 'attachment':
      return prefs.messages
    case 'quote_requested':
    case 'quote_sent':
      return prefs.quotes
    case 'validation_received':
    case 'revision_requested':
    case 'status':
      return prefs.statusUpdates
    default:
      return true
  }
}

function resolveContact(userId: string) {
  const account = FIXTURE_ACCOUNTS.find((a) => a.id === userId)
  const profile = getProfile(userId)
  return {
    email: account?.email ?? 'inconnu@sirius.studio',
    phone: profile.phone ?? '',
    name: account?.name ?? 'Utilisateur',
  }
}

export function notifyUser(input: {
  userId: string
  type: NotificationType
  title: string
  body: string
  projectId?: string
  link?: string
}) {
  appendNotification({
    id: uid('notif'),
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    date: new Date().toISOString(),
    read: false,
    projectId: input.projectId,
    link: input.link,
  })

  const prefs = getProfile(input.userId).notificationPrefs
  const contact = resolveContact(input.userId)

  if (shouldSend(input.type, prefs, 'email')) {
    appendDelivery({
      id: uid('mail'),
      userId: input.userId,
      channel: 'email',
      subject: input.title,
      body: input.body,
      date: new Date().toISOString(),
      status: 'sent',
      recipient: contact.email,
    })
  }

  if (shouldSend(input.type, prefs, 'sms') && contact.phone) {
    const smsBody = `${input.title}. ${input.body.slice(0, 120)}${input.body.length > 120 ? '…' : ''}`
    appendDelivery({
      id: uid('sms'),
      userId: input.userId,
      channel: 'sms',
      subject: input.title,
      body: smsBody,
      date: new Date().toISOString(),
      status: 'sent',
      recipient: contact.phone,
    })
  }
}

export function notifyAdmins(input: {
  type: NotificationType
  title: string
  body: string
  projectId?: string
  link?: string
}) {
  FIXTURE_ACCOUNTS.filter((a) => a.role === 'admin').forEach((admin) => {
    notifyUser({ ...input, userId: admin.id })
  })
}

export function markNotificationRead(notificationId: string) {
  const notifications = getNotifications()
  const index = notifications.findIndex((n) => n.id === notificationId)
  if (index === -1) return
  notifications[index] = { ...notifications[index], read: true }
  saveNotifications(notifications)
}

export function markAllNotificationsRead(userId: string) {
  const notifications = getNotifications().map((n) =>
    n.userId === userId ? { ...n, read: true } : n,
  )
  saveNotifications(notifications)
}

export function countUnreadNotifications(userId: string) {
  return getNotifications().filter((n) => n.userId === userId && !n.read).length
}

export function getDeliveriesForUser(userId: string): NotificationDelivery[] {
  return getDeliveries().filter((d) => d.userId === userId)
}

export function senderLabel(user: User) {
  return user.role === 'admin' ? `${user.name} · Sirius Studio` : user.name
}
