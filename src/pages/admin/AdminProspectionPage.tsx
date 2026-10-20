import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bot, Hand, Plus, Target, Zap } from 'lucide-react'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import {
  addManualProspect,
  getAllProspects,
  prospectStats,
  updateProspectStatus,
} from '../../lib/services/prospectService'
import {
  PROSPECT_SOURCE_LABELS,
  PROSPECT_STATUS_LABELS,
} from '../../fixtures/prospects'
import type { Prospect, ProspectStatus } from '../../lib/auth/types'
import { formatDateTime } from '../../lib/client/format'
import { isApiMode } from '../../lib/api/config'
import { createProspectApi, fetchProspects, updateProspectApi } from '../../lib/api/prospects'
import { syncWorkspace } from '../../lib/api/workspaceSync'

type Tab = 'all' | 'auto' | 'manual'

export default function AdminProspectionPage() {
  const [tab, setTab] = useState<Tab>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', sector: '', notes: '' })
  const [all, setAll] = useState<Prospect[]>([])
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (isApiMode()) {
      ;(async () => {
        const list = await fetchProspects()
        setAll(list)
        await syncWorkspace()
      })().catch(console.error)
    } else {
      setAll(getAllProspects())
    }
  }, [reloadKey])

  const stats = useMemo(() => {
    if (!isApiMode()) return prospectStats()
    return {
      total: all.length,
      auto: all.filter((p) => p.source === 'auto').length,
      manual: all.filter((p) => p.source === 'manual').length,
      new: all.filter((p) => p.status === 'new').length,
      qualified: all.filter((p) => p.status === 'qualified').length,
      converted: all.filter((p) => p.status === 'converted').length,
      avgScore: all.length ? Math.round(all.reduce((s, p) => s + p.score, 0) / all.length) : 0,
    }
  }, [all])

  const filtered =
    tab === 'all' ? all : tab === 'auto' ? all.filter((p) => p.source === 'auto') : all.filter((p) => p.source === 'manual')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) return

    if (isApiMode()) {
      await createProspectApi({
        name: form.name,
        company: form.company,
        email: form.email,
        sector: form.sector || 'Non renseigné',
        notes: form.notes,
      })
    } else {
      addManualProspect({
        name: form.name,
        company: form.company,
        email: form.email,
        sector: form.sector || 'Non renseigné',
        notes: form.notes,
        status: 'new',
      })
    }

    setForm({ name: '', company: '', email: '', sector: '', notes: '' })
    setShowForm(false)
    reload()
  }

  async function handleStatus(id: string, status: ProspectStatus) {
    if (isApiMode()) {
      await updateProspectApi(id, { status })
    } else {
      updateProspectStatus(id, status)
    }
    reload()
  }

  return (
    <>
      <WorkspacePageHeader
        variant="admin"
        eyebrow="Commercial"
        title="Prospection"
        subtitle="Leads automatiques du site et prospects saisis manuellement, avec scoring et suivi de statut."
        icon={Target}
        action={
          <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => setShowForm((v) => !v)}>
            <Plus size={16} />
            Ajouter un prospect
          </button>
        }
      />

      <div className="client-stats">
        <div className="client-stat-card workspace-stat-card">
          <div className="client-stat-icon client-stat-icon--violet"><Target size={20} /></div>
          <div><p className="client-stat-value">{stats.total}</p><p className="client-stat-label">Total prospects</p></div>
        </div>
        <div className="client-stat-card workspace-stat-card">
          <div className="client-stat-icon client-stat-icon--cyan"><Bot size={20} /></div>
          <div><p className="client-stat-value">{stats.auto}</p><p className="client-stat-label">Automatiques</p></div>
        </div>
        <div className="client-stat-card workspace-stat-card">
          <div className="client-stat-icon client-stat-icon--amber"><Hand size={20} /></div>
          <div><p className="client-stat-value">{stats.manual}</p><p className="client-stat-label">Manuels</p></div>
        </div>
        <div className="client-stat-card workspace-stat-card">
          <div className="client-stat-icon client-stat-icon--green"><Zap size={20} /></div>
          <div><p className="client-stat-value">{stats.avgScore}</p><p className="client-stat-label">Score moyen</p></div>
        </div>
      </div>

      {showForm && (
        <form className="prospect-form client-detail-panel client-section" onSubmit={handleAdd}>
          <h2 className="client-section-title mb-4">Nouveau prospect manuel</h2>
          <div className="prospect-form-grid">
            <input className="admin-input" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="admin-input" placeholder="Entreprise" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input className="admin-input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="admin-input" placeholder="Secteur" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />
          </div>
          <textarea className="client-message-input mt-3" placeholder="Notes (optionnel)" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 mt-3">
            <button type="submit" className="btn-primary">Enregistrer</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      <div className="client-filter-row">
        {(['all', 'auto', 'manual'] as Tab[]).map((t) => (
          <button key={t} type="button" className={`client-filter-chip ${tab === t ? 'client-filter-chip--active' : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? 'Tous' : t === 'auto' ? 'Automatiques' : 'Manuels'}
          </button>
        ))}
      </div>

      <ul className="prospect-list">
        {filtered.map((p) => (
          <li key={p.id} className="prospect-card">
            <div className="prospect-card-top">
              <div>
                <p className="prospect-name">{p.name}</p>
                <p className="prospect-company">{p.company}</p>
                <p className="prospect-email">{p.email}</p>
              </div>
              <span className="prospect-score">{p.score}</span>
            </div>
            <div className="prospect-meta">
              <span>{PROSPECT_SOURCE_LABELS[p.source]}</span>
              <span>{PROSPECT_STATUS_LABELS[p.status]}</span>
              <span>{formatDateTime(p.createdAt)}</span>
            </div>
            {p.notes && <p className="prospect-notes">{p.notes}</p>}
            <div className="prospect-actions">
              {(['contacted', 'qualified', 'converted', 'lost'] as ProspectStatus[]).map((status) => (
                <button key={status} type="button" className="btn-secondary prospect-status-btn" onClick={() => handleStatus(p.id, status)}>
                  {PROSPECT_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
