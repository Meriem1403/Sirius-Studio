import { useMemo, useState } from 'react'
import { CalendarPlus, Download, ExternalLink, Trash2 } from 'lucide-react'
import type { Appointment, User } from '../../lib/auth/types'
import { useWorkspace } from '../../context/WorkspaceContext'
import {
  APPOINTMENT_TYPE_LABELS,
  createAppointment,
  deleteAppointment,
} from '../../lib/services/appointmentService'
import { getAllProjects, getClientAccount } from '../../lib/services/projectService'
import { downloadIcs, openGoogleCalendar } from '../../lib/calendar/export'
import { formatDateTime } from '../../lib/client/format'

interface AgendaViewProps {
  user: User
  isAdmin?: boolean
  onChange?: () => void
}

export default function AgendaView({ user, isAdmin, onChange }: AgendaViewProps) {
  const { appointments: allAppointments } = useWorkspace()
  const [monthOffset, setMonthOffset] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    userId: '',
    projectId: '',
    location: 'Visio',
    meetingUrl: '',
    type: 'review' as Appointment['type'],
  })

  const appointments = useMemo(() => {
    const list = isAdmin
      ? allAppointments
      : allAppointments.filter((a) => a.userId === user.id)
    return [...list].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
  }, [allAppointments, isAdmin, user.id])
  const projects = getAllProjects().filter((p) => p.userId !== 'fixture-admin-1')
  const clients = projects.reduce<{ id: string; name: string }[]>((acc, p) => {
    const c = getClientAccount(p.userId)
    if (c && !acc.some((x) => x.id === c.id)) acc.push({ id: c.id, name: c.name })
    return acc
  }, [])

  const viewDate = useMemo(() => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() + monthOffset)
    return d
  }, [monthOffset])

  const monthLabel = viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const firstWeekday = (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() + 6) % 7

  const apptsByDay = useMemo(() => {
    const map = new Map<number, Appointment[]>()
    for (const a of appointments) {
      const d = new Date(a.startAt)
      if (d.getFullYear() === viewDate.getFullYear() && d.getMonth() === viewDate.getMonth()) {
        const day = d.getDate()
        if (!map.has(day)) map.set(day, [])
        map.get(day)!.push(a)
      }
    }
    return map
  }, [appointments, viewDate])

  const selected = selectedId ? appointments.find((a) => a.id === selectedId) : null

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.startAt || !form.endAt) return
    if (isAdmin && !form.userId) {
      setFormError('Sélectionnez un client.')
      return
    }
    const appt = createAppointment({
      title: form.title,
      description: form.description,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      userId: isAdmin ? form.userId : user.id,
      projectId: form.projectId || undefined,
      location: form.location,
      meetingUrl: form.meetingUrl,
      type: form.type,
      createdBy: user.id,
    })
    if (!appt) {
      setFormError('La date de fin doit être postérieure à la date de début.')
      return
    }
    setFormError(null)
    onChange?.()
    setSelectedId(appt.id)
    setShowForm(false)
    setForm({
      title: '',
      description: '',
      startAt: '',
      endAt: '',
      userId: '',
      projectId: '',
      location: 'Visio',
      meetingUrl: '',
      type: 'review',
    })
  }

  return (
    <div className="agenda-layout">
      <div className="agenda-calendar workspace-panel">
        <div className="agenda-calendar-head">
          <button type="button" className="btn-secondary agenda-nav-btn" onClick={() => setMonthOffset((m) => m - 1)} aria-label="Mois précédent">‹</button>
          <h2 className="agenda-month-title">{monthLabel}</h2>
          <button type="button" className="btn-secondary agenda-nav-btn" onClick={() => setMonthOffset((m) => m + 1)} aria-label="Mois suivant">›</button>
        </div>
        <div className="agenda-weekdays" aria-hidden="true">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="agenda-grid">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="agenda-cell agenda-cell--empty" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayAppts = apptsByDay.get(day) ?? []
            const isToday =
              day === new Date().getDate() &&
              viewDate.getMonth() === new Date().getMonth() &&
              viewDate.getFullYear() === new Date().getFullYear()
            return (
              <button
                key={day}
                type="button"
                className={`agenda-cell ${isToday ? 'agenda-cell--today' : ''} ${dayAppts.length ? 'agenda-cell--has-event' : ''}`}
                onClick={() => dayAppts[0] && setSelectedId(dayAppts[0].id)}
              >
                <span className="agenda-day-num">{day}</span>
                {dayAppts.length > 0 && (
                  <span className="agenda-day-dots">
                    {dayAppts.slice(0, 3).map((a) => (
                      <span key={a.id} className="agenda-dot" title={a.title} />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <aside className="agenda-side">
        {isAdmin && (
          <button type="button" className="btn-primary w-full" onClick={() => setShowForm((v) => !v)}>
            <CalendarPlus size={16} /> Nouveau rendez-vous
          </button>
        )}

        {showForm && isAdmin && (
          <form className="agenda-form workspace-panel" onSubmit={handleCreate}>
            <h3 className="billing-section-title">Planifier un RDV</h3>
            {formError && <p className="client-alert-desc text-red-300">{formError}</p>}
            <label className="billing-field">
              <span className="billing-field-label">Titre</span>
              <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="billing-field">
              <span className="billing-field-label">Client</span>
              <select className="admin-input" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required>
                <option value="">Choisir…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="billing-field">
              <span className="billing-field-label">Projet</span>
              <select className="admin-input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">—</option>
                {projects.filter((p) => !form.userId || p.userId === form.userId).map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </label>
            <label className="billing-field">
              <span className="billing-field-label">Type</span>
              <select className="admin-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Appointment['type'] })}>
                {Object.entries(APPOINTMENT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <div className="agenda-form-row">
              <label className="billing-field">
                <span className="billing-field-label">Début</span>
                <input type="datetime-local" className="admin-input" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} required />
              </label>
              <label className="billing-field">
                <span className="billing-field-label">Fin</span>
                <input type="datetime-local" className="admin-input" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} required />
              </label>
            </div>
            <label className="billing-field">
              <span className="billing-field-label">Lieu / visio</span>
              <input className="admin-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </label>
            <label className="billing-field">
              <span className="billing-field-label">Lien meeting</span>
              <input type="url" className="admin-input" value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} placeholder="https://…" />
            </label>
            <label className="billing-field">
              <span className="billing-field-label">Notes</span>
              <textarea className="admin-input agenda-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </label>
            <div className="billing-action-row">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" className="btn-primary">Enregistrer</button>
            </div>
          </form>
        )}

        <div className="agenda-list workspace-panel">
          <h3 className="billing-section-title">Prochains rendez-vous</h3>
          {appointments.filter((a) => new Date(a.endAt).getTime() >= Date.now()).length === 0 ? (
            <p className="client-muted">Aucun rendez-vous à venir.</p>
          ) : (
            <ul className="agenda-event-list">
              {appointments
                .filter((a) => new Date(a.endAt).getTime() >= Date.now())
                .slice(0, 8)
                .map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      className={`agenda-event-card ${selectedId === a.id ? 'agenda-event-card--active' : ''}`}
                      onClick={() => setSelectedId(a.id)}
                    >
                      <p className="agenda-event-title">{a.title}</p>
                      <p className="client-message-hint">{formatDateTime(a.startAt)}</p>
                      {isAdmin && <p className="client-message-hint">{a.clientName}</p>}
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {selected && (
          <div className="agenda-detail workspace-panel">
            <p className="client-page-eyebrow">{APPOINTMENT_TYPE_LABELS[selected.type]}</p>
            <h3 className="client-section-title">{selected.title}</h3>
            <p className="client-message-hint">{formatDateTime(selected.startAt)} → {formatDateTime(selected.endAt)}</p>
            {selected.projectTitle && <p className="client-message-hint">{selected.projectTitle}</p>}
            {selected.description && <p className="client-detail-desc mt-2">{selected.description}</p>}
            {selected.meetingUrl && (
              <a href={selected.meetingUrl} target="_blank" rel="noopener noreferrer" className="client-link mt-2 inline-flex">
                Rejoindre la visio <ExternalLink size={14} />
              </a>
            )}
            <div className="billing-action-row mt-4">
              <button type="button" className="btn-secondary" onClick={() => openGoogleCalendar(selected)}>
                Google Calendar
              </button>
              <button type="button" className="btn-secondary" onClick={() => downloadIcs(selected)}>
                <Download size={14} /> Apple / Mac (.ics)
              </button>
              {isAdmin && (
                <button type="button" className="btn-secondary" onClick={() => { deleteAppointment(selected.id); setSelectedId(null); onChange?.() }}>
                  <Trash2 size={14} /> Supprimer
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
