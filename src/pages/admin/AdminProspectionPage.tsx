import { useState } from 'react'
import { Bot, Hand, Plus, Target, Zap } from 'lucide-react'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import {
  addManualProspect,
  getAllProspects,
  getProspectsBySource,
  prospectStats,
  updateProspectStatus,
} from '../../lib/services/prospectService'
import {
  PROSPECT_SOURCE_LABELS,
  PROSPECT_STATUS_LABELS,
} from '../../fixtures/prospects'
import type { ProspectStatus } from '../../lib/auth/types'
import { useWorkspace } from '../../context/WorkspaceContext'
import { formatDateTime } from '../../lib/client/format'

type Tab = 'all' | 'auto' | 'manual'

export default function AdminProspectionPage() {
  const { refresh } = useWorkspace()
  const [tab, setTab] = useState<Tab>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', sector: '', notes: '' })

  const stats = prospectStats()
  const all = getAllProspects()
  const filtered =
    tab === 'all' ? all : tab === 'auto' ? getProspectsBySource('auto') : getProspectsBySource('manual')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) return
    addManualProspect({
      name: form.name,
      company: form.company,
      email: form.email,
      sector: form.sector || 'Non renseigné',
      notes: form.notes,
      status: 'new',
    })
    setForm({ name: '', company: '', email: '', sector: '', notes: '' })
    setShowForm(false)
    refresh()
  }

  function handleStatus(id: string, status: ProspectStatus) {
    updateProspectStatus(id, status)
    refresh()
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

      <div className="prospect-pipeline">
        {(['new', 'contacted', 'qualified', 'converted', 'lost'] as ProspectStatus[]).map((status) => {
          const count = all.filter((p) => p.status === status).length
          return (
            <div key={status} className={`prospect-pipeline-col prospect-pipeline-col--${status}`}>
              <span className="prospect-pipeline-label">{PROSPECT_STATUS_LABELS[status]}</span>
              <span className="prospect-pipeline-count">{count}</span>
            </div>
          )
        })}
      </div>

      <div className="client-filter-row">
        {(['all', 'auto', 'manual'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`client-filter-chip ${tab === t ? 'client-filter-chip--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'all' ? 'Tous' : t === 'auto' ? 'Automatiques' : 'Manuels'}
          </button>
        ))}
      </div>

      <ul className="prospect-list">
        {filtered.map((p) => (
          <li key={p.id} className="prospect-card">
            <div className="prospect-card-main">
              <div className="prospect-card-top">
                <div>
                  <h3 className="prospect-name">{p.name}</h3>
                  <p className="prospect-company">{p.company} · {p.sector}</p>
                  <p className="prospect-email">{p.email}</p>
                </div>
                <div className="prospect-badges">
                  <span className={`prospect-source prospect-source--${p.source}`}>
                    {p.source === 'auto' ? <Bot size={12} /> : <Hand size={12} />}
                    {PROSPECT_SOURCE_LABELS[p.source]}
                  </span>
                  <span className="prospect-score">{p.score}</span>
                </div>
              </div>
              {p.notes && <p className="prospect-notes">{p.notes}</p>}
              <p className="prospect-date">
                Créé le {formatDateTime(p.createdAt)}
                {p.lastContactAt && ` · Dernier contact ${formatDateTime(p.lastContactAt)}`}
              </p>
            </div>
            <div className="prospect-actions">
              <span className={`prospect-status prospect-status--${p.status}`}>
                {PROSPECT_STATUS_LABELS[p.status]}
              </span>
              {p.status !== 'converted' && p.status !== 'lost' && (
                <select
                  className="prospect-status-select"
                  value={p.status}
                  onChange={(e) => handleStatus(p.id, e.target.value as ProspectStatus)}
                >
                  {Object.entries(PROSPECT_STATUS_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
