import { useState } from 'react'
import { Paperclip, Send, X } from 'lucide-react'
import { readFileAsAttachment } from '../../lib/client/attachments'
import { buildAttachmentsFromFiles } from '../../lib/services/portfolioService'

export interface PendingFile {
  id: string
  file: File
  label: string
  reason: string
  preview?: string
}

interface MessageComposerProps {
  placeholder: string
  hint?: string
  submitLabel?: string
  requireAttachmentMeta?: boolean
  disabled?: boolean
  onSend: (content: string, attachments: ReturnType<typeof buildAttachmentsFromFiles>) => void | Promise<void>
}

export default function MessageComposer({
  placeholder,
  hint,
  submitLabel = 'Envoyer',
  requireAttachmentMeta = false,
  disabled,
  onSend,
}: MessageComposerProps) {
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState<PendingFile[]>([])
  const [submitting, setSubmitting] = useState(false)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const next = files.map((file) => ({
      id: `pf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      file,
      label: '',
      reason: '',
    }))
    setPending((prev) => [...prev, ...next])
    e.target.value = ''
  }

  function updatePending(id: string, patch: Partial<PendingFile>) {
    setPending((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function removePending(id: string) {
    setPending((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (disabled || submitting) return
    if (!draft.trim() && pending.length === 0) return

    if (requireAttachmentMeta && pending.some((p) => !p.label.trim() || !p.reason.trim())) return

    setSubmitting(true)
    try {
      const built = await Promise.all(
        pending.map(async (p) => {
          const read = await readFileAsAttachment(p.file)
          return { ...read, label: p.label.trim() || p.file.name, reason: p.reason.trim() || 'Transmis via l\'espace client' }
        }),
      )
      await onSend(draft.trim(), buildAttachmentsFromFiles(built))
      setDraft('')
      setPending([])
    } finally {
      setSubmitting(false)
    }
  }

  const canSend =
    (draft.trim() || pending.length > 0) &&
    (!requireAttachmentMeta || pending.every((p) => p.label.trim() && p.reason.trim()))

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      {pending.length > 0 && (
        <ul className="pending-files">
          {pending.map((p) => (
            <li key={p.id} className="pending-file">
              <div className="pending-file-top">
                <Paperclip size={14} />
                <span className="pending-file-name">{p.file.name}</span>
                <button type="button" className="pending-file-remove" onClick={() => removePending(p.id)} aria-label="Retirer">
                  <X size={14} />
                </button>
              </div>
              <div className="pending-file-fields">
                <input
                  type="text"
                  className="admin-input admin-input--sm"
                  placeholder="De quoi s'agit-il ?"
                  value={p.label}
                  onChange={(e) => updatePending(p.id, { label: e.target.value })}
                />
                <input
                  type="text"
                  className="admin-input admin-input--sm"
                  placeholder="Pourquoi le transmettez-vous ?"
                  value={p.reason}
                  onChange={(e) => updatePending(p.id, { reason: e.target.value })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <textarea
        className="client-message-input"
        placeholder={placeholder}
        rows={3}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={disabled}
      />

      <div className="client-message-compose-footer">
        <div className="message-composer-tools">
          <label className="message-attach-btn">
            <Paperclip size={16} />
            <span>Joindre</span>
            <input type="file" className="sr-only" multiple onChange={handleFiles} disabled={disabled} />
          </label>
          {hint && <p className="client-message-hint">{hint}</p>}
        </div>
        <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={!canSend || submitting || disabled}>
          <Send size={15} />
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
