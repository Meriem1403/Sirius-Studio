import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Building2, Lock, Mail, User } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import AuthField from '../components/auth/AuthField'
import PasswordStrength from '../components/auth/PasswordStrength'
import SocialAuthButtons from '../components/auth/SocialAuthButtons'
import { useAuth } from '../context/AuthContext'

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function SignupPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/espace-client" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}

    if (!name.trim()) next.name = 'Nom requis'
    if (!email.trim()) next.email = 'Email requis'
    else if (!validateEmail(email)) next.email = 'Email invalide'
    if (!password) next.password = 'Mot de passe requis'
    else if (password.length < 8) next.password = '8 caractères minimum'
    if (password !== confirmPassword) next.confirmPassword = 'Les mots de passe ne correspondent pas'
    if (!terms) next.terms = 'Vous devez accepter les conditions'

    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    setErrors({})

    try {
      await register({ name, email, password, company: company || undefined })
      navigate('/espace-client', { replace: true })
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Inscription impossible.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="auth-form-eyebrow">Inscription</p>
        <h1 className="auth-form-title">Créer votre compte</h1>
        <p className="auth-form-subtitle">
          Quelques secondes pour rejoindre votre espace client Sirius.
        </p>

        <SocialAuthButtons mode="signup" />

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

          <div className="auth-form-grid">
            <AuthField
              id="signup-name"
              label="Nom complet"
              name="name"
              icon={User}
              autoComplete="name"
              placeholder="Jean Dupont"
              value={name}
              onChange={setName}
              error={errors.name}
            />
            <AuthField
              id="signup-company"
              label="Entreprise"
              name="company"
              icon={Building2}
              autoComplete="organization"
              placeholder="Optionnel"
              value={company}
              onChange={setCompany}
            />
          </div>

          <AuthField
            id="signup-email"
            label="Email professionnel"
            type="email"
            name="email"
            icon={Mail}
            autoComplete="email"
            placeholder="vous@entreprise.com"
            value={email}
            onChange={setEmail}
            error={errors.email}
          />

          <AuthField
            id="signup-password"
            label="Mot de passe"
            type="password"
            name="password"
            icon={Lock}
            autoComplete="new-password"
            placeholder="8 caractères minimum"
            value={password}
            onChange={setPassword}
            error={errors.password}
            hint="Lettres, chiffres et caractère spécial recommandés"
          />
          <PasswordStrength password={password} />

          <AuthField
            id="signup-confirm"
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            icon={Lock}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
          />

          <label className={`auth-checkbox auth-checkbox--terms ${errors.terms ? 'auth-checkbox--error' : ''}`}>
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => {
                setTerms(e.target.checked)
                if (e.target.checked) setErrors((prev) => ({ ...prev, terms: '' }))
              }}
            />
            <span className="auth-checkbox-box" />
            <span>
              J&apos;accepte les{' '}
              <a href="#contact" className="auth-inline-link">conditions d&apos;utilisation</a>
              {' '}et la{' '}
              <a href="#contact" className="auth-inline-link">politique de confidentialité</a>
            </span>
          </label>
          {errors.terms && <span className="auth-field-error auth-field-error--block">{errors.terms}</span>}

          <button type="submit" className="btn-primary auth-submit w-full" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner auth-spinner--light" aria-hidden="true" />
                Création en cours…
              </>
            ) : (
              <>
                Créer mon compte
                <ArrowRight size={16} strokeWidth={2} />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ?{' '}
          <Link to="/connexion">Se connecter</Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
