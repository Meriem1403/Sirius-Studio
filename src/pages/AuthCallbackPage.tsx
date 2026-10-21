import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { setAuthToken } from '../lib/api/http'
import { syncWorkspace, getWorkspaceCache } from '../lib/api/workspaceSync'
import { apiMe } from '../lib/api/auth'
import { resolveClientPostAuthPath } from '../lib/auth/postAuthRedirect'

export default function AuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const token = params.get('token')
      const next = params.get('next')
      if (!token) {
        setError('Connexion social impossible (jeton manquant).')
        return
      }

      try {
        setAuthToken(token)
        const user = await apiMe()
        const session = {
          user,
          remember: true,
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem('sirius_session', JSON.stringify(session))
        await syncWorkspace()
        if (cancelled) return

        const cache = getWorkspaceCache()
        const dest =
          user.role === 'admin'
            ? '/espace-admin'
            : resolveClientPostAuthPath(next, cache?.projects ?? [], user.id)

        navigate(dest, { replace: true })
      } catch {
        setAuthToken(null)
        setError('Connexion social impossible. Réessayez.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params, navigate])

  if (error) {
    return (
      <div className="auth-callback-page">
        <p className="auth-form-error" role="alert">
          {error}
        </p>
        <Link to="/connexion" className="btn-primary mt-4 inline-flex">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-callback-page">
      <span className="auth-spinner auth-spinner--light" aria-hidden="true" />
      <p className="text-white/60 mt-4">Connexion en cours…</p>
    </div>
  )
}
