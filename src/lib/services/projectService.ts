import type { MockupClientChoice, User } from '../auth/types'
import {
  appendActivity,
  getActivities,
  getProjects,
  updateProject,
  uid,
} from '../data/store'
import { MOCKUP_CHOICE_LABELS } from '../client/validation'
import { sendMessage } from './messageService'
import { notifyAdmins, notifyUser } from './notificationService'
import { autoCreateQuoteOnRequest } from './billingService'
import { FIXTURE_ACCOUNTS } from '../../fixtures/users'

export function getProjectById(projectId: string) {
  return getProjects().find((p) => p.id === projectId)
}

export function getProjectsForUser(userId: string) {
  return getProjects().filter((p) => p.userId === userId)
}

export function getAllProjects() {
  return getProjects()
}

export function getActivitiesForUser(userId: string) {
  return getActivities()
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getActivitiesForProject(projectId: string) {
  return getActivities()
    .filter((a) => a.projectId === projectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function setMockupUrl(projectId: string, mockupUrl: string) {
  return updateProject(projectId, { mockupUrl: mockupUrl.trim() })
}

export function publishMockup(projectId: string, admin: User) {
  const project = getProjectById(projectId)
  if (!project?.mockupUrl) return null

  const updated = updateProject(projectId, {
    status: 'validation',
    mockupPublishedAt: new Date().toISOString(),
    validation: { choice: 'pending' },
    nextStep: 'Retour client sur la maquette en ligne',
    progress: Math.max(project.progress, 75),
  })

  if (!updated) return null

  appendActivity({
    id: uid('act'),
    userId: project.userId,
    projectId,
    label: `Maquette publiée : ${project.title}`,
    date: new Date().toISOString(),
    type: 'validation',
  })

  notifyUser({
    userId: project.userId,
    type: 'mockup_ready',
    title: 'Votre maquette est prête',
    body: `Consultez la maquette de "${project.title}" et indiquez si elle vous convient.`,
    projectId,
    link: `/espace-client/projets/${projectId}`,
  })

  sendMessage({
    sender: admin,
    clientUserId: project.userId,
    projectId,
    projectTitle: project.title,
    content: `Bonne nouvelle ! Votre maquette est en ligne : ${project.mockupUrl}. Prenez le temps de la parcourir, puis indiquez-nous si vous souhaitez demander un devis ou apporter des modifications.`,
  })

  return updated
}

export function submitMockupValidation(input: {
  projectId: string
  client: User
  choice: MockupClientChoice
  feedback?: string
}) {
  const project = getProjectById(input.projectId)
  if (!project || project.userId !== input.client.id) return null

  const validation = {
    choice: input.choice,
    feedback: input.feedback?.trim(),
    submittedAt: new Date().toISOString(),
  }

  let nextStep = project.nextStep
  let status = project.status

  if (input.choice === 'quote_requested') {
    nextStep = 'Préparation du devis par Sirius Studio'
    status = 'en_cours'
  } else if (input.choice.startsWith('revision_')) {
    nextStep = 'Révision maquette en cours'
    status = 'maquette'
  } else if (input.choice === 'new_direction') {
    nextStep = 'Nouvelle exploration créative'
    status = 'maquette'
  } else if (input.choice === 'pause_project') {
    nextStep = 'Projet en pause'
  } else if (input.choice === 'abandon') {
    nextStep = 'Projet clôturé'
    status = 'livre'
  }

  const updated = updateProject(input.projectId, {
    validation,
    nextStep,
    status,
  })

  if (!updated) return null

  const choiceLabel = MOCKUP_CHOICE_LABELS[input.choice]
  appendActivity({
    id: uid('act'),
    userId: project.userId,
    projectId: input.projectId,
    label: `Retour maquette : ${choiceLabel}`,
    date: new Date().toISOString(),
    type: 'validation',
  })

  const feedbackText = input.feedback?.trim()
    ? `\n\nCommentaire : ${input.feedback.trim()}`
    : ''

  sendMessage({
    sender: input.client,
    clientUserId: project.userId,
    projectId: input.projectId,
    projectTitle: project.title,
    content: `Mon retour sur la maquette : ${choiceLabel}.${feedbackText}`,
  })

  if (input.choice === 'quote_requested') {
    notifyAdmins({
      type: 'quote_requested',
      title: `Devis demandé · ${project.title}`,
      body: `${input.client.name} souhaite un devis après validation de la maquette.`,
      projectId: input.projectId,
      link: `/espace-admin/facturation?project=${input.projectId}`,
    })
    autoCreateQuoteOnRequest(input.projectId)
  } else {
    notifyAdmins({
      type: input.choice.startsWith('revision_') ? 'revision_requested' : 'validation_received',
      title: `Retour maquette · ${project.title}`,
      body: `${input.client.name} : ${choiceLabel}`,
      projectId: input.projectId,
      link: `/espace-admin/projets/${input.projectId}`,
    })
  }

  return updated
}

export function getClientAccount(userId: string) {
  return FIXTURE_ACCOUNTS.find((a) => a.id === userId)
}

export function countPendingValidations() {
  return getProjects().filter(
    (p) => p.status === 'validation' && p.validation?.choice === 'pending',
  ).length
}
