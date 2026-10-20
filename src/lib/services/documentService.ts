import type { ClientDocument } from '../auth/types'
import { getDocuments } from '../data/store'

export { DOCUMENT_KIND_LABELS } from '../../fixtures/documents'

export function getDocumentsForUser(userId: string): ClientDocument[] {
  return getDocuments()
    .filter((d) => d.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getDocumentsForProject(projectId: string): ClientDocument[] {
  return getDocuments().filter((d) => d.projectId === projectId)
}

export function openDocumentDownload(doc: ClientDocument) {
  if (doc.url) {
    window.open(doc.url, '_blank', 'noopener,noreferrer')
    return
  }
  window.alert('Ce fichier est une démo sans lien de téléchargement. Contactez Sirius Studio pour recevoir le livrable.')
}
