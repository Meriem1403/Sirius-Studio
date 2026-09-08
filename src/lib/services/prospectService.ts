import type { Prospect, ProspectStatus } from '../auth/types'
import { getProspects, saveProspects, uid } from '../data/store'
import { FIXTURE_PROSPECTS } from '../../fixtures/prospects'

export function getAllProspects() {
  return getProspects().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getProspectsBySource(source: Prospect['source']) {
  return getAllProspects().filter((p) => p.source === source)
}

export function getProspectsByStatus(status: ProspectStatus) {
  return getAllProspects().filter((p) => p.status === status)
}

export function addManualProspect(input: Omit<Prospect, 'id' | 'source' | 'createdAt' | 'score'> & { score?: number }) {
  const prospect: Prospect = {
    id: uid('prosp'),
    source: 'manual',
    score: input.score ?? 70,
    createdAt: new Date().toISOString(),
    name: input.name.trim(),
    company: input.company.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim(),
    sector: input.sector.trim(),
    status: input.status ?? 'new',
    notes: input.notes?.trim(),
  }
  const prospects = getProspects()
  prospects.unshift(prospect)
  saveProspects(prospects)
  return prospect
}

export function updateProspectStatus(prospectId: string, status: ProspectStatus) {
  const prospects = getProspects()
  const index = prospects.findIndex((p) => p.id === prospectId)
  if (index === -1) return null
  prospects[index] = {
    ...prospects[index],
    status,
    lastContactAt: new Date().toISOString(),
  }
  saveProspects(prospects)
  return prospects[index]
}

export function prospectStats() {
  const all = getAllProspects()
  return {
    total: all.length,
    auto: all.filter((p) => p.source === 'auto').length,
    manual: all.filter((p) => p.source === 'manual').length,
    new: all.filter((p) => p.status === 'new').length,
    qualified: all.filter((p) => p.status === 'qualified').length,
    converted: all.filter((p) => p.status === 'converted').length,
    avgScore: all.length ? Math.round(all.reduce((s, p) => s + p.score, 0) / all.length) : 0,
  }
}

export function seedProspectsIfEmpty() {
  if (getProspects().length === 0) {
    saveProspects(FIXTURE_PROSPECTS)
  }
}
