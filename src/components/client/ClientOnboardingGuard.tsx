import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'

/** Sans projet : une seule étape obligatoire — déposer la demande. */
export default function ClientOnboardingGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { projects } = useWorkspace()
  const location = useLocation()

  if (!user || user.role !== 'client') return <>{children}</>

  const mine = projects.filter((p) => p.userId === user.id)
  const onRequestPage = location.pathname.startsWith('/espace-client/nouvelle-demande')
  const onProfile = location.pathname.startsWith('/espace-client/profil')

  if (mine.length === 0 && !onRequestPage && !onProfile) {
    return <Navigate to="/espace-client/nouvelle-demande" replace state={{ onboarding: true }} />
  }

  return <>{children}</>
}
