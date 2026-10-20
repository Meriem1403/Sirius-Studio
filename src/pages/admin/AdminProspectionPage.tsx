import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bot, Hand, Plus, Target, Zap } from 'lucide-react'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import ProspectCard from '../../components/admin/ProspectCard'
import {
  addManualProspect,
  getAllProspects,
  prospectStats,
  updateProspectStatus,
} from '../../lib/services/prospectService'
import { PROSPECT_STATUS_LABELS } from '../../fixtures/prospects'
import type { Prospect, ProspectStatus } from '../../lib/auth/types'
import { isApiMode } from '../../lib/api/config'
import { createProspectApi, fetchProspects, updateProspectApi } from '../../lib/api/prospects'
import { syncWorkspace } from '../../lib/api/workspaceSync'
import { useWorkspace } from '../../context/WorkspaceContext'

type Tab = 'all' | 'auto' | 'manual'

export default function AdminProspectionPage() {
  const { projects } = useWorkspace()
  const [tab, setTab] = useState<Tab>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', sector: '', notes: '' })
  const [all, setAll] = useState<Prospect[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (isApiMode()) {
      ;(async () => {
        const list = await fetchProspects()
        setAll(list)
        await syncWorkspace()
      })().catch(() => setFeedback('Impossible de charger les prospects.'))
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

    setFeedback(null)
    if (isApiMode()) {
      await createProspectApi({
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone.trim() || undefined,
        sector: form.sector || 'Non renseigné',
        notes: form.notes,
      })
    } else {
      addManualProspect({
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone.trim() || undefined,
        sector: form.sector || 'Non renseigné',
        notes: form.notes,
        status: 'new',
      })
    }

    setForm({ name: '', company: '', email: '', phone: '', sector: '', notes: '' })
    setShowForm(false)
    setFeedback('Prospect enregistré.')
    reload()
  }

  async function handleStatus(id: string, status: ProspectStatus) {
    setFeedback(null)
    setBusyId(id)
    try {
      if (isApiMode()) {
        const updated = await updateProspectApi(id, { status })
        setAll((prev) => prev.map((p) => (p.id === id ? updated : p)))
        await syncWorkspace()
      } else {
        const updated = updateProspectStatus(id, status)
        if (updated) setAll(getAllProspects())
      }
      setFeedback(`Statut mis à jour : ${PROSPECT_STATUS_LABELS[status]}.`)
    } catch {
      setFeedback('Échec de la mise à jour du statut.')
      reload()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <WorkspacePageHeader
        variant="admin"
        eyebrow="Commercial"
        title="Prospection"
        subtitle="Leads du site et saisie manuelle — contact, statut et détail de la demande."
        icon={Target}
        action={
          <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => setShowForm((v) => !v)}>
            <Plus size={16} />
            Ajouter un prospect
          </button>
        }
      />

      {feedback && (
        <p className="client-message-hint mb-4" role="status">
          {feedback}
        </p>
      )}

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
            <input className="admin-input" placeholder="Nom *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="admin-input" placeholder="Entreprise *" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input className="admin-input" type="email" placeholder="Email *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="admin-input" type="tel" placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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

      {filtered.length === 0 ? (
        <p className="client-muted client-section">Aucun prospect pour ce filtre.</p>
      ) : (
        <ul className="prospect-list">
          {filtered.map((p) => (
            <ProspectCard
              key={p.id}
              prospect={p}
              busy={busyId === p.id}
              linkedProjectId={projects.find((pr) => pr.userId === p.convertedUserId)?.id}
              onStatusChange={handleStatus}
              onConverted={() => {
                reload()
                if (isApiMode()) void syncWorkspace()
              }}
            />
          ))}
        </ul>
      )}
    </>
  )
}
