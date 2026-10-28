import { Calendar } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import AgendaView from '../../components/calendar/AgendaView'

export default function AdminAgendaPage() {
  const { user } = useAuth()
  const { refresh } = useWorkspace()
  const [searchParams] = useSearchParams()

  const planPrefill = useMemo(
    () => ({
      userId: searchParams.get('userId') ?? undefined,
      projectId: searchParams.get('projectId') ?? undefined,
      openForm: searchParams.get('planifier') === '1',
      title: searchParams.get('title') ?? undefined,
    }),
    [searchParams],
  )

  if (!user) return null

  return (
    <>
      <WorkspacePageHeader
        variant="admin"
        eyebrow="Administration"
        title="Agenda"
        subtitle="Planifiez les rendez-vous clients. Chaque créneau s'ajoute à l'agenda de l'appareil."
        icon={Calendar}
      />
      <AgendaView user={user} isAdmin onChange={refresh} planPrefill={planPrefill} />
    </>
  )
}
