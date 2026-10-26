export type MaquetteSituation = 'existing' | 'idea' | 'unknown'

export const MAQUETTE_SITUATIONS = [
  {
    value: 'existing' as const,
    label: "J'ai déjà un site",
    hint: 'Refonte ou modernisation',
  },
  {
    value: 'idea' as const,
    label: "J'ai une idée ou des besoins",
    hint: 'Projet à cadrer ensemble',
  },
  {
    value: 'unknown' as const,
    label: 'Je ne sais pas encore',
    hint: 'Sirius vous oriente',
  },
]

export const MAQUETTE_NEED_OPTIONS = [
  'Site vitrine',
  'E-commerce',
  'Application mobile',
  'Logiciel sur mesure',
  'Refonte complète',
] as const

export const MAQUETTE_OBJECTIVE_OPTIONS = [
  'Gagner en visibilité',
  'Convertir plus de clients',
  'Moderniser mon image',
  'Lancer un nouveau projet',
] as const

export type MaquetteNeed = (typeof MAQUETTE_NEED_OPTIONS)[number]
export type MaquetteObjective = (typeof MAQUETTE_OBJECTIVE_OPTIONS)[number]

/** État du formulaire maquette (identique à l’ancien Contact). */
export type MaquetteFormValues = {
  name: string
  email: string
  phone: string
  company: string
  siret: string
  situation: MaquetteSituation
  website: string
  needs: MaquetteNeed[]
  objectives: MaquetteObjective[]
  message: string
}

export function emptyMaquetteForm(): MaquetteFormValues {
  return {
    name: '',
    email: '',
    phone: '',
    company: '',
    siret: '',
    situation: 'idea',
    website: '',
    needs: [],
    objectives: [],
    message: '',
  }
}

export function emptyMaquetteBrief(): Pick<
  MaquetteFormValues,
  'situation' | 'website' | 'needs' | 'objectives' | 'message'
> {
  const f = emptyMaquetteForm()
  return {
    situation: f.situation,
    website: f.website,
    needs: f.needs,
    objectives: f.objectives,
    message: f.message,
  }
}

export function toggleMaquetteItem<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

export function normalizeSiretInput(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidSirenOrSiret(value: string): boolean {
  const digits = normalizeSiretInput(value)
  return digits.length === 9 || digits.length === 14
}

export function formatSiretDisplay(value: string): string {
  const digits = normalizeSiretInput(value).slice(0, 14)
  if (digits.length <= 9) {
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
  }
  const siren = digits.slice(0, 9)
  const nic = digits.slice(9)
  return `${siren.replace(/(\d{3})(?=\d)/g, '$1 ').trim()} ${nic}`.trim()
}

export function maquetteMessagePlaceholder(situation: MaquetteSituation): string {
  if (situation === 'existing') {
    return "Qu'est-ce qui ne fonctionne pas aujourd'hui ? Quels résultats attendez-vous de la refonte ?"
  }
  if (situation === 'idea') {
    return 'Décrivez votre idée, vos fonctionnalités clés, votre public et vos inspirations.'
  }
  return 'Présentez votre activité en quelques lignes. Sirius vous proposera une direction claire.'
}

export function isMaquetteMessageRequired(situation: MaquetteSituation): boolean {
  return situation !== 'unknown'
}

export function deriveProjectTitle(form: Pick<MaquetteFormValues, 'needs' | 'company'>): string {
  const need = form.needs[0] ?? 'Projet web'
  const co = form.company?.trim()
  return co ? `${need} — ${co}` : need
}

export function deriveProjectType(form: Pick<MaquetteFormValues, 'needs'>): string {
  return form.needs[0] ?? 'Site vitrine'
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateMaquetteProjectFields(
  form: Pick<MaquetteFormValues, 'situation' | 'needs' | 'message'>,
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (form.needs.length === 0) errors.needs = 'Sélectionnez au moins un besoin.'
  if (isMaquetteMessageRequired(form.situation) && form.message.trim().length < 10) {
    errors.message = 'Décrivez votre besoin (10 caractères minimum).'
  }
  return errors
}

export function validateMaquetteSignupForm(
  form: MaquetteFormValues,
  opts: {
    password: string
    confirmPassword: string
    terms: boolean
  },
): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!form.name.trim()) errors.name = 'Nom requis'
  if (!form.email.trim()) errors.email = 'Email requis'
  else if (!validateEmail(form.email)) errors.email = 'Email invalide'

  const companyProvided = form.company.trim().length > 0
  if (companyProvided && !isValidSirenOrSiret(form.siret)) {
    errors.siret = 'Indiquez un SIREN (9 chiffres) ou un SIRET (14 chiffres) valide.'
  }

  if (!opts.password) errors.password = 'Mot de passe requis'
  else if (opts.password.length < 8) errors.password = '8 caractères minimum'
  if (opts.password !== opts.confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas'
  if (!opts.terms) errors.terms = 'Vous devez accepter les conditions'

  Object.assign(errors, validateMaquetteProjectFields(form))
  return errors
}

export type MaquetteBriefPayload = {
  title: string
  type: string
  message: string
  needs: string[]
  situation: MaquetteSituation
  website?: string
  objectives?: string[]
}

export function toMaquetteBriefPayload(form: MaquetteFormValues): MaquetteBriefPayload {
  const message = form.message.trim()
  const needs = [...form.needs]
  const objectives = form.objectives.length ? [...form.objectives] : undefined
  return {
    title: deriveProjectTitle(form),
    type: deriveProjectType(form),
    message: message || '(Le client souhaite être orienté par Sirius.)',
    needs,
    situation: form.situation,
    website: form.website.trim() || undefined,
    objectives,
  }
}

/** @deprecated alias */
export type MaquetteBriefValues = Pick<
  MaquetteFormValues,
  'situation' | 'website' | 'needs' | 'objectives' | 'message' | 'company'
> & { projectTitle?: string; projectMessage?: string }

export function validateMaquetteBrief(brief: MaquetteBriefValues): Record<string, string> {
  return validateMaquetteProjectFields({
    situation: brief.situation,
    needs: brief.needs,
    message: brief.projectMessage ?? brief.message ?? '',
  })
}

export function toMaquetteBriefPayloadLegacy(
  brief: MaquetteBriefValues,
  company?: string,
): MaquetteBriefPayload {
  return toMaquetteBriefPayload({
    ...emptyMaquetteForm(),
    company: company ?? '',
    situation: brief.situation,
    website: brief.website,
    needs: brief.needs,
    objectives: brief.objectives,
    message: brief.projectMessage ?? brief.message ?? '',
  })
}
