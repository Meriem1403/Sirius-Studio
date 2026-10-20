import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import MessageThread from '../../components/workspace/MessageThread'
import MessageComposer from '../../components/workspace/MessageComposer'
import DocumentRequestForm from '../../components/workspace/DocumentRequestForm'
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
import { fetchApiProjects, fetchMessages, markApiMessagesRead } from '../../lib/api/messages'

export default function AdminMessagesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const projectFilter = searchParams.get('project') ?? 'all'
  const [activeProject, setActiveProject] = useState(projectFilter)
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (isApiMode()) {
        const projs = await fetchApiProjects()
        if (cancelled) return
        setProjects(projs)
        const msgs = await fetchMessages(activeProject === 'all' ? undefined : activeProject)
        if (cancelled) return
        setMessages(msgs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
        await markApiMessagesRead()
        return
      }

      setProjects(getAllProjects().filter((p) => p.userId !== 'fixture-admin-1'))
      const local =
        activeProject === 'all' ? getAllMessagesForAdmin() : getMessagesForProject(activeProject)
      setMessages(local.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
      markAdminMessagesRead()
    })().catch(console.error)

    return () => {
      cancelled = true
    }
  }, [activeProject, reloadKey])

  if (!user) return null

  const active = projects.find((p) => p.id === activeProject)

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
          <button
            type="button"
            className={`admin-thread-item ${activeProject === 'all' ? 'admin-thread-item--active' : ''}`}
            onClick={() => setActiveProject('all')}
          >
            Tous les messages
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`admin-thread-item ${activeProject === p.id ? 'admin-thread-item--active' : ''}`}
              onClick={() => setActiveProject(p.id)}
            >
              <span className="admin-thread-title">{p.title}</span>
              <span className="admin-thread-client">{getClientName(p.userId)}</span>
            </button>
          ))}
        </aside>

        <div className="admin-thread-panel workspace-panel">
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
              <MessageComposer
                placeholder={`Répondre à ${getClientName(active.userId)}...`}
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
