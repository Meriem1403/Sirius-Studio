import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Building2, Lock, Mail, User } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import AuthField from '../components/auth/AuthField'
import PasswordStrength from '../components/auth/PasswordStrength'
import SocialAuthButtons from '../components/auth/SocialAuthButtons'
import MaquetteRequestFields, {
  type MaquetteNeed,
  type MaquetteRequestFormValues,
} from '../components/auth/MaquetteRequestFields'
import { useAuth } from '../context/AuthContext'
import { getWorkspaceCache } from '../lib/api/workspaceSync'
import { LOGIN_MAQUETTE_URL } from '../lib/auth/maquetteEntry'
import { resolveClientPostAuthPath } from '../lib/auth/postAuthRedirect'
import { submitClientRequest } from '../lib/services/clientRequestService'
import { isApiMode } from '../lib/api/config'

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function SignupPage() {
  const { register, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [maquette, setMaquette] = useState<MaquetteRequestFormValues>({
    projectTitle: '',
    projectType: 'Site vitrine',
    needs: [] as MaquetteNeed[],
    projectMessage: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  if (isAuthenticated && user) {
    const dest = resolveClientPostAuthPath(
      '/espace-client/nouvelle-demande',
      getWorkspaceCache()?.projects ?? [],
      user.id,
    )
    return <Navigate to={dest} replace />
  }

  const validateMaquette = () => {
    const next: Record<string, string> = {}
    if (maquette.projectTitle.trim().length < 3) next.projectTitle = 'Nom du projet requis (3 car. min.)'
    if (maquette.projectMessage.trim().length < 10) {
      next.projectMessage = 'Décrivez votre besoin (10 caractères minimum).'
    }
    return next
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

    Object.assign(next, validateMaquette())

    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    setErrors({})

    try {
      const created = await register({
        name,
        email,
        password,
        company: company || undefined,
        projectRequest: isApiMode()
          ? {
              title: maquette.projectTitle.trim(),
              type: maquette.projectType.trim() || 'Site vitrine',
              message: maquette.projectMessage.trim(),
              needs: maquette.needs.length ? [...maquette.needs] : undefined,
            }
          : undefined,
      })

      if (!isApiMode()) {
        await submitClientRequest(created, {
          title: maquette.projectTitle.trim(),
          type: maquette.projectType.trim() || 'Site vitrine',
          message: maquette.projectMessage.trim(),
          needs: maquette.needs.length ? [...maquette.needs] : undefined,
        })
      }

      const cache = getWorkspaceCache()
      const mine = (cache?.projects ?? []).filter((p) => p.userId === created.id)
      const projectId = mine[0]?.id
      if (projectId) {
        navigate(`/espace-client/projets/${projectId}`, { replace: true })
      } else {
        navigate('/espace-client/nouvelle-demande', { replace: true, state: { onboarding: true } })
      }
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Inscription impossible.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout wide>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-signup-flow">
        <p className="auth-form-eyebrow">Maquette gratuite</p>
        <h1 className="auth-form-title">Compte + demande en une étape</h1>
        <p className="auth-form-subtitle">
          Créez votre espace client et décrivez votre projet. Sans compte, nous ne pouvons pas lancer votre maquette.
        </p>

        <SocialAuthButtons mode="signup" />

        <div className="auth-divider">
          <span>ou avec votre email</span>
        </div>

        <form className="auth-form auth-form--signup-maquette" onSubmit={handleSubmit} noValidate>
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

          <div className="auth-maquette-section">
            <div className="auth-section-head">
              <span className="auth-section-step">1</span>
              <div>
                <h2 className="auth-section-title">Votre compte</h2>
                <p className="auth-section-desc">Connexion future via le même email ou Google / Microsoft / Apple.</p>
              </div>
            </div>

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
              label="Email"
              type="email"
              name="email"
              icon={Mail}
              autoComplete="email"
              placeholder="vous@entreprise.com"
              value={email}
              onChange={setEmail}
              error={errors.email}
            />

            <div className="auth-form-grid auth-form-grid--passwords">
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
              />
              <AuthField
                id="signup-confirm"
                label="Confirmer"
                type="password"
                name="confirmPassword"
                icon={Lock}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={setConfirmPassword}
                error={errors.confirmPassword}
              />
            </div>
            <PasswordStrength password={password} />
          </div>

          <MaquetteRequestFields
            values={maquette}
            onChange={(patch) => setMaquette((m) => ({ ...m, ...patch }))}
            errors={errors}
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
            <span>J&apos;accepte les conditions d&apos;utilisation et la politique de confidentialité.</span>
          </label>
          {errors.terms && <span className="auth-field-error auth-field-error--block">{errors.terms}</span>}

          <button type="submit" className="btn-primary auth-submit w-full" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner auth-spinner--light" aria-hidden="true" />
                Envoi en cours…
              </>
            ) : (
              <>
                Créer mon compte et demander ma maquette
                <ArrowRight size={16} strokeWidth={2} />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ? <Link to={LOGIN_MAQUETTE_URL}>Se connecter</Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
