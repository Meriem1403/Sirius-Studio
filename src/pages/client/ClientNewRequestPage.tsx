import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Send } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { isApiMode } from '../../lib/api/config'
import { submitClientProjectRequest } from '../../lib/api/requests'
import { applyWorkspaceProjects, syncWorkspace } from '../../lib/api/workspaceSync'

const needOptions = [
  'Site vitrine',
  'E-commerce',
  'Application mobile',
  'Logiciel sur mesure',
  'Refonte complète',
] as const

type Need = (typeof needOptions)[number]

function toggleNeed(list: Need[], item: Need): Need[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

export default function ClientNewRequestPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Site vitrine')
  const [needs, setNeeds] = useState<Need[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) return null

  if (!isApiMode()) {
    return (
      <div className="client-section">
        <p className="client-muted">
          Les demandes en ligne nécessitent l’API de production. Configurez <code>VITE_API_BASE_URL</code> sur Netlify.
        </p>
        <Link to="/#contact" className="btn-primary mt-4 inline-flex">
          Formulaire du site
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (title.trim().length < 3) {
      setError('Indiquez un titre de projet (3 caractères minimum).')
      return
    }
    if (message.trim().length < 10) {
      setError('Décrivez votre besoin (10 caractères minimum).')
      return
    }

    setLoading(true)
    try {
      const result = await submitClientProjectRequest({
        title: title.trim(),
        type: type.trim() || 'Site web',
        message: message.trim(),
        needs: needs.length ? [...needs] : undefined,
      })
      applyWorkspaceProjects(result.projects)
      await syncWorkspace()
      navigate(`/espace-client/projets/${result.projectId}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="client-page-header">
        <div>
          <p className="client-page-eyebrow">Demande</p>
          <h1 className="client-page-title">Déposer une demande de projet</h1>
          <p className="client-page-subtitle">
            Décrivez votre besoin : l’équipe Sirius est notifiée par email et vous recontacte sous 48 h ouvrées.
          </p>
        </div>
      </header>

      <form className="client-detail-panel max-w-2xl" onSubmit={handleSubmit}>
        {error && (
          <p className="auth-form-error" role="alert">
            {error}
          </p>
        )}

        <label className="block mb-4">
          <span className="client-profile-field-label">Titre du projet</span>
          <input
            className="admin-input mt-1 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Refonte site vitrine"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="client-profile-field-label">Type principal</span>
          <input
            className="admin-input mt-1 w-full"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Site vitrine, e-commerce…"
            required
          />
        </label>

        <fieldset className="block mb-4 border-0 p-0">
          <legend className="client-profile-field-label mb-2">Besoins (optionnel)</legend>
          <div className="contact-chip-list">
            {needOptions.map((n) => (
              <button
                key={n}
                type="button"
                className={`contact-chip ${needs.includes(n) ? 'contact-chip--active' : ''}`}
                onClick={() => setNeeds((prev) => toggleNeed(prev, n))}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block mb-4">
          <span className="client-profile-field-label">Votre message</span>
          <textarea
            className="admin-input mt-1 w-full min-h-[140px]"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Contexte, délais, budget indicatif, liens utiles…"
            required
          />
        </label>

        <div className="flex flex-wrap gap-3 mt-6">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Envoi…' : (
              <>
                Envoyer ma demande
                <Send size={16} className="ml-2 inline" />
              </>
            )}
          </button>
          <Link to="/espace-client/projets" className="client-link inline-flex items-center gap-1">
            Annuler <ArrowRight size={14} />
          </Link>
        </div>
      </form>
    </>
  )
}
