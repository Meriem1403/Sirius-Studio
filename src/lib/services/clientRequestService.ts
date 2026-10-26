import type { User } from '../auth/types'
import { isApiMode } from '../api/config'
import { submitClientProjectRequest, type ClientRequestPayload } from '../api/requests'
import { applyWorkspaceProjects, syncWorkspace } from '../api/workspaceSync'
import {
  appendActivity,
  appendMessage,
  appendNotification,
  getProjects,
  saveProjects,
  uid,
} from '../data/store'
import type { ClientProject } from '../auth/types'

export async function submitClientRequest(user: User, payload: ClientRequestPayload) {
  if (isApiMode()) {
    const result = await submitClientProjectRequest(payload)
    applyWorkspaceProjects(result.projects)
    await syncWorkspace()
    return { projectId: result.projectId, projects: result.projects }
  }

  const today = new Date().toISOString().slice(0, 10)
  const title = payload.title ?? payload.needs[0] ?? 'Projet web'
  const type = payload.type ?? payload.needs[0] ?? 'Site vitrine'
  const lines = [payload.message]
  if (payload.situation) lines.push(`Situation : ${payload.situation}`)
  if (payload.website) lines.push(`Site actuel : ${payload.website}`)
  if (payload.needs.length) lines.push(`Besoins : ${payload.needs.join(', ')}`)
  if (payload.objectives?.length) lines.push(`Objectifs : ${payload.objectives.join(', ')}`)
  const description = lines.filter(Boolean).join('\n')
  const project: ClientProject = {
    id: uid('proj'),
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

  const projects = [project, ...getProjects()]
  saveProjects(projects)

  appendMessage({
    id: uid('msg'),
    userId: user.id,
    projectId: project.id,
    projectTitle: project.title,
    from: user.name,
    fromUserId: user.id,
    role: 'client',
    content: payload.message,
    date: new Date().toISOString(),
    read: false,
  })

  appendActivity({
    id: uid('act'),
    userId: user.id,
    projectId: project.id,
    type: 'status',
    label: `Demande envoyée · ${project.title}`,
    date: new Date().toISOString(),
  })

  appendNotification({
    id: uid('notif'),
    userId: user.id,
    type: 'status',
    title: 'Demande bien reçue',
    body: `Nous étudions votre projet « ${project.title} ».`,
    date: new Date().toISOString(),
    read: false,
    link: `/espace-client/projets/${project.id}`,
  })

  return { projectId: project.id, projects }
}
