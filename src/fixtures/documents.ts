import type { ClientDocument } from '../lib/auth/types'

export const DOCUMENT_KIND_LABELS: Record<ClientDocument['kind'], string> = {
  maquette: 'Maquette',
  devis: 'Devis',
  contrat: 'Contrat',
  livraison: 'Livraison',
}

export const FIXTURE_DOCUMENTS: ClientDocument[] = [
  {
    id: 'doc-1',
    userId: 'fixture-client-1',
    projectId: 'proj-1',
    projectTitle: 'Site vitrine Laurent Design',
    name: 'Homepage v2.fig',
    kind: 'maquette',
    size: '4,2 Mo',
    date: '2026-09-06',
  },
  {
    id: 'doc-2',
    userId: 'fixture-client-1',
    projectId: 'proj-1',
    projectTitle: 'Site vitrine Laurent Design',
    name: 'Devis site vitrine.pdf',
    kind: 'devis',
    size: '320 Ko',
    date: '2026-08-12',
  },
  {
    id: 'doc-3',
    userId: 'fixture-client-1',
    projectId: 'proj-2',
    projectTitle: 'Refonte identité visuelle',
    name: 'Moodboard branding.pdf',
    kind: 'maquette',
    size: '8,1 Mo',
    date: '2026-09-03',
  },
  {
    id: 'doc-4',
    userId: 'fixture-client-2',
    projectId: 'proj-3',
    projectTitle: 'E-commerce Mercier & Co',
    name: 'Tunnel achat v3.fig',
    kind: 'maquette',
    size: '6,7 Mo',
    date: '2026-09-05',
  },
  {
    id: 'doc-5',
    userId: 'fixture-client-2',
    projectId: 'proj-3',
    projectTitle: 'E-commerce Mercier & Co',
    name: 'Contrat prestation.pdf',
    kind: 'contrat',
    size: '410 Ko',
    date: '2026-07-01',
  },
  {
    id: 'doc-6',
    userId: 'fixture-client-2',
    projectId: 'proj-4',
    projectTitle: 'Application mobile catalogue',
    name: 'Brief fonctionnel.pdf',
    kind: 'livraison',
    size: '890 Ko',
    date: '2026-09-02',
  },
  {
    id: 'doc-7',
    userId: 'fixture-admin-1',
    projectId: 'proj-5',
    projectTitle: 'Portail interne Sirius',
    name: 'Specs espace client.pdf',
    kind: 'livraison',
    size: '1,2 Mo',
    date: '2026-08-20',
  },
]

export function getDocumentsForUser(userId: string) {
  return FIXTURE_DOCUMENTS.filter((d) => d.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getDocumentsForProject(projectId: string) {
  return FIXTURE_DOCUMENTS.filter((d) => d.projectId === projectId)
}
