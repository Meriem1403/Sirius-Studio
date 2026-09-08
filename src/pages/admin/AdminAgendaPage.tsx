import { Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import AgendaView from '../../components/calendar/AgendaView'

export default function AdminAgendaPage() {
  const { user } = useAuth()
  const { refresh } = useWorkspace()
  if (!user) return null

  return (
    <>
      <WorkspacePageHeader
        variant="admin"
        eyebrow="Administration"
        title="Agenda"
        subtitle="Planifiez les rendez-vous clients et exportez-les vers Google Calendar ou Apple."
        icon={Calendar}
      />
      <AgendaView user={user} isAdmin onChange={refresh} />
    </>
  )
}
