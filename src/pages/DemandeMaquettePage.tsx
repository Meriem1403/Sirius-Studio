import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'

/** Point d’entrée unique « maquette gratuite » : compte obligatoire. */
export default function DemandeMaquettePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { projects } = useWorkspace()

  if (isLoading) {
    return (
      <main className="auth-callback-page">
        <span className="auth-spinner auth-spinner--light" aria-hidden="true" />
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/inscription" replace />
  }

  if (user.role === 'admin') {
    return <Navigate to="/espace-admin" replace />
  }

  const mine = projects.filter((p) => p.userId === user.id)
  if (mine.length === 0) {
    return <Navigate to="/espace-client/nouvelle-demande" replace state={{ onboarding: true }} />
  }

  return <Navigate to="/espace-client/nouvelle-demande" replace />
}
