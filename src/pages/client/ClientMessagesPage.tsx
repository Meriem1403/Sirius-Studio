import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import MessageThread from '../../components/workspace/MessageThread'
import MessageComposer from '../../components/workspace/MessageComposer'
import AppointmentRequestForm from '../../components/workspace/AppointmentRequestForm'
import {
  getMessagesForProject,
  getMessagesForUser,
  markMessagesRead,
  sendMessage,
} from '../../lib/services/messageService'
import { getProjectsForUser } from '../../lib/services/projectService'
import EmptyState from '../../components/client/EmptyState'
import type { ClientMessage, ClientProject, MessageAttachment } from '../../lib/auth/types'
import { isApiMode } from '../../lib/api/config'
import { fetchApiProjects, fetchMessages, markApiMessagesRead } from '../../lib/api/messages'

export default function ClientMessagesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeProject, setActiveProject] = useState(searchParams.get('project') ?? 'all')
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [reloadKey, setReloadKey] = useState(0)

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

  if (!user) return null

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

      {projects.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucun projet"
          description="Déposez d’abord une demande de projet pour échanger avec l’équipe."
          actionLabel="Déposer une demande"
          actionHref="/espace-client/nouvelle-demande"
        />
      ) : messages.length === 0 && activeProject === 'all' ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucun message"
          description="Choisissez un projet ci-dessus pour démarrer une conversation."
        />
      ) : (
        <div className="client-messages workspace-panel">
          <MessageThread messages={messages} />

          {activeProject !== 'all' && active && (
            <>
            <AppointmentRequestForm
              mode="request"
              sender={user}
              clientUserId={user.id}
              clientName={user.name}
              projectId={active.id}
              projectTitle={active.title}
              onDone={reload}
            />
            <MessageComposer
              placeholder={`Message pour ${active.title}...`}
              hint="Joignez un fichier en indiquant de quoi il s'agit et pourquoi vous l'envoyez."
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
            </>
          )}
        </div>
      )}
    </>
  )
}
