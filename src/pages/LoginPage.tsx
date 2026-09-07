import { useState } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import AuthField from '../components/auth/AuthField'
import SocialAuthButtons from '../components/auth/SocialAuthButtons'
import AuthFixturesPanel from '../components/auth/AuthFixturesPanel'
import { useAuth } from '../context/AuthContext'

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/espace-client'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from} replace />
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
      navigate(from, { replace: true })
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
          <Link to="/inscription">Créer un compte</Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
