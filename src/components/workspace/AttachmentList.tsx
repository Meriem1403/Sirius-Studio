import type { MessageAttachment } from '../../lib/auth/types'
import { Download, FileImage, FileSpreadsheet, FileText } from 'lucide-react'
import { attachmentIcon } from '../../lib/client/attachments'

interface AttachmentListProps {
  attachments: MessageAttachment[]
  compact?: boolean
}

export default function AttachmentList({ attachments, compact }: AttachmentListProps) {
  if (!attachments.length) return null

  return (
    <ul className={`attachment-list ${compact ? 'attachment-list--compact' : ''}`}>
      {attachments.map((att) => {
        const kind = attachmentIcon(att.mimeType)
        const Icon = kind === 'image' ? FileImage : kind === 'sheet' ? FileSpreadsheet : FileText
        return (
          <li key={att.id} className="attachment-item">
            <div className="attachment-item-icon">
              <Icon size={16} strokeWidth={1.75} />
            </div>
            <div className="attachment-item-body">
              <p className="attachment-item-name">{att.name}</p>
              <p className="attachment-item-meta">
                {att.label} · {att.size}
              </p>
              {!compact && att.reason && (
                <p className="attachment-item-reason">{att.reason}</p>
              )}
            </div>
            {att.dataUrl ? (
              <a
                href={att.dataUrl}
                download={att.name}
                className="attachment-item-dl"
                title="Télécharger"
              >
                <Download size={15} />
              </a>
            ) : (
              <span className="attachment-item-dl attachment-item-dl--disabled" title="Fichier trop volumineux (métadonnées seules)">
                <Download size={15} />
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
