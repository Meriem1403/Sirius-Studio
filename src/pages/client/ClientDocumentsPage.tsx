import { useSearchParams } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import DocumentRequestCard from '../../components/workspace/DocumentRequestCard'
import { getDocumentsForUser, DOCUMENT_KIND_LABELS } from '../../fixtures/documents'
import { getRequestsForUser } from '../../lib/services/documentRequestService'
import EmptyState from '../../components/client/EmptyState'
import { formatDate } from '../../lib/client/format'

export default function ClientDocumentsPage() {
  const { user } = useAuth()
  const { refresh } = useWorkspace()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('request')

  if (!user) return null

  const documents = getDocumentsForUser(user.id)
  const requests = getRequestsForUser(user.id)
  const pending = requests.filter((r) => r.status === 'pending')
  const byProject = documents.reduce<Record<string, typeof documents>>((acc, doc) => {
    const key = doc.projectTitle
    if (!acc[key]) acc[key] = []
    acc[key].push(doc)
    return acc
  }, {})

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Livrables"
        title="Documents"
        subtitle="Fichiers partagés par l'équipe et demandes de documents en attente de votre part."
        icon={FileText}
      />

      {pending.length > 0 && (
        <section className="client-section">
          <h2 className="client-section-title mb-4">Documents demandés par Sirius</h2>
          <div className="doc-request-list">
            {pending.map((r) => (
              <DocumentRequestCard
                key={r.id}
                request={r}
                client={user}
                onFulfilled={refresh}
              />
            ))}
          </div>
        </section>
      )}

      {requests.filter((r) => r.status === 'fulfilled').length > 0 && (
        <section className="client-section">
          <h2 className="client-section-title mb-4">Documents transmis</h2>
          <div className="doc-request-list">
            {requests.filter((r) => r.status === 'fulfilled').map((r) => (
              <DocumentRequestCard key={r.id} request={r} client={user} onFulfilled={refresh} />
            ))}
          </div>
        </section>
      )}

      {documents.length === 0 && pending.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun document"
          description="Vos fichiers partagés et les demandes de l'équipe apparaîtront ici."
        />
      ) : (
        Object.entries(byProject).map(([projectTitle, docs]) => (
          <section key={projectTitle} className="client-section workspace-panel">
            <h2 className="client-section-title mb-4">{projectTitle}</h2>
            <ul className="client-doc-list">
              {docs.map((d) => (
                <li key={d.id} className="client-doc-item">
                  <div className="client-doc-icon-wrap">
                    <FileText size={18} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="client-doc-name">{d.name}</p>
                    <p className="client-doc-meta">
                      {DOCUMENT_KIND_LABELS[d.kind]} · {d.size} · {formatDate(d.date)}
                    </p>
                  </div>
                  <button type="button" className="client-doc-btn" disabled>
                    Télécharger
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {highlightId && pending.some((r) => r.id === highlightId) && (
        <p className="client-message-hint mt-4">Une demande de document nécessite votre attention ci-dessus.</p>
      )}
    </>
  )
}
