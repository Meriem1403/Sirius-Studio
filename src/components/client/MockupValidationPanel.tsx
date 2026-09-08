import { useState } from 'react'
import { ExternalLink, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { ClientProject, MockupClientChoice } from '../../lib/auth/types'
import { useAuth } from '../../context/AuthContext'
import { submitMockupValidation } from '../../lib/services/projectService'
import {
  MOCKUP_CHOICE_LABELS,
  REVISION_OPTIONS,
  SATISFIED_OPTIONS,
  UNSATISFIED_OPTIONS,
  isFinalChoice,
} from '../../lib/client/validation'
import { useWorkspace } from '../../context/WorkspaceContext'

type Step = 'main' | 'satisfied' | 'revision' | 'reject'

interface MockupValidationPanelProps {
  project: ClientProject
}

export default function MockupValidationPanel({ project }: MockupValidationPanelProps) {
  const { user } = useAuth()
  const { refresh } = useWorkspace()
  const [step, setStep] = useState<Step>('main')
  const [feedback, setFeedback] = useState('')
  const [pendingChoice, setPendingChoice] = useState<MockupClientChoice | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!project.mockupUrl) return null

  const validationChoice = project.validation?.choice ?? 'pending'
  const submitted = isFinalChoice(validationChoice)

  function handleSubmit(choice: MockupClientChoice) {
    if (!user || submitting) return
    setSubmitting(true)
    submitMockupValidation({
      projectId: project.id,
      client: user,
      choice,
      feedback,
    })
    setSubmitting(false)
    refresh()
  }

  if (submitted) {
    return (
      <section className="client-validation-panel client-validation-panel--done">
        <div className="client-validation-header">
          <Sparkles size={20} />
          <div>
            <h2 className="client-section-title">Retour enregistré</h2>
            <p className="client-muted mt-1">
              {MOCKUP_CHOICE_LABELS[validationChoice]}. L'équipe Sirius a été notifiée par message, email et SMS.
            </p>
          </div>
        </div>
        <a href={project.mockupUrl} target="_blank" rel="noopener noreferrer" className="client-mockup-link">
          <ExternalLink size={16} />
          Revoir la maquette
        </a>
      </section>
    )
  }

  return (
    <section className="client-validation-panel">
      <div className="client-validation-header">
        <Sparkles size={20} />
        <div>
          <h2 className="client-section-title">Votre maquette est en ligne</h2>
          <p className="client-muted mt-1">
            Parcourez la preview, puis indiquez si elle vous convient ou ce que vous souhaitez ajuster.
          </p>
        </div>
      </div>

      <a href={project.mockupUrl} target="_blank" rel="noopener noreferrer" className="client-mockup-preview">
        <ExternalLink size={18} />
        <span>Ouvrir la maquette Netlify</span>
        <span className="client-mockup-url">{project.mockupUrl}</span>
      </a>

      {step === 'main' && (
        <div className="client-validation-actions">
          <button type="button" className="client-validation-card client-validation-card--positive" onClick={() => setStep('satisfied')}>
            <ThumbsUp size={20} />
            <span className="client-validation-card-title">Ça me plaît</span>
            <span className="client-validation-card-desc">Demander un devis pour la suite</span>
          </button>
          <button type="button" className="client-validation-card" onClick={() => setStep('revision')}>
            <span className="client-validation-card-title">Modifications</span>
            <span className="client-validation-card-desc">Ajuster certains éléments</span>
          </button>
          <button type="button" className="client-validation-card client-validation-card--muted" onClick={() => setStep('reject')}>
            <ThumbsDown size={20} />
            <span className="client-validation-card-title">Pas convaincu</span>
            <span className="client-validation-card-desc">Autres options</span>
          </button>
        </div>
      )}

      {step === 'satisfied' && (
        <div className="client-validation-step">
          <p className="client-validation-step-label">Parfait ! Passez à l'étape suivante</p>
          <div className="client-validation-options">
            {SATISFIED_OPTIONS.map((opt) => (
              <button
                key={opt.choice}
                type="button"
                className="client-validation-option client-validation-option--highlight"
                disabled={submitting}
                onClick={() => handleSubmit(opt.choice)}
              >
                <strong>{opt.title}</strong>
                <span>{opt.description}</span>
              </button>
            ))}
          </div>
          <button type="button" className="client-link mt-3 block" onClick={() => setStep('main')}>
            Retour
          </button>
        </div>
      )}

      {step === 'revision' && !pendingChoice && (
        <div className="client-validation-step">
          <p className="client-validation-step-label">Quelle modification souhaitez-vous ?</p>
          <div className="client-validation-options">
            {REVISION_OPTIONS.map((opt) => (
              <button
                key={opt.choice}
                type="button"
                className="client-validation-option"
                onClick={() => setPendingChoice(opt.choice)}
              >
                <strong>{opt.title}</strong>
                <span>{opt.description}</span>
              </button>
            ))}
          </div>
          <button type="button" className="client-link mt-3 block" onClick={() => setStep('main')}>
            Retour
          </button>
        </div>
      )}

      {step === 'revision' && pendingChoice && (
        <div className="client-validation-step">
          <p className="client-validation-step-label">
            {REVISION_OPTIONS.find((o) => o.choice === pendingChoice)?.title}
          </p>
          <textarea
            className="client-message-input"
            placeholder="Précisez votre demande..."
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex flex-wrap gap-3 mt-3">
            <button type="button" className="btn-primary" disabled={submitting} onClick={() => handleSubmit(pendingChoice)}>
              Envoyer ma demande
            </button>
            <button type="button" className="btn-secondary" onClick={() => setPendingChoice(null)}>
              Retour
            </button>
          </div>
        </div>
      )}

      {step === 'reject' && !pendingChoice && (
        <div className="client-validation-step">
          <p className="client-validation-step-label">Que souhaitez-vous faire ?</p>
          <div className="client-validation-options">
            {UNSATISFIED_OPTIONS.map((opt) => (
              <button
                key={opt.choice}
                type="button"
                className="client-validation-option"
                onClick={() => setPendingChoice(opt.choice)}
              >
                <strong>{opt.title}</strong>
                <span>{opt.description}</span>
              </button>
            ))}
          </div>
          <button type="button" className="client-link mt-3 block" onClick={() => setStep('main')}>
            Retour
          </button>
        </div>
      )}

      {step === 'reject' && pendingChoice && (
        <div className="client-validation-step">
          <p className="client-validation-step-label">
            {UNSATISFIED_OPTIONS.find((o) => o.choice === pendingChoice)?.title}
          </p>
          <textarea
            className="client-message-input"
            placeholder="Expliquez votre choix (optionnel)..."
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex flex-wrap gap-3 mt-3">
            <button type="button" className="btn-primary" disabled={submitting} onClick={() => handleSubmit(pendingChoice)}>
              Confirmer
            </button>
            <button type="button" className="btn-secondary" onClick={() => setPendingChoice(null)}>
              Retour
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
