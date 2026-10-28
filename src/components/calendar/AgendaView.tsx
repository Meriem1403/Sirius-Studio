import { useEffect, useMemo, useState } from 'react'
import { CalendarPlus, ChevronLeft, ChevronRight, ExternalLink, Trash2 } from 'lucide-react'
import type { Appointment, User } from '../../lib/auth/types'
import { useWorkspace } from '../../context/WorkspaceContext'
import {
  APPOINTMENT_TYPE_LABELS,
  createAppointment,
  deleteAppointment,
  setAppointmentStatus,
} from '../../lib/services/appointmentService'
import { getAllProjects, getClientAccount } from '../../lib/services/projectService'
import { addToSystemCalendar } from '../../lib/calendar/export'
import { formatDateTime } from '../../lib/client/format'
import { flushWorkspacePersist } from '../../lib/data/store'
import { isApiMode } from '../../lib/api/config'
import { fetchClients, type ClientAccount } from '../../lib/api/clients'
import {
  defaultAppointmentEndLocal,
  defaultAppointmentStartLocal,
  localDatetimeToIso,
} from '../../lib/calendar/formDefaults'

export interface AgendaPlanPrefill {
  userId?: string
  projectId?: string
  openForm?: boolean
  title?: string
}

interface AgendaViewProps {
  user: User
  isAdmin?: boolean
  onChange?: () => void
  planPrefill?: AgendaPlanPrefill
}

export default function AgendaView({ user, isAdmin, onChange, planPrefill }: AgendaViewProps) {
  const { appointments: allAppointments, projects: workspaceProjects } = useWorkspace()
  const [apiClients, setApiClients] = useState<ClientAccount[]>([])
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate())
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: planPrefill?.title ?? '',
    description: '',
    startAt: defaultAppointmentStartLocal(),
    endAt: defaultAppointmentEndLocal(),
    userId: planPrefill?.userId ?? '',
    projectId: planPrefill?.projectId ?? '',
    location: 'Visio',
    meetingUrl: '',
    type: 'discovery' as Appointment['type'],
  })
  const [showForm, setShowForm] = useState(Boolean(planPrefill?.openForm))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAdmin || !isApiMode()) return
    fetchClients()
      .then(setApiClients)
      .catch(() => setApiClients([]))
  }, [isAdmin])

  useEffect(() => {
    if (!planPrefill) return
    if (planPrefill.userId || planPrefill.projectId || planPrefill.title) {
      setForm((f) => ({
        ...f,
        userId: planPrefill.userId ?? f.userId,
        projectId: planPrefill.projectId ?? f.projectId,
        title: planPrefill.title ?? f.title,
      }))
    }
    if (planPrefill.openForm) setShowForm(true)
  }, [planPrefill])

  const appointments = useMemo(() => {
    const list = isAdmin
      ? allAppointments
      : allAppointments.filter((a) => a.userId === user.id)
    return [...list].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
  }, [allAppointments, isAdmin, user.id])
  const projects = isApiMode() ? workspaceProjects.filter((p) => p.userId !== 'fixture-admin-1') : getAllProjects().filter((p) => p.userId !== 'fixture-admin-1')
  const clients = useMemo(() => {
    if (isApiMode() && apiClients.length > 0) {
      return apiClients.map((c) => ({ id: c.id, name: c.company ? `${c.name} · ${c.company}` : c.name }))
    }
    return projects.reduce<{ id: string; name: string }[]>((acc, p) => {
      const c = getClientAccount(p.userId)
      if (c && !acc.some((x) => x.id === c.id)) acc.push({ id: c.id, name: c.name })
      return acc
    }, [])
  }, [apiClients, projects])

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setFormError('Indiquez un titre.')
      return
    }
    if (!form.startAt || !form.endAt) {
      setFormError('Indiquez un début et une fin.')
      return
    }
    if (isAdmin && !form.userId) {
      setFormError('Choisissez un client.')
      return
    }
    if (form.meetingUrl.trim() && !/^https?:\/\//i.test(form.meetingUrl.trim())) {
      setFormError('Le lien doit commencer par https://')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const clientLabel = clients.find((c) => c.id === form.userId)?.name
      const appt = createAppointment({
        title: form.title,
        description: form.description,
        startAt: localDatetimeToIso(form.startAt),
        endAt: localDatetimeToIso(form.endAt),
        userId: isAdmin ? form.userId : user.id,
        projectId: form.projectId || undefined,
        location: form.location,
        meetingUrl: form.meetingUrl,
        type: form.type,
        status: isAdmin ? 'confirmed' : 'requested',
        createdBy: user.id,
        clientName: isAdmin ? clientLabel?.split(' · ')[0] : user.name,
      })
      if (!appt) {
        setFormError('La date de fin doit être postérieure à la date de début.')
        return
      }
      await flushWorkspacePersist()
      onChange?.()
      setSelectedId(appt.id)
      setShowForm(false)
      const start = defaultAppointmentStartLocal()
      setForm({
        title: '',
        description: '',
        startAt: start,
        endAt: defaultAppointmentEndLocal(start),
        userId: '',
        projectId: '',
        location: 'Visio',
        meetingUrl: '',
        type: 'discovery',
      })
    } catch {
      setFormError('Enregistrement impossible. Réessayez.')
    } finally {
      setSaving(false)
    }
  }

  function statusLabel(status?: Appointment['status']) {
    if (status === 'requested') return 'Demande client'
    if (status === 'proposed') return 'Créneau proposé'
    return 'Confirmé'
  }

  const eventsThisMonth = apptsByDay.size
  const upcomingCount = appointments.filter((a) => new Date(a.endAt).getTime() >= Date.now()).length

  return (
    <div className="agenda-layout">
      <div className="agenda-calendar workspace-panel">
        <div className="agenda-calendar-head">
          <button type="button" className="btn-secondary agenda-nav-btn" onClick={() => setMonthOffset((m) => m - 1)} aria-label="Mois précédent">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <h2 className="agenda-month-title">{monthLabel}</h2>
          <button type="button" className="btn-secondary agenda-nav-btn" onClick={() => setMonthOffset((m) => m + 1)} aria-label="Mois suivant">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
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
            const isSelectedDay = selectedDay === day
            const isToday =
              day === new Date().getDate() &&
              viewDate.getMonth() === new Date().getMonth() &&
              viewDate.getFullYear() === new Date().getFullYear()
            return (
              <button
                key={day}
                type="button"
                className={`agenda-cell ${isToday ? 'agenda-cell--today' : ''} ${isSelectedDay ? 'agenda-cell--selected' : ''} ${dayAppts.length ? 'agenda-cell--has-event' : ''}`}
                onClick={() => {
                  setSelectedDay(day)
                  setSelectedId(dayAppts[0]?.id ?? null)
                }}
              >
                <span className="agenda-day-num">{day}</span>
                {dayAppts.slice(0, 2).map((a) => (
                  <span key={a.id} className="agenda-day-label">{a.title}</span>
                ))}
                {dayAppts.length > 2 && <span className="agenda-day-more">+{dayAppts.length - 2}</span>}
              </button>
            )
          })}
        </div>
        {selectedDay != null && (
          <div className="agenda-day-panel">
            <h3 className="billing-section-title">
              {selectedDay} {monthLabel}
            </h3>
            {(apptsByDay.get(selectedDay) ?? []).length === 0 ? (
              <p className="client-muted">Rien de prévu ce jour-là.</p>
            ) : (
              <ul className="agenda-event-list">
                {(apptsByDay.get(selectedDay) ?? []).map((a) => (
                  <li key={a.id}>
                    <button type="button" className={`agenda-event-card ${selectedId === a.id ? 'agenda-event-card--active' : ''}`} onClick={() => setSelectedId(a.id)}>
                      <p className="agenda-event-title">{a.title}</p>
                      <p className="client-message-hint">{formatDateTime(a.startAt)} · {statusLabel(a.status)}</p>
                      {isAdmin && <p className="client-message-hint">{a.clientName}</p>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {eventsThisMonth === 0 && (
          <p className="agenda-calendar-hint client-message-hint">
            {upcomingCount > 0
              ? 'Aucun RDV sur ce mois — changez de mois avec les flèches ou consultez la liste à droite.'
              : isAdmin
                ? 'Aucun RDV planifié — créez-en un avec le bouton « Nouveau rendez-vous ».'
                : 'Aucun rendez-vous pour l’instant. Demandez un créneau ici, ou depuis vos messages.'}
          </p>
        )}
      </div>

      <aside className="agenda-side">
        <button type="button" className="btn-primary w-full" onClick={() => setShowForm((v) => !v)}>
          <CalendarPlus size={16} /> {isAdmin ? 'Nouveau rendez-vous' : 'Demander un rendez-vous'}
        </button>

        {showForm && (
          <form className="agenda-form workspace-panel" noValidate onSubmit={handleCreate}>
            <h3 className="billing-section-title">{isAdmin ? 'Planifier un RDV' : 'Demander un créneau'}</h3>
            {formError && <p className="client-alert-desc text-red-300">{formError}</p>}
            <label className="billing-field">
              <span className="billing-field-label">Titre</span>
                <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            {isAdmin && (
            <label className="billing-field">
              <span className="billing-field-label">Client</span>
              <select
                className="admin-input"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value, projectId: '' })}
              >
                <option value="">Choisir…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {clients.length === 0 && (
                <span className="client-message-hint">Aucun compte client — convertissez un prospect en client d’abord.</span>
              )}
            </label>
            )}
            <label className="billing-field">
              <span className="billing-field-label">Projet</span>
              <select className="admin-input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">—</option>
                {projects.filter((p) => (isAdmin ? !form.userId || p.userId === form.userId : p.userId === user.id)).map((p) => (
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
                <input type="datetime-local" className="admin-input" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value, endAt: defaultAppointmentEndLocal(e.target.value) })} />
              </label>
              <label className="billing-field">
                <span className="billing-field-label">Fin</span>
                <input type="datetime-local" className="admin-input" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
              </label>
            </div>
            <div className="agenda-form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : isAdmin ? 'Enregistrer' : 'Envoyer la demande'}</button>
            </div>
            <label className="billing-field">
              <span className="billing-field-label">Lieu / visio</span>
              <input className="admin-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </label>
            <label className="billing-field">
              <span className="billing-field-label">Lien meeting</span>
              <input type="text" className="admin-input" value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} placeholder="https://…" />
            </label>
            <label className="billing-field">
              <span className="billing-field-label">Notes</span>
              <textarea className="admin-input agenda-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </label>
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
            <p className="client-message-hint">{formatDateTime(selected.startAt)} → {formatDateTime(selected.endAt)} · {statusLabel(selected.status)}</p>
            {selected.projectTitle && <p className="client-message-hint">{selected.projectTitle}</p>}
            {selected.description && <p className="client-detail-desc mt-2">{selected.description}</p>}
            {selected.meetingUrl && (
              <a href={selected.meetingUrl} target="_blank" rel="noopener noreferrer" className="client-link mt-2 inline-flex">
                Rejoindre la visio <ExternalLink size={14} />
              </a>
            )}
            <div className="billing-action-row mt-4">
              <button type="button" className="btn-primary" onClick={() => addToSystemCalendar(selected)}>
                <CalendarPlus size={14} /> Ajouter à mon agenda
              </button>
              {isAdmin && selected.status !== 'confirmed' && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    void (async () => {
                      setAppointmentStatus(selected.id, 'confirmed')
                      await flushWorkspacePersist()
                      onChange?.()
                    })()
                  }}
                >
                  Confirmer
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    void (async () => {
                      deleteAppointment(selected.id)
                      await flushWorkspacePersist()
                      setSelectedId(null)
                      onChange?.()
                    })()
                  }}
                >
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
