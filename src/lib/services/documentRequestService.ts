import type { DocumentRequest, MessageAttachment, User } from '../auth/types'
import {
  appendActivity,
  appendMessage,
  getDocumentRequests,
  saveDocumentRequests,
  uid,
} from '../data/store'
import { notifyAdmins, notifyUser, senderLabel } from './notificationService'

export function getRequestsForUser(userId: string) {
  return getDocumentRequests()
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getRequestsForProject(projectId: string) {
  return getDocumentRequests().filter((r) => r.projectId === projectId)
}

export function getPendingRequestsForUser(userId: string) {
  return getRequestsForUser(userId).filter((r) => r.status === 'pending')
}

export function countPendingRequestsForUser(userId: string) {
  return getPendingRequestsForUser(userId).length
}

export function createDocumentRequest(input: {
  admin: User
  clientUserId: string
  projectId: string
  projectTitle: string
  title: string
  reason: string
}) {
  const request: DocumentRequest = {
    id: uid('dreq'),
    userId: input.clientUserId,
    projectId: input.projectId,
    projectTitle: input.projectTitle,
    requestedBy: input.admin.id,
    requestedByName: input.admin.name,
    title: input.title.trim(),
    reason: input.reason.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const requests = getDocumentRequests()
  requests.unshift(request)
  saveDocumentRequests(requests)

  appendActivity({
    id: uid('act'),
    userId: input.clientUserId,
    projectId: input.projectId,
    label: `Document demandé : ${request.title}`,
    date: new Date().toISOString(),
    type: 'file',
  })

  notifyUser({
    userId: input.clientUserId,
    type: 'document_request',
    title: `Document demandé · ${input.projectTitle}`,
    body: `${input.admin.name} demande : ${request.title}`,
    projectId: input.projectId,
    link: `/espace-client/documents?request=${request.id}`,
  })

  appendMessage({
    id: uid('msg'),
    userId: input.clientUserId,
    projectId: input.projectId,
    projectTitle: input.projectTitle,
    from: senderLabel(input.admin),
    fromUserId: input.admin.id,
    role: 'team',
    content: `Demande de document : ${request.title}\n\nPourquoi : ${request.reason}`,
    date: new Date().toISOString(),
    read: false,
    documentRequestId: request.id,
  })

  return request
}

export function fulfillDocumentRequest(input: {
  requestId: string
  client: User
  attachments: MessageAttachment[]
  note?: string
}) {
  const requests = getDocumentRequests()
  const index = requests.findIndex((r) => r.id === input.requestId)
  if (index === -1) return null

  const request = requests[index]
  if (request.userId !== input.client.id || request.status !== 'pending') return null

  const content = input.note?.trim()
    ? `Document transmis pour : ${request.title}\n\n${input.note.trim()}`
    : `Document transmis pour : ${request.title}`

  const message = appendMessage({
    id: uid('msg'),
    userId: request.userId,
    projectId: request.projectId,
    projectTitle: request.projectTitle,
    from: input.client.name,
    fromUserId: input.client.id,
    role: 'client',
    content,
    date: new Date().toISOString(),
    read: false,
    attachments: input.attachments,
    documentRequestId: request.id,
  })

  requests[index] = {
    ...request,
    status: 'fulfilled',
    fulfilledAt: new Date().toISOString(),
    responseMessageId: message.id,
  }
  saveDocumentRequests(requests)

  appendActivity({
    id: uid('act'),
    userId: request.userId,
    projectId: request.projectId,
    label: `Document reçu : ${request.title}`,
    date: new Date().toISOString(),
    type: 'file',
  })

  notifyAdmins({
    type: 'document_received',
    title: `Document reçu · ${request.projectTitle}`,
    body: `${input.client.name} a transmis : ${request.title}`,
    projectId: request.projectId,
    link: `/espace-admin/messages?project=${request.projectId}`,
  })

  return message
}

export function cancelDocumentRequest(requestId: string) {
  const requests = getDocumentRequests()
  const index = requests.findIndex((r) => r.id === requestId)
  if (index === -1) return null
  requests[index] = { ...requests[index], status: 'cancelled' }
  saveDocumentRequests(requests)
  return requests[index]
}
