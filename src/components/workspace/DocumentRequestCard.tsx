import { useState } from 'react'
import { CheckCircle2, FileQuestion } from 'lucide-react'
import type { DocumentRequest, User } from '../../lib/auth/types'
import MessageComposer from './MessageComposer'
import { fulfillDocumentRequest } from '../../lib/services/documentRequestService'
import { formatDateTime } from '../../lib/client/format'
import type { MessageAttachment } from '../../lib/auth/types'

interface DocumentRequestCardProps {
  request: DocumentRequest
  client: User
  onFulfilled: () => void
}

export default function DocumentRequestCard({ request, client, onFulfilled }: DocumentRequestCardProps) {
  const [expanded, setExpanded] = useState(request.status === 'pending')

  if (request.status === 'fulfilled') {
    return (
      <div className="doc-request-card doc-request-card--done">
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
        <div>
          <p className="doc-request-card-title">{request.title}</p>
          <p className="doc-request-card-meta">Transmis · {request.fulfilledAt && formatDateTime(request.fulfilledAt)}</p>
        </div>
      </div>
    )
  }

  if (request.status === 'cancelled') return null

  return (
    <div className="doc-request-card doc-request-card--pending">
      <div className="doc-request-card-header">
        <FileQuestion size={18} />
        <div className="flex-1">
          <p className="doc-request-card-title">{request.title}</p>
          <p className="doc-request-card-reason">{request.reason}</p>
          <p className="doc-request-card-meta">
            Demandé par {request.requestedByName} · {formatDateTime(request.createdAt)}
          </p>
        </div>
        <button type="button" className="btn-secondary text-xs" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Réduire' : 'Répondre'}
        </button>
      </div>

      {expanded && (
        <div className="doc-request-card-response mt-4">
          <MessageComposer
            placeholder="Message d'accompagnement (optionnel)..."
            hint="Joignez le fichier et décrivez ce que c'est et pourquoi vous l'envoyez."
            requireAttachmentMeta
            submitLabel="Transmettre le document"
            onSend={async (content, attachments) => {
              fulfillDocumentRequest({
                requestId: request.id,
                client,
                attachments: attachments as MessageAttachment[],
                note: content,
              })
              onFulfilled()
            }}
          />
        </div>
      )}
    </div>
  )
}
