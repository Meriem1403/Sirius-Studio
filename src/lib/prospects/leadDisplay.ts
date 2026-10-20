import type { ContactLeadPayload } from '../auth/types'

const SITUATION_LABELS: Record<NonNullable<ContactLeadPayload['situation']>, string> = {
  existing: "J'ai déjà un site",
  idea: "J'ai une idée ou des besoins",
  unknown: 'Je ne sais pas encore',
}

export interface LeadDisplay {
  message?: string
  situation?: string
  needs: string[]
  objectives: string[]
  website?: string
  siret?: string
}

export function leadFromPayload(lead?: ContactLeadPayload): LeadDisplay | null {
  if (!lead) return null
  return {
    message: lead.message?.trim() || undefined,
    situation: lead.situation ? SITUATION_LABELS[lead.situation] : undefined,
    needs: lead.needs ?? [],
    objectives: lead.objectives ?? [],
    website: lead.website?.trim() || undefined,
    siret: lead.siret?.trim() || undefined,
  }
}

/** Anciens leads : notes concaténées côté API avant correction. */
export function leadFromLegacyNotes(notes?: string): LeadDisplay | null {
  if (!notes?.trim()) return null
  const text = notes.trim()
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length <= 1 && !text.includes('Situation :') && !text.includes('Besoins :')) {
    return { message: text, needs: [], objectives: [] }
  }

  const out: LeadDisplay = { needs: [], objectives: [] }
  for (const line of lines) {
    if (line.startsWith('Situation :')) {
      const raw = line.replace('Situation :', '').trim()
      out.situation =
        raw === 'existing'
          ? SITUATION_LABELS.existing
          : raw === 'idea'
            ? SITUATION_LABELS.idea
            : raw === 'unknown'
              ? SITUATION_LABELS.unknown
              : raw
    } else if (line.startsWith('Besoins :')) {
      out.needs = line.replace('Besoins :', '').split(',').map((s) => s.trim()).filter(Boolean)
    } else if (line.startsWith('Objectifs :')) {
      out.objectives = line.replace('Objectifs :', '').split(',').map((s) => s.trim()).filter(Boolean)
    } else if (line.startsWith('Site actuel :')) {
      out.website = line.replace('Site actuel :', '').trim()
    } else if (!out.message) {
      out.message = line
    } else {
      out.message += `\n${line}`
    }
  }
  return out
}

export function resolveLeadDisplay(prospect: {
  notes?: string
  lead?: ContactLeadPayload
}): LeadDisplay | null {
  return leadFromPayload(prospect.lead) ?? leadFromLegacyNotes(prospect.notes)
}

export function formatPhoneForTel(phone: string) {
  return phone.replace(/[^\d+]/g, '')
}
