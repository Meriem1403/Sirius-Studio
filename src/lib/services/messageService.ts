import type { MessageAttachment, User } from '../auth/types'
import type { ClientMessage } from '../auth/types'
import { appendMessage, getMessages, saveMessages, uid } from '../data/store'
import { notifyAdmins, notifyUser, senderLabel } from './notificationService'
import { FIXTURE_ACCOUNTS } from '../../fixtures/users'

export function getMessagesForUser(userId: string) {
  return getMessages()
    .filter((m) => m.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getMessagesForProject(projectId: string) {
  return getMessages()
    .filter((m) => m.projectId === projectId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function countUnreadMessages(userId: string) {
  return getMessages().filter((m) => m.userId === userId && !m.read && m.role === 'team').length
}

export function countUnreadMessagesForAdmin() {
  return getMessages().filter((m) => m.role === 'client' && !m.read).length
}

export function markAdminMessagesRead() {
  const messages = getMessages().map((m) =>
    m.role === 'client' ? { ...m, read: true } : m,
  )
  saveMessages(messages)
}

export function markMessagesRead(userId: string, projectId?: string) {
  const messages = getMessages().map((m) => {
    if (m.userId !== userId) return m
    if (projectId && m.projectId !== projectId) return m
    if (m.role !== 'team') return m
    return { ...m, read: true }
  })
  saveMessages(messages)
}

export function sendMessage(input: {
  sender: User
  clientUserId: string
  projectId: string
  projectTitle: string
  content: string
  attachments?: MessageAttachment[]
  documentRequestId?: string
}) {
  const role = input.sender.role === 'admin' ? 'team' : 'client'
  const hasAttachments = (input.attachments?.length ?? 0) > 0
  const message: ClientMessage = {
    id: uid('msg'),
    userId: input.clientUserId,
    projectId: input.projectId,
    projectTitle: input.projectTitle,
    from: senderLabel(input.sender),
    fromUserId: input.sender.id,
    role,
    content: input.content.trim(),
    date: new Date().toISOString(),
    read: false,
    attachments: input.attachments,
    documentRequestId: input.documentRequestId,
  }
  appendMessage(message)

  const attachHint = hasAttachments ? ` (${input.attachments!.length} pièce${input.attachments!.length > 1 ? 's' : ''} jointe${input.attachments!.length > 1 ? 's' : ''})` : ''
  const bodyPreview = input.content.trim().slice(0, 100) + attachHint

  if (role === 'client') {
    notifyAdmins({
      type: hasAttachments ? 'attachment' : 'message',
      title: `Nouveau message · ${input.projectTitle}`,
      body: `${input.sender.name} : ${bodyPreview}`,
      projectId: input.projectId,
      link: `/espace-admin/messages?project=${input.projectId}`,
    })
  } else {
    notifyUser({
      userId: input.clientUserId,
      type: hasAttachments ? 'attachment' : 'message',
      title: `Réponse Sirius · ${input.projectTitle}`,
      body: bodyPreview,
      projectId: input.projectId,
      link: `/espace-client/messages?project=${input.projectId}`,
    })
  }

  return message
}

export function getClientName(userId: string) {
  return FIXTURE_ACCOUNTS.find((a) => a.id === userId)?.name ?? 'Client'
}

export function getAllMessagesForAdmin() {
  return getMessages().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
