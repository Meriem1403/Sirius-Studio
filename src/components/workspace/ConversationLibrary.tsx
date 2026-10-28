import { CalendarClock, FileText, Link2, X } from 'lucide-react'
import type { Appointment, ClientDocument, ClientMessage } from '../../lib/auth/types'
import { useWorkspace } from '../../context/WorkspaceContext'
import { formatDateTime } from '../../lib/client/format'

export type LibraryTab = 'links' | 'files' | 'meetings'

const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi

function cleanUrl(raw: string) {
  return raw.replace(/[.,;:!?)]+$/, '')
}

export function linksInMessages(messages: ClientMessage[]) {
  const found: { url: string; from: string; date: string }[] = []
  const seen = new Set<string>()
  for (const message of messages) {
    const matches = message.content.match(URL_RE) ?? []
    for (const match of matches) {
      const url = cleanUrl(match)
      if (seen.has(url)) continue
      seen.add(url)
      found.push({ url, from: message.from, date: message.date })
    }
  }
  return found
}

function meetingWord(status: Appointment['status'], startAt: string) {
  if (status === 'proposed') return 'En attente du client'
  if (status === 'requested') return 'À confirmer'
  if (status === 'declined') return 'Refusé'
  return new Date(startAt).getTime() >= Date.now() ? 'À venir' : 'Passé'
}

const kindLabel: Record<ClientDocument['kind'], string> = {
  maquette: 'Maquette',
  devis: 'Devis',
  contrat: 'Contrat',
  livraison: 'Livraison',
}

interface ConversationLibraryProps {
  tab: LibraryTab
  onTab: (tab: LibraryTab) => void
  onClose: () => void
  title: string
  subtitle: string
  projectId: string
  messages: ClientMessage[]
}

export default function ConversationLibrary({
  tab,
  onTab,
  onClose,
  title,
  subtitle,
  projectId,
  messages,
}: ConversationLibraryProps) {
  const { appointments, documents } = useWorkspace()
  const links = linksInMessages(messages)
  const shared = messages.flatMap((message) =>
    (message.attachments ?? []).map((file) => ({ ...file, from: message.from, date: message.date })),
  )
  const projectFiles = documents.filter((doc) => doc.projectId === projectId)
  const meetings = appointments.filter((item) => item.projectId === projectId)
  const toConfirm = meetings.filter((item) => item.status === 'proposed' || item.status === 'requested')
  const upcoming = meetings.filter(
    (item) => (item.status ?? 'confirmed') === 'confirmed' && new Date(item.startAt).getTime() >= Date.now(),
  )
  const past = meetings.filter(
    (item) => (item.status ?? 'confirmed') === 'confirmed' && new Date(item.startAt).getTime() < Date.now(),
  )
  const visio = meetings.filter((item) => item.meetingUrl)

  const tabs: { id: LibraryTab; label: string; count: number }[] = [
    { id: 'links', label: 'Liens', count: links.length + visio.length },
    { id: 'files', label: 'Documents', count: shared.length + projectFiles.length },
    { id: 'meetings', label: 'Rendez-vous', count: toConfirm.length + upcoming.length },
  ]

  return (
    <aside className="chat-library">
      <header className="chat-library-head">
        <div>
          <p className="chat-library-kicker">Dans cette conversation</p>
          <h2>{title}</h2>
          <p className="chat-head-sub">{subtitle}</p>
        </div>
        <button type="button" className="chat-info" onClick={onClose} aria-label="Fermer">
          <X size={18} />
        </button>
      </header>

      <div className="chat-library-tabs" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`chat-library-tab ${tab === item.id ? 'chat-library-tab--on' : ''}`}
            onClick={() => onTab(item.id)}
          >
            {item.label}
            <span>{item.count}</span>
          </button>
        ))}
      </div>

      <div className="chat-library-body">
        {tab === 'links' && (
          <>
            {links.length === 0 && visio.length === 0 && (
              <p className="chat-empty">Aucun lien dans cette conversation.</p>
            )}
            {links.map((link) => (
              <a key={link.url} className="chat-library-row" href={link.url} target="_blank" rel="noreferrer">
                <span className="chat-library-icon"><Link2 size={16} /></span>
                <span>
                  <strong>{link.url.replace(/^https?:\/\//, '')}</strong>
                  <em>{link.from} · {formatDateTime(link.date)}</em>
                </span>
              </a>
            ))}
            {visio.map((item) => (
              <a key={item.id} className="chat-library-row" href={item.meetingUrl} target="_blank" rel="noreferrer">
                <span className="chat-library-icon"><Link2 size={16} /></span>
                <span>
                  <strong>Visio · {item.title}</strong>
                  <em>{item.meetingUrl}</em>
                </span>
              </a>
            ))}
          </>
        )}

        {tab === 'files' && (
          <>
            <p className="chat-library-label">Partagés dans la conversation</p>
            {shared.length === 0 && <p className="chat-empty">Aucun fichier envoyé dans les messages.</p>}
            {shared.map((file) => (
              <div key={file.id} className="chat-library-row">
                <span className="chat-library-icon"><FileText size={16} /></span>
                <span>
                  <strong>{file.label || file.name}</strong>
                  <em>{file.from} · {file.size}</em>
                </span>
                {file.dataUrl && (
                  <a className="chat-library-open" href={file.dataUrl} download={file.name}>Ouvrir</a>
                )}
              </div>
            ))}
            <p className="chat-library-label">Documents du projet</p>
            {projectFiles.length === 0 && <p className="chat-empty">Aucun document de projet pour l’instant.</p>}
            {projectFiles.map((doc) => (
              <div key={doc.id} className="chat-library-row">
                <span className="chat-library-icon"><FileText size={16} /></span>
                <span>
                  <strong>{doc.name}</strong>
                  <em>{kindLabel[doc.kind]} · {formatDateTime(doc.date)}</em>
                </span>
                {doc.url && (
                  <a className="chat-library-open" href={doc.url} target="_blank" rel="noreferrer">Ouvrir</a>
                )}
              </div>
            ))}
          </>
        )}

        {tab === 'meetings' && (
          <>
            <p className="chat-library-label">À confirmer</p>
            {toConfirm.length === 0 && <p className="chat-empty">Rien en attente de réponse.</p>}
            {toConfirm.map((item) => (
              <MeetingRow key={item.id} item={item} />
            ))}
            <p className="chat-library-label">À venir</p>
            {upcoming.length === 0 && <p className="chat-empty">Aucun rendez-vous confirmé à venir.</p>}
            {upcoming.map((item) => (
              <MeetingRow key={item.id} item={item} />
            ))}
            {past.length > 0 && (
              <>
                <p className="chat-library-label">Déjà passés</p>
                {past.map((item) => (
                  <MeetingRow key={item.id} item={item} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

function MeetingRow({ item }: { item: Appointment }) {
  return (
    <div className="chat-library-row">
      <span className="chat-library-icon"><CalendarClock size={16} /></span>
      <span>
        <strong>{item.title}</strong>
        <em>
          {meetingWord(item.status, item.startAt)} · {formatDateTime(item.startAt)}
        </em>
      </span>
    </div>
  )
}
