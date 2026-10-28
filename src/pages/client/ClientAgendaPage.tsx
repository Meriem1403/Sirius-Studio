import { Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import AgendaView from '../../components/calendar/AgendaView'

export default function ClientAgendaPage() {
  const { user } = useAuth()
  const { refresh } = useWorkspace()
  if (!user) return null

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Planning"
        title="Mon agenda"
        subtitle="Demandez un créneau ou consultez ceux déjà prévus. Un bouton les ajoute à l'agenda de votre appareil."
        icon={Calendar}
      />
      <AgendaView user={user} onChange={refresh} />
    </>
  )
}
