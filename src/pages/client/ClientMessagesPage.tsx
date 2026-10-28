import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, FileText, Info, Link2, MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import MessageThread from '../../components/workspace/MessageThread'
import MessageComposer from '../../components/workspace/MessageComposer'
import AppointmentRequestForm from '../../components/workspace/AppointmentRequestForm'
import AppointmentThreadActions from '../../components/workspace/AppointmentThreadActions'
import ConversationLibrary, { linksInMessages, type LibraryTab } from '../../components/workspace/ConversationLibrary'
import {
  getMessagesForProject,
  getMessagesForUser,
  markMessagesRead,
  sendMessage,
} from '../../lib/services/messageService'
import { getProjectsForUser } from '../../lib/services/projectService'
import EmptyState from '../../components/client/EmptyState'
import type { ClientMessage, ClientProject, MessageAttachment } from '../../lib/auth/types'
import { formatChatTime, userInitials } from '../../lib/client/format'
import { isApiMode } from '../../lib/api/config'
import { fetchApiProjects, fetchMessages, markApiMessagesRead } from '../../lib/api/messages'

export default function ClientMessagesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeProject, setActiveProject] = useState(searchParams.get('project') ?? 'all')
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState('')
  const transcriptRef = useRef<HTMLDivElement>(null)
  const [narrow, setNarrow] = useState(false)
  const [showThread, setShowThread] = useState(Boolean(searchParams.get('project')))
  const { messages: allMessages, appointments, documents } = useWorkspace()
  const [library, setLibrary] = useState<LibraryTab | null>(null)

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    ;(async () => {
      if (isApiMode()) {
        const projs = await fetchApiProjects()
        if (cancelled) return
        setProjects(projs)
        if (projs.length === 1 && activeProject === 'all') {
          setActiveProject(projs[0].id)
        }
        const msgs = await fetchMessages(activeProject === 'all' ? undefined : activeProject)
        if (cancelled) return
        setMessages(msgs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
        await markApiMessagesRead(activeProject === 'all' ? undefined : activeProject)
        return
      }

      const userProjects = getProjectsForUser(user.id)
      setProjects(userProjects)
      if (userProjects.length === 1 && activeProject === 'all') {
        setActiveProject(userProjects[0].id)
      }
      const local =
        activeProject === 'all'
          ? getMessagesForUser(user.id)
          : getMessagesForProject(activeProject)
      setMessages(local.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
      if (activeProject === 'all') markMessagesRead(user.id)
      else markMessagesRead(user.id, activeProject)
    })().catch(console.error)

    return () => {
      cancelled = true
    }
  }, [user, activeProject, reloadKey])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)')
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (activeProject === 'all' && projects[0]) setActiveProject(projects[0].id)
  }, [activeProject, projects])

  useEffect(() => {
    const box = transcriptRef.current
    if (box) box.scrollTop = box.scrollHeight
  }, [messages, activeProject])

  if (!user) return null

  const active = projects.find((p) => p.id === activeProject)
  const latest = new Map<string, ClientMessage>()
  for (const message of allMessages) {
    const prev = latest.get(message.projectId)
    if (!prev || message.date > prev.date) latest.set(message.projectId, message)
  }
  const visibleProjects = projects
    .filter((p) => {
      const preview = latest.get(p.id)?.content ?? ''
      const label = `${p.title} ${preview}`.toLowerCase()
      return !query.trim() || label.includes(query.trim().toLowerCase())
    })
    .sort((a, b) => (latest.get(b.id)?.date ?? '').localeCompare(latest.get(a.id)?.date ?? ''))
  const shellClass = `chat-app chat-app--client ${narrow ? (showThread ? 'chat-app--thread' : 'chat-app--list') : ''} ${library ? 'chat-app--library' : ''}`
  const sharedFiles = messages.reduce((count, message) => count + (message.attachments?.length ?? 0), 0)
  const projectFiles = active ? documents.filter((doc) => doc.projectId === active.id).length : 0
  const linkCount = linksInMessages(messages).length + (active ? appointments.filter((item) => item.projectId === active.id && item.meetingUrl).length : 0)
  const meetingCount = active
    ? appointments.filter((item) => {
        if (item.projectId !== active.id) return false
        if (item.status === 'proposed' || item.status === 'requested') return true
        return (item.status ?? 'confirmed') === 'confirmed' && new Date(item.startAt).getTime() >= Date.now()
      }).length
    : 0

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Aucun projet"
        description="Déposez d’abord une demande de projet pour échanger avec l’équipe."
        actionLabel="Déposer une demande"
        actionHref="/espace-client/nouvelle-demande"
      />
    )
  }

  return (
    <div className={shellClass}>
      <aside className="chat-sidebar">
        <div className="chat-sidebar-head">
          <h1>Messages</h1>
          <input
            className="chat-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher"
          />
        </div>
        <div className="chat-rows">
          {visibleProjects.map((p) => {
            const preview = latest.get(p.id)
            const unread = allMessages.filter((m) => m.projectId === p.id && m.role === 'team' && !m.read).length
            return (
              <button
                key={p.id}
                type="button"
                className={`chat-row ${activeProject === p.id ? 'chat-row--on' : ''}`}
                onClick={() => {
                  setActiveProject(p.id)
                  setShowThread(true)
                }}
              >
                <span className="chat-avatar">{userInitials('Sirius')}</span>
                <span className="chat-row-body">
                  <span className="chat-row-top">
                    <span className="chat-row-name">{p.title}</span>
                    {preview && <span className="chat-row-time">{formatChatTime(preview.date)}</span>}
                  </span>
                  <span className="chat-row-preview">{preview?.content?.replace(/\s+/g, ' ').trim() || 'Aucun message'}</span>
                </span>
                {unread > 0 && <span className="chat-badge">{unread}</span>}
              </button>
            )
          })}
          {visibleProjects.length === 0 && <p className="chat-empty">Aucune conversation.</p>}
        </div>
      </aside>

      <section className="chat-main">
        <header className="chat-head">
          <button type="button" className="chat-back" onClick={() => setShowThread(false)}>
            <ArrowLeft size={18} />
            Messages
          </button>
          <div className="chat-head-id">
            <p className="chat-head-name">{active?.title ?? 'Conversation'}</p>
            <p className="chat-head-sub">Sirius Studio</p>
          </div>
          {active && (
            <button
              type="button"
              className={`chat-info ${library ? 'chat-info--on' : ''}`}
              aria-label="Liens, documents et rendez-vous"
              onClick={() => setLibrary((current) => (current ? null : 'links'))}
            >
              <Info size={18} />
            </button>
          )}
        </header>
        {active && (
          <div className="chat-shortcuts">
            <button type="button" className={library === 'links' ? 'chat-shortcut--on' : ''} onClick={() => setLibrary('links')}>
              <Link2 size={15} /> Liens <span>{linkCount}</span>
            </button>
            <button type="button" className={library === 'files' ? 'chat-shortcut--on' : ''} onClick={() => setLibrary('files')}>
              <FileText size={15} /> Documents <span>{sharedFiles + projectFiles}</span>
            </button>
            <button type="button" className={library === 'meetings' ? 'chat-shortcut--on' : ''} onClick={() => setLibrary('meetings')}>
              <CalendarClock size={15} /> Rendez-vous <span>{meetingCount}</span>
            </button>
          </div>
        )}
        <div className="chat-transcript" ref={transcriptRef}>
          {active && (
            <AppointmentThreadActions viewer="client" user={user} projectId={active.id} onChange={reload} />
          )}
          {messages.length === 0 ? (
            <p className="chat-empty">Aucun message pour l’instant.</p>
          ) : (
            <MessageThread messages={messages} mine="client" />
          )}
        </div>
        {active && (
          <footer className="chat-dock">
            <details className="chat-tools">
              <summary>Demander un rendez-vous</summary>
              <AppointmentRequestForm
                mode="request"
                sender={user}
                clientUserId={user.id}
                clientName={user.name}
                projectId={active.id}
                projectTitle={active.title}
                onDone={reload}
              />
            </details>
            <MessageComposer
              placeholder="Écrire un message"
              onSend={async (content, attachments) => {
                await sendMessage({
                  sender: user,
                  clientUserId: user.id,
                  projectId: active.id,
                  projectTitle: active.title,
                  content: content || 'Pièce(s) jointe(s) transmise(s).',
                  attachments: attachments as MessageAttachment[],
                })
                reload()
              }}
            />
          </footer>
        )}
      </section>
      {library && active && (
        <ConversationLibrary
          tab={library}
          onTab={setLibrary}
          onClose={() => setLibrary(null)}
          title={active.title}
          subtitle="Sirius Studio"
          projectId={active.id}
          messages={messages}
        />
      )}
    </div>
  )
}
