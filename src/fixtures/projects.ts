import type { ClientActivity, ClientProject } from '../lib/auth/types'

export const FIXTURE_PROJECTS: ClientProject[] = [
  {
    id: 'proj-1',
    userId: 'fixture-client-1',
    title: 'Site vitrine Laurent Design',
    type: 'Site web',
    status: 'en_cours',
    progress: 62,
    updatedAt: '2026-09-05',
    nextStep: 'Validation de la page Services',
  },
  {
    id: 'proj-2',
    userId: 'fixture-client-1',
    title: 'Refonte identité visuelle',
    type: 'Branding',
    status: 'maquette',
    progress: 28,
    updatedAt: '2026-09-06',
    nextStep: 'Première maquette sous 48h',
  },
  {
    id: 'proj-3',
    userId: 'fixture-client-2',
    title: 'E-commerce Mercier & Co',
    type: 'E-commerce',
    status: 'validation',
    progress: 85,
    updatedAt: '2026-09-07',
    nextStep: 'Retours client sur le tunnel d\'achat',
  },
  {
    id: 'proj-4',
    userId: 'fixture-client-2',
    title: 'Application mobile catalogue',
    type: 'App mobile',
    status: 'maquette',
    progress: 15,
    updatedAt: '2026-09-04',
    nextStep: 'Wireframes écrans principaux',
  },
  {
    id: 'proj-5',
    userId: 'fixture-admin-1',
    title: 'Portail interne Sirius',
    type: 'Logiciel',
    status: 'en_cours',
    progress: 45,
    updatedAt: '2026-09-06',
    nextStep: 'Module gestion des maquettes',
  },
]

export const FIXTURE_ACTIVITIES: ClientActivity[] = [
  {
    id: 'act-1',
    userId: 'fixture-client-1',
    label: 'Maquette homepage v2 disponible',
    date: '2026-09-06T14:30:00',
    type: 'file',
  },
  {
    id: 'act-2',
    userId: 'fixture-client-1',
    label: 'Message de l\'équipe Sirius sur le projet branding',
    date: '2026-09-05T10:15:00',
    type: 'message',
  },
  {
    id: 'act-3',
    userId: 'fixture-client-2',
    label: 'Statut passé en validation client',
    date: '2026-09-07T09:00:00',
    type: 'status',
  },
  {
    id: 'act-4',
    userId: 'fixture-client-2',
    label: 'Nouveau commentaire sur le checkout',
    date: '2026-09-06T16:45:00',
    type: 'message',
  },
  {
    id: 'act-5',
    userId: 'fixture-admin-1',
    label: '3 nouvelles demandes de maquette',
    date: '2026-09-07T08:30:00',
    type: 'status',
  },
]

export const PROJECT_STATUS_LABELS: Record<ClientProject['status'], string> = {
  maquette: 'Maquette',
  en_cours: 'En cours',
  validation: 'Validation',
  livre: 'Livré',
}

export function getProjectsForUser(userId: string) {
  return FIXTURE_PROJECTS.filter((p) => p.userId === userId)
}

export function getActivitiesForUser(userId: string) {
  return FIXTURE_ACTIVITIES.filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
