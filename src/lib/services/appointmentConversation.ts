import type { Appointment, User } from '../auth/types'
import { flushWorkspacePersist, uid } from '../data/store'
import { confirmAppointmentSlot, createAppointment, setAppointmentStatus } from './appointmentService'
import { sendMessage } from './messageService'

export function formatSlot(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(iso))
}

export async function sendAppointmentProposal(input: {
  sender: User
  clientUserId: string
  clientName: string
  projectId: string
  projectTitle: string
  title: string
  slots: { startAt: string; endAt: string }[]
  status: 'proposed' | 'requested'
  type?: Appointment['type']
  location?: string
  meetingUrl?: string
  description?: string
}) {
  if (input.slots.length === 0) return []
  const proposalId = uid('prop')
  const created: Appointment[] = []
  for (const slot of input.slots) {
    const appt = createAppointment({
      title: input.title,
      description: input.description,
      startAt: slot.startAt,
      endAt: slot.endAt,
      userId: input.clientUserId,
      projectId: input.projectId,
      location: input.location,
      meetingUrl: input.meetingUrl,
      type: input.type ?? 'other',
      status: input.status,
      proposalId,
      createdBy: input.sender.id,
      clientName: input.clientName,
      silent: true,
    })
    if (!appt) return null
    created.push(appt)
  }
  await flushWorkspacePersist()
  const lines = created.map((appt, index) => `${index + 1}. ${formatSlot(appt.startAt)} → ${formatSlot(appt.endAt)}`)
  const heading =
    input.status === 'proposed'
      ? `Demande de rendez-vous : ${input.title}\n${created.length > 1 ? 'Créneaux proposés' : 'Créneau proposé'} :`
      : `Demande de rendez-vous : ${input.title}\n${created.length > 1 ? 'Créneaux souhaités' : 'Créneau souhaité'} :`
  await sendMessage({
    sender: input.sender,
    clientUserId: input.clientUserId,
    projectId: input.projectId,
    projectTitle: input.projectTitle,
    content: `${heading}\n${lines.join('\n')}\nRépondez ici : accepter, refuser ou proposer une autre date.`,
  })
  return created
}

export async function answerAppointment(input: {
  sender: User
  appointment: Appointment
  projectTitle: string
  decision: 'confirm' | 'decline'
}) {
  const updated =
    input.decision === 'confirm'
      ? confirmAppointmentSlot(input.appointment.id)
      : setAppointmentStatus(input.appointment.id, 'declined')
  if (!updated || !input.appointment.projectId) return updated
  await flushWorkspacePersist()
  const when = `${formatSlot(input.appointment.startAt)} → ${formatSlot(input.appointment.endAt)}`
  await sendMessage({
    sender: input.sender,
    clientUserId: input.appointment.userId,
    projectId: input.appointment.projectId,
    projectTitle: input.projectTitle,
    content:
      input.decision === 'confirm'
        ? `Rendez-vous accepté : ${input.appointment.title}\n${when}`
        : `Rendez-vous refusé : ${input.appointment.title}\n${when}`,
  })
  return updated
}
