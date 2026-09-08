import type { ClientMessage } from '../../lib/auth/types'
import AttachmentList from './AttachmentList'
import { formatDateTime } from '../../lib/client/format'
import { FileQuestion } from 'lucide-react'

interface MessageThreadProps {
  messages: ClientMessage[]
}

export default function MessageThread({ messages }: MessageThreadProps) {
  if (!messages.length) return null

  return (
    <div className="client-messages-thread">
      {[...messages].reverse().map((m) => (
        <div
          key={m.id}
          className={`client-message-bubble client-message-bubble--${m.role} ${m.documentRequestId ? 'client-message-bubble--request' : ''}`}
        >
          <p className="client-message-bubble-from">{m.from}</p>
          {m.documentRequestId && (
            <span className="message-request-badge">
              <FileQuestion size={12} />
              Demande document
            </span>
          )}
          {m.content && <p className="client-message-bubble-text">{m.content}</p>}
          {m.attachments && m.attachments.length > 0 && (
            <AttachmentList attachments={m.attachments} compact />
          )}
          <p className="client-message-bubble-date">{formatDateTime(m.date)}</p>
        </div>
      ))}
    </div>
  )
}
