import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Building2, FileText, Layers, Lock, Mail, User } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import AuthField from '../components/auth/AuthField'
import PasswordStrength from '../components/auth/PasswordStrength'
import SocialAuthButtons from '../components/auth/SocialAuthButtons'
import { useAuth } from '../context/AuthContext'
import { isApiMode } from '../lib/api/config'

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
  const [withProject, setWithProject] = useState(true)
  const [projectTitle, setProjectTitle] = useState('')
  const [projectType, setProjectType] = useState('Site vitrine')
  const [projectMessage, setProjectMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const apiMode = isApiMode()

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
    if (apiMode && withProject) {
      if (projectTitle.trim().length < 3) next.projectTitle = 'Titre du projet requis (3 car. min.)'
      if (projectMessage.trim().length < 10) next.projectMessage = 'Décrivez votre besoin (10 car. min.)'
    }

    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    setErrors({})

    try {
      await register({
        name,
        email,
        password,
        company: company || undefined,
        projectRequest:
          apiMode && withProject
            ? {
                title: projectTitle.trim(),
                type: projectType.trim() || 'Site vitrine',
                message: projectMessage.trim(),
              }
            : undefined,
      })
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

          {apiMode && (
            <div className="auth-project-block">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={withProject}
                  onChange={(e) => setWithProject(e.target.checked)}
                />
                <span className="auth-checkbox-box" />
                <span>Déposer ma demande de projet dès l&apos;inscription (recommandé)</span>
              </label>
              {withProject && (
                <div className="auth-project-fields">
                  <AuthField
                    id="signup-project-title"
                    label="Titre du projet"
                    name="projectTitle"
                    icon={FileText}
                    placeholder="Ex. Site vitrine"
                    value={projectTitle}
                    onChange={setProjectTitle}
                    error={errors.projectTitle}
                  />
                  <AuthField
                    id="signup-project-type"
                    label="Type"
                    name="projectType"
                    icon={Layers}
                    placeholder="Site vitrine"
                    value={projectType}
                    onChange={setProjectType}
                  />
                  <label className="auth-field">
                    <span className="auth-field-label">Votre besoin</span>
                    <textarea
                      className="auth-field-input auth-field-textarea"
                      rows={4}
                      value={projectMessage}
                      onChange={(e) => setProjectMessage(e.target.value)}
                      placeholder="Décrivez votre projet…"
                    />
                    {errors.projectMessage && (
                      <span className="auth-field-error">{errors.projectMessage}</span>
                    )}
                  </label>
                </div>
              )}
            </div>
          )}

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
