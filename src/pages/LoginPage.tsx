import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import AuthField from '../components/auth/AuthField'
import SocialAuthButtons from '../components/auth/SocialAuthButtons'
import AuthFixturesPanel from '../components/auth/AuthFixturesPanel'
import { useAuth } from '../context/AuthContext'
import { getSession } from '../lib/auth/authService'
import { DEFAULT_AUTH_NEXT, resolveClientPostAuthPath } from '../lib/auth/postAuthRedirect'
import { getWorkspaceCache } from '../lib/api/workspaceSync'

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const from =
    (location.state as { from?: string } | null)?.from ?? searchParams.get('next') ?? undefined
  const defaultDest = user?.role === 'admin' ? '/espace-admin' : '/espace-client'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)
  const [oauthError, setOauthError] = useState('')

  useEffect(() => {
    if (searchParams.get('oauth_error') === 'not_configured') {
      const p = searchParams.get('provider') ?? 'OAuth'
      setOauthError(
        `Connexion ${p} : ajoutez les clés OAuth sur le serveur (voir PRODUCTION.md). En attendant, utilisez email et mot de passe.`,
      )
    } else if (searchParams.get('oauth_error') === '1') {
      setOauthError('Connexion Google / Apple impossible. Réessayez ou utilisez email et mot de passe.')
    } else if (searchParams.get('oauth_error') === 'apple_setup') {
      setOauthError('Sign in with Apple nécessite une configuration Apple Developer sur le serveur.')
    }
  }, [searchParams])

  if (isAuthenticated && user) {
    const dest =
      user.role === 'admin'
        ? from ?? defaultDest
        : resolveClientPostAuthPath(from, getWorkspaceCache()?.projects ?? [], user.id)
    return <Navigate to={dest} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}

    if (!email.trim()) next.email = 'Email requis'
    else if (!validateEmail(email)) next.email = 'Email invalide'
    if (!password) next.password = 'Mot de passe requis'

    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    setErrors({})

    try {
      await login(email, password, remember)
      const session = getSession()
      const u = session?.user
      const dest =
        u?.role === 'admin'
          ? from ?? '/espace-admin'
          : resolveClientPostAuthPath(from, getWorkspaceCache()?.projects ?? [], u!.id)
      navigate(dest, { replace: true })
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Connexion impossible.' })
    } finally {
      setLoading(false)
    }
  }

  const fillFixture = (fixtureEmail: string, fixturePassword: string) => {
    setEmail(fixtureEmail)
    setPassword(fixturePassword)
    setErrors({})
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="auth-form-eyebrow">Connexion</p>
        <h1 className="auth-form-title">Bon retour parmi nous</h1>
        <p className="auth-form-subtitle">
          Accédez à votre espace pour suivre vos projets Sirius.
        </p>

        <AuthFixturesPanel onSelect={fillFixture} />

        <SocialAuthButtons mode="login" />

        {oauthError && (
          <p className="auth-form-error mt-2" role="alert">
            {oauthError}
          </p>
        )}

        <div className="auth-divider">
          <span>ou avec votre email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AnimatePresence>
            {errors.form && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="auth-form-error"
                role="alert"
              >
                {errors.form}
              </motion.p>
            )}
          </AnimatePresence>

          <AuthField
            id="login-email"
            label="Email"
            type="email"
            name="email"
            icon={Mail}
            autoComplete="email"
            placeholder="marie@demo.sirius"
            value={email}
            onChange={setEmail}
            error={errors.email}
          />

          <AuthField
            id="login-password"
            label="Mot de passe"
            type="password"
            name="password"
            icon={Lock}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            error={errors.password}
          />

          <div className="auth-form-row">
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="auth-checkbox-box" />
              <span>Se souvenir de moi</span>
            </label>
            <a href="#contact" className="auth-forgot-link">
              Mot de passe oublié ?
            </a>
          </div>

          <button type="submit" className="btn-primary auth-submit w-full" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner auth-spinner--light" aria-hidden="true" />
                Connexion en cours…
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight size={16} strokeWidth={2} />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Pas encore de compte ?{' '}
          <Link to={`/inscription?next=${encodeURIComponent(from ?? DEFAULT_AUTH_NEXT)}`}>Créer un compte</Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
