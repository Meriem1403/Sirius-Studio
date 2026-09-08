import type { Appointment } from '../lib/auth/types'

export const APPOINTMENT_TYPE_LABELS: Record<Appointment['type'], string> = {
  discovery: 'Découverte',
  review: 'Point projet',
  delivery: 'Livraison',
  kickoff: 'Lancement',
  other: 'Autre',
}

export const FIXTURE_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1',
    title: 'Point avancement — Site vitrine',
    description: 'Revue des pages intérieures et planning de livraison.',
    startAt: '2026-09-12T10:00:00',
    endAt: '2026-09-12T10:45:00',
    userId: 'fixture-client-1',
    clientName: 'Marie Laurent',
    projectId: 'proj-1',
    projectTitle: 'Site vitrine Laurent Design',
    createdBy: 'fixture-admin-1',
    location: 'Visio',
    meetingUrl: 'https://meet.sirius.studio/marie-sept',
    type: 'review',
  },
  {
    id: 'appt-2',
    title: 'Kick-off e-commerce',
    description: 'Lancement production après paiement de l\'acompte.',
    startAt: '2026-09-15T14:00:00',
    endAt: '2026-09-15T15:00:00',
    userId: 'fixture-client-2',
    clientName: 'Thomas Mercier',
    projectId: 'proj-3',
    projectTitle: 'E-commerce Mercier & Co',
    createdBy: 'fixture-admin-1',
    location: 'Visio',
    meetingUrl: 'https://meet.sirius.studio/mercier-kickoff',
    type: 'kickoff',
  },
]
