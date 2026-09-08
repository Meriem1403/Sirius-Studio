import type { Appointment } from '../auth/types'
import {
  appendActivity,
  appendAppointment,
  getAppointments,
  getProjects,
  saveAppointments,
  uid,
} from '../data/store'
import { FIXTURE_ACCOUNTS } from '../../fixtures/users'
import { notifyUser } from './notificationService'

export function getAllAppointments() {
  return getAppointments().sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  )
}

export function getAppointmentsForUser(userId: string) {
  return getAllAppointments().filter((a) => a.userId === userId)
}

export function getAppointmentById(id: string) {
  return getAllAppointments().find((a) => a.id === id)
}

export function getUpcomingAppointments(userId?: string, limit = 5) {
  const now = Date.now()
  let list = getAllAppointments().filter((a) => new Date(a.startAt).getTime() >= now)
  if (userId) list = list.filter((a) => a.userId === userId)
  return list.slice(0, limit)
}

export function createAppointment(input: {
  title: string
  description?: string
  startAt: string
  endAt: string
  userId: string
  projectId?: string
  location?: string
  meetingUrl?: string
  type: Appointment['type']
  createdBy: string
}) {
  const start = new Date(input.startAt)
  const end = new Date(input.endAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null
  }

  const client = FIXTURE_ACCOUNTS.find((a) => a.id === input.userId)
  const project = input.projectId
    ? getProjects().find((p) => p.id === input.projectId)
    : undefined

  const appt: Appointment = {
    id: uid('appt'),
    title: input.title.trim(),
    description: input.description?.trim(),
    startAt: input.startAt,
    endAt: input.endAt,
    userId: input.userId,
    clientName: client?.name ?? 'Client',
    projectId: input.projectId,
    projectTitle: project?.title,
    createdBy: input.createdBy,
    location: input.location?.trim(),
    meetingUrl: input.meetingUrl?.trim(),
    type: input.type,
  }

  appendAppointment(appt)

  notifyUser({
    userId: input.userId,
    type: 'status',
    title: `Rendez-vous planifié · ${appt.title}`,
    body: `Le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(appt.startAt))}`,
    projectId: input.projectId,
    link: '/espace-client/agenda',
  })

  appendActivity({
    id: uid('act'),
    userId: input.userId,
    projectId: input.projectId,
    label: `RDV planifié : ${appt.title}`,
    date: new Date().toISOString(),
    type: 'status',
  })

  return appt
}

export function deleteAppointment(id: string) {
  saveAppointments(getAppointments().filter((a) => a.id !== id))
}

export function countUpcomingAppointments(userId?: string) {
  const now = Date.now()
  return getAllAppointments().filter(
    (a) => new Date(a.startAt).getTime() >= now && (!userId || a.userId === userId),
  ).length
}

export const APPOINTMENT_TYPE_LABELS: Record<Appointment['type'], string> = {
  discovery: 'Découverte',
  review: 'Point projet',
  delivery: 'Livraison',
  kickoff: 'Lancement',
  other: 'Autre',
}
