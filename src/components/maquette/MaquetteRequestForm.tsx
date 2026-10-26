import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  Check,
  Compass,
  Hash,
  LayoutTemplate,
  Lightbulb,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import PasswordStrength from '../auth/PasswordStrength'
import {
  MAQUETTE_NEED_OPTIONS,
  MAQUETTE_OBJECTIVE_OPTIONS,
  MAQUETTE_SITUATIONS,
  formatSiretDisplay,
  isMaquetteMessageRequired,
  maquetteMessagePlaceholder,
  toggleMaquetteItem,
  type MaquetteFormValues,
  type MaquetteSituation,
} from '../../lib/maquette/brief'

const situationIcons: Record<MaquetteSituation, LucideIcon> = {
  existing: LayoutTemplate,
  idea: Lightbulb,
  unknown: Compass,
}

type Props = {
  variant: 'signup' | 'client'
  values: MaquetteFormValues
  onChange: (patch: Partial<MaquetteFormValues>) => void
  errors: Record<string, string>
  password?: string
  confirmPassword?: string
  onPasswordChange?: (password: string) => void
  onConfirmPasswordChange?: (confirm: string) => void
  terms?: boolean
  onTermsChange?: (terms: boolean) => void
}

export default function MaquetteRequestForm({
  variant,
  values,
  onChange,
  errors,
  password = '',
  confirmPassword = '',
  onPasswordChange,
  onConfirmPasswordChange,
  terms = false,
  onTermsChange,
}: Props) {
  const companyProvided = values.company.trim().length > 0
  const showWebsite = values.situation === 'existing'
  const messageRequired = isMaquetteMessageRequired(values.situation)
  const messagePlaceholder = maquetteMessagePlaceholder(values.situation)

  return (
    <>
      {variant === 'signup' && (
        <fieldset className="contact-block">
          <legend className="contact-block-title">Coordonnées</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="contact-field-wrap">
              <label htmlFor="maquette-name" className="contact-label">
                Nom complet <span className="contact-required">*</span>
              </label>
              <div className="contact-field">
                <User size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                <input
                  id="maquette-name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  className={`contact-input contact-input--icon ${errors.name ? 'contact-input--error' : ''}`}
                  placeholder="Jean Dupont"
                />
              </div>
              {errors.name && (
                <p className="contact-field-error" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="contact-field-wrap">
              <label htmlFor="maquette-email" className="contact-label">
                Email <span className="contact-required">*</span>
              </label>
              <div className="contact-field">
                <Mail size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                <input
                  id="maquette-email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => onChange({ email: e.target.value })}
                  className={`contact-input contact-input--icon ${errors.email ? 'contact-input--error' : ''}`}
                  placeholder="vous@email.com"
                />
              </div>
              {errors.email && (
                <p className="contact-field-error" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="contact-field-wrap">
              <label htmlFor="maquette-phone" className="contact-label">
                Téléphone
              </label>
              <div className="contact-field">
                <Phone size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                <input
                  id="maquette-phone"
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={(e) => onChange({ phone: e.target.value })}
                  className="contact-input contact-input--icon"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
            <div className="contact-field-wrap">
              <label htmlFor="maquette-company" className="contact-label">
                Entreprise ou activité
              </label>
              <div className="contact-field">
                <Building2 size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                <input
                  id="maquette-company"
                  type="text"
                  autoComplete="organization"
                  value={values.company}
                  onChange={(e) => onChange({ company: e.target.value })}
                  className="contact-input contact-input--icon"
                  placeholder="Nom de votre activité"
                />
              </div>
            </div>
            <div className="contact-field-wrap sm:col-span-2">
              <label htmlFor="maquette-siret" className="contact-label">
                Numéro SIREN ou SIRET
                {companyProvided && <span className="contact-required">*</span>}
              </label>
              <div className="contact-field">
                <Hash size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                <input
                  id="maquette-siret"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={values.siret}
                  onChange={(e) => {
                    onChange({ siret: formatSiretDisplay(e.target.value) })
                  }}
                  className={`contact-input contact-input--icon ${errors.siret ? 'contact-input--error' : ''}`}
                  placeholder="123 456 789 ou 123 456 789 00012"
                  aria-describedby="maquette-siret-help"
                />
              </div>
              <p id="maquette-siret-help" className="contact-helper mt-2">
                SIREN : 9 chiffres (entreprise). SIRET : 14 chiffres (établissement). Obligatoire si vous indiquez
                une entreprise.
              </p>
              {errors.siret && (
                <p className="contact-field-error" role="alert">
                  {errors.siret}
                </p>
              )}
            </div>
          </div>
        </fieldset>
      )}

      {variant === 'signup' && (
        <fieldset className="contact-block">
          <legend className="contact-block-title">Votre espace client</legend>
          <p className="contact-helper mb-3">
            Choisissez un mot de passe pour suivre votre maquette et échanger avec l&apos;équipe Sirius.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="contact-field-wrap">
              <label htmlFor="maquette-password" className="contact-label">
                Mot de passe <span className="contact-required">*</span>
              </label>
              <div className="contact-field">
                <Lock size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                <input
                  id="maquette-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => onPasswordChange?.(e.target.value)}
                  className={`contact-input contact-input--icon ${errors.password ? 'contact-input--error' : ''}`}
                  placeholder="8 caractères minimum"
                />
              </div>
              {errors.password && (
                <p className="contact-field-error" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
            <div className="contact-field-wrap">
              <label htmlFor="maquette-confirm" className="contact-label">
                Confirmer <span className="contact-required">*</span>
              </label>
              <div className="contact-field">
                <Lock size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                <input
                  id="maquette-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => onConfirmPasswordChange?.(e.target.value)}
                  className={`contact-input contact-input--icon ${errors.confirmPassword ? 'contact-input--error' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="contact-field-error" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          <PasswordStrength password={password} />
        </fieldset>
      )}

      <fieldset className="contact-block">
        <legend className="contact-block-title">Votre situation</legend>
        <div role="radiogroup" aria-label="Votre situation" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MAQUETTE_SITUATIONS.map((s) => {
            const Icon = situationIcons[s.value]
            const active = values.situation === s.value
            return (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ situation: s.value })}
                className={`contact-situation-card ${active ? 'contact-situation-card--active' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${
                    active
                      ? 'bg-indigo-500/15 border-indigo-400/25 text-indigo-300'
                      : 'bg-white/[0.03] border-white/8 text-white/35'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <span className="block text-sm font-medium text-left mb-0.5">{s.label}</span>
                <span className="block text-[11px] text-white/30 text-left">{s.hint}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="contact-block">
        <legend className="contact-block-title">Vos besoins</legend>
        <p className="contact-helper mb-3">Sélectionnez une ou plusieurs options.</p>
        {errors.needs && (
          <p className="contact-field-error mb-2" role="alert">
            {errors.needs}
          </p>
        )}
        <ul className="contact-chip-list">
          {MAQUETTE_NEED_OPTIONS.map((need) => {
            const selected = values.needs.includes(need)
            return (
              <li key={need}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ needs: toggleMaquetteItem(values.needs, need) })}
                  className={`contact-chip ${selected ? 'contact-chip--active' : ''}`}
                >
                  {selected && <Check size={12} strokeWidth={2.5} className="shrink-0" />}
                  {need}
                </button>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <fieldset className="contact-block">
        <legend className="contact-block-title">Vos objectifs</legend>
        <p className="contact-helper mb-3">Optionnel. Cela nous aide à orienter la maquette.</p>
        <ul className="contact-check-list">
          {MAQUETTE_OBJECTIVE_OPTIONS.map((objective) => {
            const selected = values.objectives.includes(objective)
            return (
              <li key={objective}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ objectives: toggleMaquetteItem(values.objectives, objective) })}
                  className={`contact-check-item ${selected ? 'contact-check-item--active' : ''}`}
                >
                  <span className="contact-check-box" aria-hidden="true">
                    {selected && <Check size={11} strokeWidth={3} />}
                  </span>
                  {objective}
                </button>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <fieldset className="contact-block contact-block--last">
        <legend className="contact-block-title">Détails du projet</legend>

        <AnimatePresence>
          {showWebsite && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <label htmlFor="maquette-website" className="contact-label">
                Adresse de votre site actuel
              </label>
              <input
                id="maquette-website"
                type="url"
                value={values.website}
                onChange={(e) => onChange({ website: e.target.value })}
                className="contact-input"
                placeholder="https://votre-site.com"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <label htmlFor="maquette-message" className="contact-label">
          {values.situation === 'unknown' ? 'Parlez-nous de votre activité' : 'Décrivez votre projet'}
          {messageRequired && <span className="contact-required">*</span>}
        </label>
        <textarea
          id="maquette-message"
          rows={6}
          value={values.message}
          onChange={(e) => onChange({ message: e.target.value })}
          className="contact-input contact-textarea"
          placeholder={messagePlaceholder}
        />
        {errors.message && (
          <p className="contact-field-error mt-1" role="alert">
            {errors.message}
          </p>
        )}
        <ul className="contact-hints mt-3 space-y-1">
          <li>Contexte et activité</li>
          <li>Fonctionnalités souhaitées</li>
          <li>Exemples ou sites que vous aimez</li>
        </ul>
      </fieldset>

      {variant === 'signup' && onTermsChange && (
        <label className={`auth-checkbox auth-checkbox--terms mt-2 ${errors.terms ? 'auth-checkbox--error' : ''}`}>
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => {
              onTermsChange(e.target.checked)
            }}
          />
          <span className="auth-checkbox-box" />
          <span>J&apos;accepte les conditions d&apos;utilisation et la politique de confidentialité.</span>
        </label>
      )}
      {errors.terms && <span className="auth-field-error auth-field-error--block">{errors.terms}</span>}
    </>
  )
}
