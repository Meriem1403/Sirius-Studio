import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AppleIcon, GitHubIcon, GoogleIcon, MicrosoftIcon } from './socialIcons'
import { FIXTURE_SOCIAL_MAP } from '../../fixtures/users'
import { useAuth } from '../../context/AuthContext'

export type SocialProvider = keyof typeof FIXTURE_SOCIAL_MAP

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
  const { loginSocial } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<SocialProvider | null>(null)
  const [error, setError] = useState('')

  const handleSocial = async (provider: SocialProvider) => {
    setLoading(provider)
    setError('')

    try {
      const email = FIXTURE_SOCIAL_MAP[provider]
      await loginSocial(email)
      navigate('/espace-client', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion sociale impossible.')
    } finally {
      setLoading(null)
    }
  }

  const verb = mode === 'login' ? 'Continuer avec' : "S'inscrire avec"

  return (
    <div className="auth-social">
      <div className="auth-social-grid">
        {providers.map(({ id, label, icon: Icon, iconClass }) => (
          <button
            key={id}
            type="button"
            className="auth-social-btn"
            onClick={() => handleSocial(id)}
            disabled={!!loading}
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
        ))}
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
