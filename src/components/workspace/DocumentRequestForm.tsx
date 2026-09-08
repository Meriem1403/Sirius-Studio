import { useState } from 'react'
import { FileQuestion, Plus } from 'lucide-react'
import type { User } from '../../lib/auth/types'
import { createDocumentRequest } from '../../lib/services/documentRequestService'

interface DocumentRequestFormProps {
  admin: User
  clientUserId: string
  projectId: string
  projectTitle: string
  onCreated: () => void
}

export default function DocumentRequestForm({
  admin,
  clientUserId,
  projectId,
  projectTitle,
  onCreated,
}: DocumentRequestFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [reason, setReason] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !reason.trim()) return
    createDocumentRequest({ admin, clientUserId, projectId, projectTitle, title, reason })
    setTitle('')
    setReason('')
    setOpen(false)
    onCreated()
  }

  if (!open) {
    return (
      <button type="button" className="doc-request-trigger" onClick={() => setOpen(true)}>
        <FileQuestion size={16} />
        Demander un document au client
      </button>
    )
  }

  return (
    <form className="doc-request-form" onSubmit={handleSubmit}>
      <div className="doc-request-form-header">
        <FileQuestion size={18} />
        <div>
          <p className="doc-request-form-title">Demande de document</p>
          <p className="doc-request-form-sub">Précisez ce dont vous avez besoin et pourquoi.</p>
        </div>
      </div>
      <input
        type="text"
        className="admin-input"
        placeholder="Quel document ? (ex. logo vectoriel, brief, photos produits)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="client-message-input mt-3"
        placeholder="Pourquoi en avez-vous besoin ? (contexte pour le client)"
        rows={2}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="flex flex-wrap gap-3 mt-3">
        <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={!title.trim() || !reason.trim()}>
          <Plus size={15} />
          Envoyer la demande
        </button>
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
          Annuler
        </button>
      </div>
    </form>
  )
}
