import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Check,
  Compass,
  Hash,
  LayoutTemplate,
  Lightbulb,
  Mail,
  Phone,
  Sparkles,
  User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CtaIcon } from './icons'

type Situation = 'existing' | 'idea' | 'unknown'

const situations: {
  value: Situation
  label: string
  hint: string
  icon: LucideIcon
}[] = [
  {
    value: 'existing',
    label: "J'ai déjà un site",
    hint: 'Refonte ou modernisation',
    icon: LayoutTemplate,
  },
  {
    value: 'idea',
    label: "J'ai une idée ou des besoins",
    hint: 'Projet à cadrer ensemble',
    icon: Lightbulb,
  },
  {
    value: 'unknown',
    label: 'Je ne sais pas encore',
    hint: 'Sirius vous oriente',
    icon: Compass,
  },
]

const needOptions = [
  'Site vitrine',
  'E-commerce',
  'Application mobile',
  'Logiciel sur mesure',
  'Refonte complète',
] as const

const objectiveOptions = [
  'Gagner en visibilité',
  'Convertir plus de clients',
  'Moderniser mon image',
  'Lancer un nouveau projet',
] as const

type Need = (typeof needOptions)[number]
type Objective = (typeof objectiveOptions)[number]

function toggleItem<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

function normalizeSiretInput(value: string): string {
  return value.replace(/\D/g, '')
}

function isValidSirenOrSiret(value: string): boolean {
  const digits = normalizeSiretInput(value)
  return digits.length === 9 || digits.length === 14
}

function formatSiretDisplay(value: string): string {
  const digits = normalizeSiretInput(value).slice(0, 14)
  if (digits.length <= 9) {
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
  }
  const siren = digits.slice(0, 9)
  const nic = digits.slice(9)
  return `${siren.replace(/(\d{3})(?=\d)/g, '$1 ').trim()} ${nic}`.trim()
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [siretError, setSiretError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    siret: '',
    situation: 'idea' as Situation,
    website: '',
    needs: [] as Need[],
    objectives: [] as Objective[],
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const companyProvided = form.company.trim().length > 0

    if (companyProvided && !isValidSirenOrSiret(form.siret)) {
      setSiretError('Indiquez un SIREN (9 chiffres) ou un SIRET (14 chiffres) valide.')
      return
    }

    setSiretError('')
    setSubmitted(true)
  }

  const companyProvided = form.company.trim().length > 0
  const showWebsite = form.situation === 'existing'
  const messageRequired = form.situation !== 'unknown'

  const messagePlaceholder =
    form.situation === 'existing'
      ? 'Qu\'est-ce qui ne fonctionne pas aujourd\'hui ? Quels résultats attendez-vous de la refonte ?'
      : form.situation === 'idea'
        ? 'Décrivez votre idée, vos fonctionnalités clés, votre public et vos inspirations.'
        : 'Présentez votre activité en quelques lignes. Sirius vous proposera une direction claire.'

  return (
    <section id="contact" className="section-wrap relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 85% 60% at 50% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 62%)',
        }}
      />

      <div className="section-inner relative max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 lg:mb-12"
        >
          <span className="section-label mb-4">Commencer</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-4">
            Recevez votre maquette
            <br />
            <span className="glow-text">gratuitement.</span>
          </h2>
          <p className="text-white/40 text-lg xl:text-xl max-w-xl mx-auto">
            Quelques informations suffisent. Sirius revient vers vous sous 48h avec une première maquette.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="contact-shell contact-success text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300"
              >
                <Sparkles size={28} strokeWidth={1.75} />
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-tight">Demande envoyée</h3>
              <p className="text-white/45 text-base leading-relaxed max-w-md mx-auto">
                Merci pour votre confiance. Sirius analyse votre projet et vous contacte sous 48h avec votre
                maquette gratuite.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit}
              className="contact-shell"
            >
              <fieldset className="contact-block">
                <legend className="contact-block-title">Coordonnées</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="contact-field-wrap">
                    <label htmlFor="name" className="contact-label">
                      Nom complet <span className="contact-required">*</span>
                    </label>
                    <div className="contact-field">
                      <User size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                      <input
                        id="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="contact-input contact-input--icon"
                        placeholder="Jean Dupont"
                      />
                    </div>
                  </div>
                  <div className="contact-field-wrap">
                    <label htmlFor="email" className="contact-label">
                      Email <span className="contact-required">*</span>
                    </label>
                    <div className="contact-field">
                      <Mail size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="contact-input contact-input--icon"
                        placeholder="vous@email.com"
                      />
                    </div>
                  </div>
                  <div className="contact-field-wrap">
                    <label htmlFor="phone" className="contact-label">Téléphone</label>
                    <div className="contact-field">
                      <Phone size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="contact-input contact-input--icon"
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>
                  <div className="contact-field-wrap">
                    <label htmlFor="company" className="contact-label">Entreprise ou activité</label>
                    <div className="contact-field">
                      <Building2 size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                      <input
                        id="company"
                        type="text"
                        autoComplete="organization"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="contact-input contact-input--icon"
                        placeholder="Nom de votre activité"
                      />
                    </div>
                  </div>
                  <div className="contact-field-wrap sm:col-span-2">
                    <label htmlFor="siret" className="contact-label">
                      Numéro SIREN ou SIRET
                      {companyProvided && <span className="contact-required">*</span>}
                    </label>
                    <div className="contact-field">
                      <Hash size={16} strokeWidth={1.75} className="contact-field-icon" aria-hidden="true" />
                      <input
                        id="siret"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        required={companyProvided}
                        value={form.siret}
                        onChange={(e) => {
                          setSiretError('')
                          setForm({ ...form, siret: formatSiretDisplay(e.target.value) })
                        }}
                        className={`contact-input contact-input--icon ${siretError ? 'contact-input--error' : ''}`}
                        placeholder="123 456 789 ou 123 456 789 00012"
                        aria-invalid={siretError ? true : undefined}
                        aria-describedby="siret-help"
                      />
                    </div>
                    <p id="siret-help" className="contact-helper mt-2">
                      SIREN : 9 chiffres (entreprise). SIRET : 14 chiffres (établissement). Obligatoire si vous
                      indiquez une entreprise.
                    </p>
                    {siretError && (
                      <p className="contact-field-error" role="alert">
                        {siretError}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>

              <fieldset className="contact-block">
                <legend className="contact-block-title">Votre situation</legend>
                <div
                  role="radiogroup"
                  aria-label="Votre situation"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  {situations.map((s) => {
                    const Icon = s.icon
                    const active = form.situation === s.value
                    return (
                      <button
                        key={s.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setForm({ ...form, situation: s.value })}
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
                <ul className="contact-chip-list">
                  {needOptions.map((need) => {
                    const selected = form.needs.includes(need)
                    return (
                      <li key={need}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setForm({ ...form, needs: toggleItem(form.needs, need) })
                          }
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
                  {objectiveOptions.map((objective) => {
                    const selected = form.objectives.includes(objective)
                    return (
                      <li key={objective}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setForm({
                              ...form,
                              objectives: toggleItem(form.objectives, objective),
                            })
                          }
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
                      <label htmlFor="website" className="contact-label">
                        Adresse de votre site actuel
                      </label>
                      <input
                        id="website"
                        type="url"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        className="contact-input"
                        placeholder="https://votre-site.com"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <label htmlFor="message" className="contact-label">
                  {form.situation === 'unknown' ? 'Parlez-nous de votre activité' : 'Décrivez votre projet'}
                  {messageRequired && <span className="contact-required">*</span>}
                </label>
                <textarea
                  id="message"
                  rows={6}
                  required={messageRequired}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="contact-input contact-textarea"
                  placeholder={messagePlaceholder}
                />
                <ul className="contact-hints mt-3 space-y-1">
                  <li>Contexte et activité</li>
                  <li>Fonctionnalités souhaitées</li>
                  <li>Exemples ou sites que vous aimez</li>
                </ul>
              </fieldset>

              <button type="submit" className="btn-primary w-full inline-flex items-center justify-center gap-2">
                <CtaIcon size={18} />
                Demander ma maquette gratuite
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
