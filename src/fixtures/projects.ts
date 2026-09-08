import type { ClientActivity, ClientProject } from '../lib/auth/types'

export const PROJECT_STATUS_LABELS: Record<ClientProject['status'], string> = {
  maquette: 'Maquette',
  en_cours: 'En cours',
  validation: 'Validation',
  livre: 'Livré',
}

export const FIXTURE_PROJECTS: ClientProject[] = [
  {
    id: 'proj-1',
    userId: 'fixture-client-1',
    title: 'Site vitrine Laurent Design',
    type: 'Site web',
    status: 'en_cours',
    progress: 62,
    updatedAt: '2026-09-05',
    startedAt: '2026-08-12',
    deadline: '2026-10-15',
    nextStep: 'Validation de la page Services',
    description: 'Refonte complète du site vitrine avec une identité plus premium, orientée portfolio et prise de contact.',
    milestones: [
      { id: 'm1-1', label: 'Brief et cadrage', done: true, date: '2026-08-15' },
      { id: 'm1-2', label: 'Maquette homepage', done: true, date: '2026-08-28' },
      { id: 'm1-3', label: 'Pages intérieures', done: true, date: '2026-09-02' },
      { id: 'm1-4', label: 'Validation client', done: false },
      { id: 'm1-5', label: 'Mise en ligne', done: false },
    ],
  },
  {
    id: 'proj-2',
    userId: 'fixture-client-1',
    title: 'Refonte identité visuelle',
    type: 'Branding',
    status: 'maquette',
    progress: 28,
    updatedAt: '2026-09-06',
    startedAt: '2026-09-01',
    deadline: '2026-09-20',
    nextStep: 'Première maquette sous 48h',
    description: 'Création d\'une nouvelle direction visuelle : logo, palette, typographies et déclinaisons web.',
    milestones: [
      { id: 'm2-1', label: 'Moodboard', done: true, date: '2026-09-03' },
      { id: 'm2-2', label: 'Propositions logo', done: false },
      { id: 'm2-3', label: 'Charte graphique', done: false },
    ],
  },
  {
    id: 'proj-3',
    userId: 'fixture-client-2',
    title: 'E-commerce Mercier & Co',
    type: 'E-commerce',
    status: 'validation',
    progress: 85,
    updatedAt: '2026-09-07',
    startedAt: '2026-07-01',
    deadline: '2026-09-30',
    nextStep: 'Retours client sur le tunnel d\'achat',
    description: 'Boutique en ligne avec catalogue produits, paiement sécurisé et gestion des commandes.',
    milestones: [
      { id: 'm3-1', label: 'Architecture boutique', done: true, date: '2026-07-15' },
      { id: 'm3-2', label: 'Design pages clés', done: true, date: '2026-08-10' },
      { id: 'm3-3', label: 'Intégration panier', done: true, date: '2026-08-28' },
      { id: 'm3-4', label: 'Recette client', done: false },
      { id: 'm3-5', label: 'Lancement', done: false },
    ],
    mockupUrl: 'https://mercier-co-demo.netlify.app',
    mockupPublishedAt: '2026-09-07T09:00:00',
    validation: { choice: 'pending' },
  },
  {
    id: 'proj-4',
    userId: 'fixture-client-2',
    title: 'Application mobile catalogue',
    type: 'App mobile',
    status: 'maquette',
    progress: 15,
    updatedAt: '2026-09-04',
    startedAt: '2026-09-02',
    deadline: '2026-11-01',
    nextStep: 'Wireframes écrans principaux',
    description: 'Application iOS et Android pour consulter le catalogue et demander un devis en showroom.',
    milestones: [
      { id: 'm4-1', label: 'Atelier fonctionnel', done: true, date: '2026-09-03' },
      { id: 'm4-2', label: 'Wireframes', done: false },
      { id: 'm4-3', label: 'Maquettes UI', done: false },
    ],
  },
  {
    id: 'proj-5',
    userId: 'fixture-admin-1',
    title: 'Portail interne Sirius',
    type: 'Logiciel',
    status: 'en_cours',
    progress: 45,
    updatedAt: '2026-09-06',
    startedAt: '2026-06-01',
    deadline: '2026-12-01',
    nextStep: 'Module gestion des maquettes',
    description: 'Outil interne pour piloter les projets clients, les maquettes et le suivi des livraisons.',
    milestones: [
      { id: 'm5-1', label: 'Spécifications', done: true, date: '2026-06-20' },
      { id: 'm5-2', label: 'Authentification', done: true, date: '2026-07-30' },
      { id: 'm5-3', label: 'Espace client', done: false },
      { id: 'm5-4', label: 'Notifications', done: false },
    ],
  },
]

export const FIXTURE_ACTIVITIES: ClientActivity[] = [
  {
    id: 'act-1',
    userId: 'fixture-client-1',
    projectId: 'proj-1',
    label: 'Maquette homepage v2 disponible',
    date: '2026-09-06T14:30:00',
    type: 'file',
  },
  {
    id: 'act-2',
    userId: 'fixture-client-1',
    projectId: 'proj-2',
    label: 'Message de l\'équipe Sirius sur le projet branding',
    date: '2026-09-05T10:15:00',
    type: 'message',
  },
  {
    id: 'act-3',
    userId: 'fixture-client-2',
    projectId: 'proj-3',
    label: 'Statut passé en validation client',
    date: '2026-09-07T09:00:00',
    type: 'status',
  },
  {
    id: 'act-4',
    userId: 'fixture-client-2',
    projectId: 'proj-3',
    label: 'Nouveau commentaire sur le checkout',
    date: '2026-09-06T16:45:00',
    type: 'message',
  },
  {
    id: 'act-5',
    userId: 'fixture-admin-1',
    projectId: 'proj-5',
    label: '3 nouvelles demandes de maquette',
    date: '2026-09-07T08:30:00',
    type: 'status',
  },
]

export function getProjectsForUser(userId: string) {
  return FIXTURE_PROJECTS.filter((p) => p.userId === userId)
}

export function getProjectById(projectId: string) {
  return FIXTURE_PROJECTS.find((p) => p.id === projectId)
}

export function getActivitiesForUser(userId: string) {
  return FIXTURE_ACTIVITIES.filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getActivitiesForProject(projectId: string) {
  return FIXTURE_ACTIVITIES.filter((a) => a.projectId === projectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
