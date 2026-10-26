import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import MaquetteRequestForm from '../../components/maquette/MaquetteRequestForm'
import { CtaIcon } from '../../components/icons'
import { submitClientRequest } from '../../lib/services/clientRequestService'
import {
  emptyMaquetteForm,
  toMaquetteBriefPayload,
  validateMaquetteProjectFields,
  type MaquetteFormValues,
} from '../../lib/maquette/brief'

export default function ClientNewRequestPage() {
  const { user } = useAuth()
  const { refresh } = useWorkspace()
  const navigate = useNavigate()
  const location = useLocation()
  const onboarding = Boolean((location.state as { onboarding?: boolean } | null)?.onboarding)

  const [form, setForm] = useState<MaquetteFormValues>(() => {
    const base = emptyMaquetteForm()
    if (user) {
      base.name = user.name
      base.email = user.email
      base.company = user.company ?? ''
      base.phone = user.phone ?? ''
    }
    return base
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const next = validateMaquetteProjectFields(form)
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    try {
      const payload = toMaquetteBriefPayload(form)
      const result = await submitClientRequest(user, payload)
      refresh()
      navigate(`/espace-client/projets/${result.projectId}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible. Vérifiez que l’API tourne (npm run dev:api).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="client-page-header">
        <div>
          <p className="client-page-eyebrow">Commencer</p>
          <h1 className="client-page-title">Recevez votre maquette gratuitement</h1>
          <p className="client-page-subtitle">
            {onboarding
              ? 'Même formulaire que sur le site : situation, besoins, objectifs et détails du projet.'
              : 'Quelques informations suffisent. Sirius revient vers vous sous 48 h ouvrées.'}
          </p>
        </div>
      </header>

      <form className="contact-shell max-w-3xl" onSubmit={handleSubmit}>
        {error && (
          <p className="client-alert-desc text-red-300 mb-4" role="alert">
            {error}
          </p>
        )}

        <MaquetteRequestForm
          variant="client"
          values={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          errors={errors}
        />

        <div className="flex flex-wrap gap-3 mt-6">
          <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2" disabled={loading}>
            <CtaIcon size={18} />
            {loading ? 'Envoi en cours…' : 'Demander ma maquette gratuite'}
          </button>
          {!onboarding && (
            <Link to="/espace-client/projets" className="client-link inline-flex items-center gap-1">
              Annuler <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </form>
    </>
  )
}
