import type { MessageAttachment, User } from '../auth/types'
import { FIXTURE_ACCOUNTS } from '../../fixtures/users'
import { getDocumentRequests, getMessages, getProjects } from '../data/store'
import { getPendingRequestsForUser } from './documentRequestService'
import { countUnreadMessages } from './messageService'

export interface PortfolioClient {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  projectCount: number
  activeProjects: number
  totalProgress: number
  pendingDocs: number
  unreadMessages: number
  lastActivity?: string
  projects: ReturnType<typeof getProjects>
}

export function getClientPortfolio(): PortfolioClient[] {
  const clients = FIXTURE_ACCOUNTS.filter((a) => a.role === 'client')
  const projects = getProjects()
  const messages = getMessages()

  return clients.map((client) => {
    const clientProjects = projects.filter((p) => p.userId === client.id)
    const active = clientProjects.filter(
      (p) => p.status === 'en_cours' || p.status === 'validation' || p.status === 'maquette',
    )
    const avgProgress = clientProjects.length
      ? Math.round(clientProjects.reduce((s, p) => s + p.progress, 0) / clientProjects.length)
      : 0

    const clientMessages = messages.filter((m) => m.userId === client.id)
    const lastMsg = clientMessages.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0]

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      company: client.company,
      projectCount: clientProjects.length,
      activeProjects: active.length,
      totalProgress: avgProgress,
      pendingDocs: getPendingRequestsForUser(client.id).length,
      unreadMessages: countUnreadMessages(client.id),
      lastActivity: lastMsg?.date,
      projects: clientProjects,
    }
  })
}

export function getPortfolioSummary() {
  const portfolio = getClientPortfolio()
  const requests = getDocumentRequests().filter((r) => r.status === 'pending')
  return {
    clientCount: portfolio.length,
    activeProjects: portfolio.reduce((s, c) => s + c.activeProjects, 0),
    pendingDocuments: requests.length,
    avgProgress: portfolio.length
      ? Math.round(portfolio.reduce((s, c) => s + c.totalProgress, 0) / portfolio.length)
      : 0,
  }
}

export function getClientPortfolioEntry(userId: string) {
  return getClientPortfolio().find((c) => c.id === userId)
}

export type AttachmentInput = {
  file: File
  label: string
  reason: string
}

export function buildAttachmentsFromFiles(
  items: { name: string; size: string; mimeType: string; dataUrl?: string; label: string; reason: string }[],
): MessageAttachment[] {
  return items.map((item) => ({
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: item.name,
    size: item.size,
    mimeType: item.mimeType,
    label: item.label,
    reason: item.reason,
    dataUrl: item.dataUrl,
  }))
}

export function senderDisplay(user: User) {
  return user.role === 'admin' ? `${user.name} · Sirius Studio` : user.name
}
