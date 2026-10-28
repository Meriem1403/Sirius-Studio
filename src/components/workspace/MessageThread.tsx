import type { ClientMessage } from '../../lib/auth/types'
import AttachmentList from './AttachmentList'
import { formatDateTime } from '../../lib/client/format'
import { FileQuestion } from 'lucide-react'

const URL_RE = /(https?:\/\/[^\s<>"')\]]+)/g

function MessageText({ text }: { text: string }) {
  const parts = text.split(URL_RE)
  return (
    <p className="client-message-bubble-text">
      {parts.map((part, index) =>
        part.startsWith('http') ? (
          <a key={index} className="chat-link" href={part.replace(/[.,;:!?)]+$/, '')} target="_blank" rel="noreferrer">
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  )
}

interface MessageThreadProps {
  messages: ClientMessage[]
  mine: 'client' | 'team'
}

export default function MessageThread({ messages, mine }: MessageThreadProps) {
  if (!messages.length) return null

  return (
    <div className="chat-bubbles">
      {messages.map((m) => {
        const outgoing = m.role === mine
        return (
          <div
            key={m.id}
            className={`chat-bubble ${outgoing ? 'chat-bubble--mine' : 'chat-bubble--theirs'} ${m.documentRequestId ? 'chat-bubble--request' : ''}`}
          >
            {!outgoing && <p className="client-message-bubble-from">{m.from}</p>}
            {m.documentRequestId && (
              <span className="message-request-badge">
                <FileQuestion size={12} />
                Demande document
              </span>
            )}
            {m.content && <MessageText text={m.content} />}
            {m.attachments && m.attachments.length > 0 && (
              <AttachmentList attachments={m.attachments} compact />
            )}
            <p className="client-message-bubble-date">{formatDateTime(m.date)}</p>
          </div>
        )
      })}
    </div>
  )
}
