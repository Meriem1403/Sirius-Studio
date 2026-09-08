import type { DocumentRequest } from '../lib/auth/types'

export const FIXTURE_DOCUMENT_REQUESTS: DocumentRequest[] = [
  {
    id: 'dreq-1',
    userId: 'fixture-client-1',
    projectId: 'proj-1',
    projectTitle: 'Site vitrine Laurent Design',
    requestedBy: 'fixture-admin-1',
    requestedByName: 'Alex Sirius',
    title: 'Logo vectoriel et charte existante',
    reason: 'Pour aligner la maquette sur votre identité actuelle et éviter les allers-retours sur les couleurs.',
    status: 'pending',
    createdAt: '2026-09-06T11:00:00',
  },
]
