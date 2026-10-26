import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AuthLayout from '../components/auth/AuthLayout'
import SocialAuthButtons from '../components/auth/SocialAuthButtons'
import MaquetteRequestForm from '../components/maquette/MaquetteRequestForm'
import { CtaIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { getWorkspaceCache } from '../lib/api/workspaceSync'
import { LOGIN_MAQUETTE_URL } from '../lib/auth/maquetteEntry'
import { resolveClientPostAuthPath } from '../lib/auth/postAuthRedirect'
import { submitClientRequest } from '../lib/services/clientRequestService'
import { isApiMode } from '../lib/api/config'
import {
  emptyMaquetteForm,
  toMaquetteBriefPayload,
  validateMaquetteSignupForm,
  type MaquetteFormValues,
} from '../lib/maquette/brief'

export default function SignupPage() {
  const { register, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<MaquetteFormValues>(emptyMaquetteForm())
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  if (isAuthenticated && user) {
    const dest = resolveClientPostAuthPath(null, getWorkspaceCache()?.projects ?? [], user.id)
    return <Navigate to={dest} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next = validateMaquetteSignupForm(form, { password, confirmPassword, terms })
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    setErrors({})

    const briefPayload = toMaquetteBriefPayload(form)

    try {
      const { user: created, projectId: registeredProjectId } = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password,
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
        siret: form.siret.trim() || undefined,
        projectRequest: isApiMode() ? briefPayload : undefined,
      })

      let projectId = registeredProjectId

      if (!isApiMode()) {
        const local = await submitClientRequest(created, briefPayload)
        projectId = local.projectId
      }

      if (!projectId) {
        const cache = getWorkspaceCache()
        const mine = (cache?.projects ?? []).filter((p) => p.userId === created.id)
        projectId = mine[0]?.id
      }

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
        <div className="text-center mb-8 lg:mb-10">
          <p className="auth-form-eyebrow">Commencer</p>
          <h1 className="auth-form-title text-3xl sm:text-4xl">Recevez votre maquette gratuitement</h1>
          <p className="auth-form-subtitle max-w-xl mx-auto">
            Quelques informations suffisent. Créez votre compte puis décrivez votre projet — Sirius revient vers
            vous sous 48 h avec une première maquette.
          </p>
        </div>

        <SocialAuthButtons mode="signup" />

        <div className="auth-divider">
          <span>ou avec votre email</span>
        </div>

        <form className="contact-shell" onSubmit={handleSubmit} noValidate>
          {errors.form && (
            <p className="client-alert-desc text-red-300 mb-4" role="alert">
              {errors.form}
            </p>
          )}

          <MaquetteRequestForm
            variant="signup"
            values={form}
            onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
            errors={errors}
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            terms={terms}
            onTermsChange={(checked) => {
              setTerms(checked)
              if (checked) setErrors((prev) => ({ ...prev, terms: '' }))
            }}
          />

          <button
            type="submit"
            className="btn-primary w-full inline-flex items-center justify-center gap-2 mt-6"
            disabled={loading}
          >
            <CtaIcon size={18} />
            {loading ? 'Envoi en cours…' : 'Demander ma maquette gratuite'}
          </button>
        </form>

        <p className="auth-switch mt-6">
          Déjà un compte ? <Link to={LOGIN_MAQUETTE_URL}>Se connecter</Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
