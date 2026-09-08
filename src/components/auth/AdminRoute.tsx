import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="client-loading">
        <span className="auth-spinner" aria-hidden="true" />
        <span>Chargement…</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/espace-client" replace />
  }

  return children
}
