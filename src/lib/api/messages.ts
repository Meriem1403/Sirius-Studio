import type { ClientMessage, ClientProject } from '../auth/types'
import { apiFetch } from './http'

export async function fetchMessages(projectId?: string) {
  const q = projectId ? `?project=${encodeURIComponent(projectId)}` : ''
  const data = await apiFetch<{ messages: ClientMessage[] }>(`/messages${q}`)
  return data.messages
}

export async function sendApiMessage(input: {
  projectId: string
  projectTitle: string
  clientUserId: string
  content: string
  attachments?: unknown[]
  documentRequestId?: string
}) {
  const data = await apiFetch<{ message: ClientMessage }>('/messages', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.message
}

export async function markApiMessagesRead(projectId?: string) {
  const q = projectId ? `?project=${encodeURIComponent(projectId)}` : ''
  await apiFetch(`/messages/mark-read${q}`, { method: 'POST' })
}

export async function fetchApiProjects(): Promise<ClientProject[]> {
  const data = await apiFetch<{ projects: Record<string, unknown>[] }>('/messages/projects')
  return data.projects.map(mapProject)
}

function mapProject(row: Record<string, unknown>): ClientProject {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    type: row.type as string,
    status: row.status as ClientProject['status'],
    progress: Number(row.progress),
    updatedAt: (row.updated_at as Date | string).toString(),
    nextStep: (row.next_step as string) ?? '',
    description: (row.description as string) ?? '',
    startedAt: (row.started_at as Date | string).toString(),
    deadline: row.deadline ? String(row.deadline) : undefined,
    milestones: (row.milestones as ClientProject['milestones']) ?? [],
    mockupUrl: (row.mockup_url as string | null) ?? undefined,
    mockupPublishedAt: row.mockup_published_at ? String(row.mockup_published_at) : undefined,
    validation: row.validation as ClientProject['validation'],
  }
}
