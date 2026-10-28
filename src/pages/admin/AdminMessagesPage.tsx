import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import MessageThread from '../../components/workspace/MessageThread'
import MessageComposer from '../../components/workspace/MessageComposer'
import DocumentRequestForm from '../../components/workspace/DocumentRequestForm'
import AppointmentRequestForm from '../../components/workspace/AppointmentRequestForm'
import AppointmentThreadActions from '../../components/workspace/AppointmentThreadActions'
import { useWorkspace } from '../../context/WorkspaceContext'
import {
  getAllMessagesForAdmin,
  getClientName,
  getMessagesForProject,
  markAdminMessagesRead,
  sendMessage,
} from '../../lib/services/messageService'
import { getAllProjects } from '../../lib/services/projectService'
import type { ClientMessage, ClientProject, MessageAttachment } from '../../lib/auth/types'
import { formatChatTime, userInitials } from '../../lib/client/format'
import { isApiMode } from '../../lib/api/config'
import { fetchApiProjects, fetchMessages, fetchProjectClientNames } from '../../lib/api/messages'

export default function AdminMessagesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const projectFilter = searchParams.get('project') ?? 'all'
  const [activeProject, setActiveProject] = useState(projectFilter)
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState('')
  const [clientFilter, setClientFilter] = useState('all')
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [onlyPending, setOnlyPending] = useState(false)
  const [clientNames, setClientNames] = useState<Record<string, string>>({})
  const { messages: allMessages, appointments } = useWorkspace()

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (isApiMode()) {
        const projs = await fetchApiProjects()
        if (cancelled) return
        setProjects(projs)
        const names = await fetchProjectClientNames()
        if (!cancelled) setClientNames(names)
        const msgs = await fetchMessages(activeProject === 'all' ? undefined : activeProject)
        if (cancelled) return
        setMessages(msgs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
        if (activeProject !== 'all') await markAdminMessagesRead(activeProject)
        return
      }

      setProjects(getAllProjects().filter((p) => p.userId !== 'fixture-admin-1'))
      const local =
        activeProject === 'all' ? getAllMessagesForAdmin() : getMessagesForProject(activeProject)
      setMessages(local.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
      if (activeProject !== 'all') markAdminMessagesRead(activeProject)
    })().catch(console.error)

    return () => {
      cancelled = true
    }
  }, [activeProject, reloadKey])

  const transcriptRef = useRef<HTMLDivElement>(null)
  const [narrow, setNarrow] = useState(false)
  const [showThread, setShowThread] = useState(projectFilter !== 'all')

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
  const nameOf = (userId: string) => clientNames[userId] || getClientName(userId)
  const unreadCount = (projectId: string) =>
    allMessages.filter((m) => m.projectId === projectId && m.role === 'client' && !m.read).length
  const pendingProjects = new Set(
    appointments
      .filter((a) => (a.status === 'proposed' || a.status === 'requested') && a.projectId)
      .map((a) => a.projectId as string),
  )
  const latest = new Map<string, ClientMessage>()
  for (const message of allMessages) {
    const prev = latest.get(message.projectId)
    if (!prev || message.date > prev.date) latest.set(message.projectId, message)
  }
  const clientOptions = [...new Map(projects.map((p) => [p.userId, nameOf(p.userId)])).entries()]
  const visibleProjects = projects
    .filter((p) => {
      if (clientFilter !== 'all' && p.userId !== clientFilter) return false
      if (onlyUnread && unreadCount(p.id) === 0) return false
      if (onlyPending && !pendingProjects.has(p.id)) return false
      const preview = latest.get(p.id)?.content ?? ''
      const label = `${p.title} ${nameOf(p.userId)} ${preview}`.toLowerCase()
      return !query.trim() || label.includes(query.trim().toLowerCase())
    })
    .sort((a, b) => (latest.get(b.id)?.date ?? '').localeCompare(latest.get(a.id)?.date ?? ''))

  function openProject(id: string) {
    setActiveProject(id)
    setShowThread(true)
  }

  const shellClass = `chat-app chat-app--admin ${narrow ? (showThread ? 'chat-app--thread' : 'chat-app--list') : ''}`

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
          <select className="chat-search" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            <option value="all">Tous les clients</option>
            {clientOptions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <div className="chat-chips">
            <button type="button" className={`chat-chip ${!onlyUnread && !onlyPending ? 'chat-chip--on' : ''}`} onClick={() => { setOnlyUnread(false); setOnlyPending(false) }}>Tous</button>
            <button type="button" className={`chat-chip ${onlyUnread ? 'chat-chip--on' : ''}`} onClick={() => { setOnlyUnread((v) => !v); setOnlyPending(false) }}>Non lus</button>
            <button type="button" className={`chat-chip ${onlyPending ? 'chat-chip--on' : ''}`} onClick={() => { setOnlyPending((v) => !v); setOnlyUnread(false) }}>Rendez-vous</button>
          </div>
        </div>
        <div className="chat-rows">
          {visibleProjects.map((p) => {
            const preview = latest.get(p.id)
            const unread = unreadCount(p.id)
            return (
              <button
                key={p.id}
                type="button"
                className={`chat-row ${activeProject === p.id ? 'chat-row--on' : ''}`}
                onClick={() => openProject(p.id)}
              >
                <span className="chat-avatar">{userInitials(nameOf(p.userId) || p.title)}</span>
                <span className="chat-row-body">
                  <span className="chat-row-top">
                    <span className="chat-row-name">{nameOf(p.userId)}</span>
                    {preview && <span className="chat-row-time">{formatChatTime(preview.date)}</span>}
                  </span>
                  <span className="chat-row-preview">
                    {p.title}
                    {preview?.content ? ` · ${preview.content.replace(/\s+/g, ' ').trim()}` : ''}
                  </span>
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
          {active ? (
            <div>
              <p className="chat-head-name">{nameOf(active.userId)}</p>
              <p className="chat-head-sub">{active.title}</p>
            </div>
          ) : (
            <p className="chat-head-name">Choisissez une conversation</p>
          )}
        </header>

        <div className="chat-transcript" ref={transcriptRef}>
          {active && (
            <AppointmentThreadActions
              viewer="admin"
              user={user}
              projectId={active.id}
              onChange={reload}
            />
          )}
          {messages.length === 0 ? (
            <p className="chat-empty">Aucun message pour l’instant.</p>
          ) : (
            <MessageThread messages={messages} mine="team" />
          )}
        </div>

        {active && (
          <footer className="chat-dock">
            <details className="chat-tools">
              <summary>Rendez-vous et documents</summary>
              <DocumentRequestForm
                admin={user}
                clientUserId={active.userId}
                projectId={active.id}
                projectTitle={active.title}
                onCreated={reload}
              />
              <AppointmentRequestForm
                mode="propose"
                sender={user}
                clientUserId={active.userId}
                clientName={nameOf(active.userId)}
                projectId={active.id}
                projectTitle={active.title}
                onDone={reload}
              />
            </details>
            <MessageComposer
              placeholder={`Message à ${nameOf(active.userId)}`}
              onSend={async (content, attachments) => {
                await sendMessage({
                  sender: user,
                  clientUserId: active.userId,
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
    </div>
  )
}
