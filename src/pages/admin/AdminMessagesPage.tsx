import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
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
import EmptyState from '../../components/client/EmptyState'
import type { ClientMessage, ClientProject, MessageAttachment } from '../../lib/auth/types'
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

  if (!user) return null

  const active = projects.find((p) => p.id === activeProject)
  const nameOf = (userId: string) => clientNames[userId] || getClientName(userId)
  const unreadProjects = new Set(allMessages.filter((m) => m.role === 'client' && !m.read).map((m) => m.projectId))
  const pendingProjects = new Set(
    appointments
      .filter((a) => (a.status === 'proposed' || a.status === 'requested') && a.projectId)
      .map((a) => a.projectId as string),
  )
  const clientOptions = [...new Map(projects.map((p) => [p.userId, nameOf(p.userId)])).entries()]
  const visibleProjects = projects.filter((p) => {
    if (clientFilter !== 'all' && p.userId !== clientFilter) return false
    if (onlyUnread && !unreadProjects.has(p.id)) return false
    if (onlyPending && !pendingProjects.has(p.id)) return false
    const label = `${p.title} ${nameOf(p.userId)}`.toLowerCase()
    return !query.trim() || label.includes(query.trim().toLowerCase())
  })

  return (
    <>
      <WorkspacePageHeader
        variant="admin"
        eyebrow="Communication"
        title="Messages clients"
        subtitle="Répondez aux clients, joignez des fichiers et demandez des documents avec contexte."
        icon={MessageSquare}
      />

      <div className="admin-messages-layout">
        <aside className="admin-thread-list">
          <div className="message-filters">
            <input
              className="admin-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un client ou un projet"
            />
            <select className="admin-input" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
              <option value="all">Tous les clients</option>
              {clientOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <div className="client-filter-row">
              <button type="button" className={`client-filter-chip ${!onlyUnread && !onlyPending ? 'client-filter-chip--active' : ''}`} onClick={() => { setOnlyUnread(false); setOnlyPending(false) }}>Tous</button>
              <button type="button" className={`client-filter-chip ${onlyUnread ? 'client-filter-chip--active' : ''}`} onClick={() => setOnlyUnread((v) => !v)}>Non lus</button>
              <button type="button" className={`client-filter-chip ${onlyPending ? 'client-filter-chip--active' : ''}`} onClick={() => setOnlyPending((v) => !v)}>Rendez-vous</button>
            </div>
          </div>
          <button
            type="button"
            className={`admin-thread-item ${activeProject === 'all' ? 'admin-thread-item--active' : ''}`}
            onClick={() => setActiveProject('all')}
          >
            Tous les messages
          </button>
          {visibleProjects.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`admin-thread-item ${activeProject === p.id ? 'admin-thread-item--active' : ''}`}
              onClick={() => setActiveProject(p.id)}
            >
              <span className="admin-thread-title">{p.title}</span>
              <span className="admin-thread-client">{nameOf(p.userId)}</span>
            </button>
          ))}
          {visibleProjects.length === 0 && <p className="client-message-hint">Aucune conversation ne correspond.</p>}
        </aside>

        <div className="admin-thread-panel workspace-panel">
          <AppointmentThreadActions
            viewer="admin"
            user={user}
            projectId={activeProject === 'all' ? undefined : activeProject}
            onChange={reload}
          />
          {messages.length === 0 ? (
            <EmptyState icon={MessageSquare} title="Aucun message" description="Les échanges apparaîtront ici." />
          ) : (
            <MessageThread messages={messages} />
          )}

          {activeProject !== 'all' && active && (
            <>
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
              <MessageComposer
                placeholder={`Répondre à ${nameOf(active.userId)}...`}
                hint="Pièces jointes avec description et motif. Le client reçoit un email si Resend est configuré."
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
            </>
          )}
        </div>
      </div>
    </>
  )
}
