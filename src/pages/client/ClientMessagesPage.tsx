import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import MessageThread from '../../components/workspace/MessageThread'
import MessageComposer from '../../components/workspace/MessageComposer'
import {
  getMessagesForProject,
  getMessagesForUser,
  markMessagesRead,
  sendMessage,
} from '../../lib/services/messageService'
import { getProjectsForUser } from '../../lib/services/projectService'
import EmptyState from '../../components/client/EmptyState'
import type { MessageAttachment } from '../../lib/auth/types'

export default function ClientMessagesPage() {
  const { user } = useAuth()
  const { refresh } = useWorkspace()
  const [searchParams] = useSearchParams()
  const [activeProject, setActiveProject] = useState(searchParams.get('project') ?? 'all')

  useEffect(() => {
    if (!user) return
    if (activeProject === 'all') markMessagesRead(user.id)
    else markMessagesRead(user.id, activeProject)
    refresh()
  }, [user, activeProject, refresh])

  if (!user) return null

  const projects = getProjectsForUser(user.id)
  const filtered =
    activeProject === 'all'
      ? getMessagesForUser(user.id)
      : getMessagesForProject(activeProject)
  const active = projects.find((p) => p.id === activeProject)

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Communication"
        title="Messages"
        subtitle="Échangez avec votre chef de projet et transmettez des fichiers en précisant leur contenu."
        icon={MessageSquare}
      />

      {projects.length > 0 && (
        <div className="client-filter-row">
          <button type="button" className={`client-filter-chip ${activeProject === 'all' ? 'client-filter-chip--active' : ''}`} onClick={() => setActiveProject('all')}>Tous</button>
          {projects.map((p) => (
            <button key={p.id} type="button" className={`client-filter-chip ${activeProject === p.id ? 'client-filter-chip--active' : ''}`} onClick={() => setActiveProject(p.id)}>{p.title}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 && activeProject === 'all' ? (
        <EmptyState icon={MessageSquare} title="Aucun message" description="Sélectionnez un projet pour démarrer une conversation." />
      ) : (
        <div className="client-messages workspace-panel">
          <MessageThread messages={filtered} />

          {activeProject !== 'all' && active && (
            <MessageComposer
              placeholder={`Message pour ${active.title}...`}
              hint="Joignez un fichier en indiquant de quoi il s'agit et pourquoi vous l'envoyez."
              onSend={async (content, attachments) => {
                sendMessage({
                  sender: user,
                  clientUserId: user.id,
                  projectId: active.id,
                  projectTitle: active.title,
                  content: content || 'Pièce(s) jointe(s) transmise(s).',
                  attachments: attachments as MessageAttachment[],
                })
                refresh()
              }}
            />
          )}
        </div>
      )}
    </>
  )
}
