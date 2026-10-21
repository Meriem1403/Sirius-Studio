import { FileText, MessageSquare } from 'lucide-react'
import AuthField from './AuthField'

export const MAQUETTE_NEED_OPTIONS = [
  'Site vitrine',
  'E-commerce',
  'Application mobile',
  'Logiciel sur mesure',
  'Refonte complète',
] as const

export type MaquetteNeed = (typeof MAQUETTE_NEED_OPTIONS)[number]

export type MaquetteRequestFormValues = {
  projectTitle: string
  projectType: string
  needs: MaquetteNeed[]
  projectMessage: string
}

type Props = {
  values: MaquetteRequestFormValues
  onChange: (patch: Partial<MaquetteRequestFormValues>) => void
  errors: Record<string, string>
}

function toggleNeed(list: MaquetteNeed[], item: MaquetteNeed): MaquetteNeed[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

export default function MaquetteRequestFields({ values, onChange, errors }: Props) {
  return (
    <div className="auth-maquette-section">
      <div className="auth-section-head">
        <span className="auth-section-step">2</span>
        <div>
          <h2 className="auth-section-title">Votre demande de maquette</h2>
          <p className="auth-section-desc">Décrivez votre projet — nous préparons une première maquette gratuite.</p>
        </div>
      </div>

      <AuthField
        id="signup-project-title"
        label="Nom du projet"
        name="projectTitle"
        icon={FileText}
        placeholder="Ex. Site vitrine Atelier Lumière"
        value={values.projectTitle}
        onChange={(v) => onChange({ projectTitle: v })}
        error={errors.projectTitle}
      />

      <AuthField
        id="signup-project-type"
        label="Type de réalisation"
        name="projectType"
        icon={FileText}
        placeholder="Site vitrine, e-commerce…"
        value={values.projectType}
        onChange={(v) => onChange({ projectType: v })}
        error={errors.projectType}
      />

      <fieldset className="auth-maquette-needs">
        <legend className="auth-field-label">Besoins (optionnel)</legend>
        <div className="contact-chip-list">
          {MAQUETTE_NEED_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={`contact-chip ${values.needs.includes(n) ? 'contact-chip--active' : ''}`}
              onClick={() => onChange({ needs: toggleNeed(values.needs, n) })}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="auth-field auth-field--textarea">
        <span className="auth-field-label">
          <MessageSquare size={14} className="inline mr-1 opacity-60" aria-hidden />
          Décrivez votre idée ou votre besoin
        </span>
        <textarea
          className="auth-field-input auth-field-textarea auth-maquette-textarea"
          rows={5}
          value={values.projectMessage}
          onChange={(e) => onChange({ projectMessage: e.target.value })}
          placeholder="Objectifs, public, délais, liens utiles, ce qui ne va pas avec votre site actuel…"
        />
        {errors.projectMessage && <span className="auth-field-error">{errors.projectMessage}</span>}
      </label>
    </div>
  )
}
