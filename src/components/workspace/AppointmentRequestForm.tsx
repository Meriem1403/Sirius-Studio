import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import type { User } from '../../lib/auth/types'
import { createAppointment } from '../../lib/services/appointmentService'
import { sendMessage } from '../../lib/services/messageService'
import { flushWorkspacePersist } from '../../lib/data/store'
import {
  defaultAppointmentEndLocal,
  defaultAppointmentStartLocal,
  localDatetimeToIso,
} from '../../lib/calendar/formDefaults'

interface AppointmentRequestFormProps {
  mode: 'propose' | 'request'
  sender: User
  clientUserId: string
  clientName: string
  projectId: string
  projectTitle: string
  onDone: () => void
}

export default function AppointmentRequestForm({
  mode,
  sender,
  clientUserId,
  clientName,
  projectId,
  projectTitle,
  onDone,
}: AppointmentRequestFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState(defaultAppointmentStartLocal)
  const [endAt, setEndAt] = useState(() => defaultAppointmentEndLocal(defaultAppointmentStartLocal()))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Indiquez un titre.')
      return
    }
    if (!startAt || !endAt) {
      setError('Indiquez un début et une fin.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const appt = createAppointment({
        title,
        startAt: localDatetimeToIso(startAt),
        endAt: localDatetimeToIso(endAt),
        userId: clientUserId,
        projectId,
        type: 'other',
        status: mode === 'request' ? 'requested' : 'proposed',
        createdBy: sender.id,
        clientName,
        location: 'Visio',
      })
      if (!appt) {
        setError('La date de fin doit être après le début.')
        return
      }
      await flushWorkspacePersist()
      const when = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(appt.startAt))
      await sendMessage({
        sender,
        clientUserId,
        projectId,
        projectTitle,
        content:
          mode === 'request'
            ? `Demande de rendez-vous : ${appt.title}\nCréneau souhaité : ${when}`
            : `Créneau proposé : ${appt.title}\n${when}`,
      })
      setTitle('')
      setOpen(false)
      onDone()
    } catch {
      setError('Enregistrement impossible. Réessayez.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn-secondary w-full" onClick={() => setOpen(true)}>
        <CalendarPlus size={16} /> {mode === 'request' ? 'Demander un rendez-vous' : 'Proposer un créneau'}
      </button>
    )
  }

  return (
    <form className="appointment-request-form" noValidate onSubmit={handleSubmit}>
      <p className="billing-section-title">{mode === 'request' ? 'Demander un rendez-vous' : 'Proposer un créneau'}</p>
      {error && <p className="client-alert-desc text-red-300">{error}</p>}
      <label className="billing-field">
        <span className="billing-field-label">Titre</span>
        <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <div className="agenda-form-row">
        <label className="billing-field">
          <span className="billing-field-label">Début</span>
          <input
            type="datetime-local"
            className="admin-input"
            value={startAt}
            onChange={(e) => {
              setStartAt(e.target.value)
              setEndAt(defaultAppointmentEndLocal(e.target.value))
            }}
          />
        </label>
        <label className="billing-field">
          <span className="billing-field-label">Fin</span>
          <input type="datetime-local" className="admin-input" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </label>
      </div>
      <div className="agenda-form-actions">
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Annuler</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Envoi…' : mode === 'request' ? 'Envoyer la demande' : 'Envoyer le créneau'}
        </button>
      </div>
    </form>
  )
}
