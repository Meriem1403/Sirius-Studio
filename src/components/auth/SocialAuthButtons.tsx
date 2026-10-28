import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AppleIcon, GitHubIcon, GoogleIcon, MicrosoftIcon } from './socialIcons'
import { FIXTURE_SOCIAL_MAP } from '../../fixtures/users'
import { useAuth } from '../../context/AuthContext'
import { isApiMode, isSocialLoginEnabled } from '../../lib/api/config'
import {
  fetchConfiguredOAuthProviders,
  startOAuthLogin,
  type SocialProvider,
} from '../../lib/api/oauth'
import { DEFAULT_AUTH_NEXT } from '../../lib/auth/postAuthRedirect'

export type { SocialProvider }

const providers: {
  id: SocialProvider
  label: string
  icon: typeof GoogleIcon
  iconClass?: string
}[] = [
  { id: 'google', label: 'Google', icon: GoogleIcon },
  { id: 'apple', label: 'Apple', icon: AppleIcon, iconClass: 'text-white' },
  { id: 'microsoft', label: 'Microsoft', icon: MicrosoftIcon },
  { id: 'github', label: 'GitHub', icon: GitHubIcon, iconClass: 'text-white' },
]

interface SocialAuthButtonsProps {
  mode: 'login' | 'signup'
}

export default function SocialAuthButtons({ mode }: SocialAuthButtonsProps) {
  const oauthEnabled = isSocialLoginEnabled()
  const { loginSocial } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState<SocialProvider | null>(null)
  const [error, setError] = useState('')
  const [available, setAvailable] = useState<SocialProvider[]>([])
  const apiMode = isApiMode()

  const next =
    searchParams.get('next') ??
    (mode === 'signup' ? DEFAULT_AUTH_NEXT : '/espace-client')

  useEffect(() => {
    if (!oauthEnabled || !apiMode) return
    fetchConfiguredOAuthProviders().then(setAvailable)
  }, [apiMode, oauthEnabled])

  const verb = mode === 'login' ? 'Continuer avec' : "S'inscrire avec"

  if (!oauthEnabled) {
    return (
      <div className="auth-social auth-social--disabled" aria-disabled="true">
        <div className="auth-social-grid">
          {providers.map(({ id, label, icon: Icon, iconClass }) => (
            <button
              key={id}
              type="button"
              className="auth-social-btn auth-social-btn--pending auth-social-btn--disabled"
              disabled
              title="Bientôt disponible"
            >
              <Icon className={`auth-social-icon ${iconClass ?? ''}`} />
              <span className="auth-social-label">
                <span className="hidden sm:inline">{verb} </span>
                {label}
              </span>
            </button>
          ))}
        </div>
        <p className="auth-social-notice auth-social-notice--muted">
          Connexion Google, Apple, Microsoft et GitHub — <strong>bientôt disponible</strong>. Utilisez{' '}
          <strong>email et mot de passe</strong> ci-dessous.
        </p>
      </div>
    )
  }

  const handleSocial = async (provider: SocialProvider) => {
    setLoading(provider)
    setError('')

    try {
      if (apiMode) {
        if (!available.includes(provider)) {
          setError(`Connexion ${provider} : clés OAuth manquantes sur le serveur.`)
          return
        }
        startOAuthLogin(provider, next)
        return
      }

      const email = FIXTURE_SOCIAL_MAP[provider]
      await loginSocial(email)
      navigate('/espace-client', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion sociale impossible.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="auth-social">
      <div className="auth-social-grid">
        {providers.map(({ id, label, icon: Icon, iconClass }) => {
          const configured = !apiMode || available.includes(id)
          return (
            <button
              key={id}
              type="button"
              className={`auth-social-btn ${!configured ? 'auth-social-btn--pending' : ''}`}
              onClick={() => handleSocial(id)}
              disabled={!!loading || (apiMode && !configured)}
              aria-busy={loading === id}
            >
              {loading === id ? (
                <span className="auth-spinner" aria-hidden="true" />
              ) : (
                <Icon className={`auth-social-icon ${iconClass ?? ''}`} />
              )}
              <span className="auth-social-label">
                <span className="hidden sm:inline">{verb} </span>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="auth-social-notice auth-social-notice--error"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
