import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
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
import type { MessageAttachment } from '../../lib/auth/types'

export default function AdminMessagesPage() {
  const { user } = useAuth()
  const { refresh } = useWorkspace()
  const [searchParams] = useSearchParams()
  const projectFilter = searchParams.get('project') ?? 'all'
  const [activeProject, setActiveProject] = useState(projectFilter)

  useEffect(() => {
    markAdminMessagesRead()
    refresh()
  }, [refresh])

  if (!user) return null

  const projects = getAllProjects().filter((p) => p.userId !== 'fixture-admin-1')
  const filtered =
    activeProject === 'all'
      ? getAllMessagesForAdmin()
      : getMessagesForProject(activeProject)
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
          {filtered.length === 0 ? (
            <EmptyState icon={MessageSquare} title="Aucun message" description="Les échanges apparaîtront ici." />
          ) : (
            <MessageThread messages={filtered} />
          )}

          {activeProject !== 'all' && active && (
            <>
              <DocumentRequestForm
                admin={user}
                clientUserId={active.userId}
                projectId={active.id}
                projectTitle={active.title}
                onCreated={refresh}
              />
              <MessageComposer
                placeholder={`Répondre à ${getClientName(active.userId)}...`}
                hint="Pièces jointes avec description et motif. Notification email et SMS au client."
                onSend={async (content, attachments) => {
                  sendMessage({
                    sender: user,
                    clientUserId: active.userId,
                    projectId: active.id,
                    projectTitle: active.title,
                    content: content || 'Pièce(s) jointe(s) transmise(s).',
                    attachments: attachments as MessageAttachment[],
                  })
                  refresh()
                }}
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}
