import { useState } from 'react'
import { CalendarPlus, Plus, Trash2 } from 'lucide-react'
import type { User } from '../../lib/auth/types'
import { sendAppointmentProposal } from '../../lib/services/appointmentConversation'
import {
  defaultAppointmentEndLocal,
  defaultAppointmentStartLocal,
  localDatetimeToIso,
} from '../../lib/calendar/formDefaults'

interface SlotDraft {
  startAt: string
  endAt: string
}

interface AppointmentRequestFormProps {
  mode: 'propose' | 'request'
  sender: User
  clientUserId: string
  clientName: string
  projectId: string
  projectTitle: string
  onDone: () => void
}

function freshSlot(): SlotDraft {
  const startAt = defaultAppointmentStartLocal()
  return { startAt, endAt: defaultAppointmentEndLocal(startAt) }
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
  const [slots, setSlots] = useState<SlotDraft[]>([freshSlot()])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function updateSlot(index: number, patch: Partial<SlotDraft>) {
    setSlots((current) => current.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Indiquez un titre.')
      return
    }
    if (slots.some((slot) => !slot.startAt || !slot.endAt)) {
      setError('Chaque créneau doit avoir un début et une fin.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const created = await sendAppointmentProposal({
        sender,
        clientUserId,
        clientName,
        projectId,
        projectTitle,
        title,
        status: mode === 'request' ? 'requested' : 'proposed',
        slots: slots.map((slot) => ({
          startAt: localDatetimeToIso(slot.startAt),
          endAt: localDatetimeToIso(slot.endAt),
        })),
      })
      if (!created) {
        setError('Chaque fin doit être après le début.')
        return
      }
      setTitle('')
      setSlots([freshSlot()])
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
        <CalendarPlus size={16} /> {mode === 'request' ? 'Demander un rendez-vous' : 'Proposer des créneaux'}
      </button>
    )
  }

  return (
    <form className="appointment-request-form" noValidate onSubmit={handleSubmit}>
      <p className="billing-section-title">{mode === 'request' ? 'Demander un rendez-vous' : 'Proposer des créneaux'}</p>
      {error && <p className="client-alert-desc text-red-300">{error}</p>}
      <label className="billing-field">
        <span className="billing-field-label">Titre</span>
        <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      {slots.map((slot, index) => (
        <div key={index} className="appointment-slot-draft">
          <div className="agenda-form-row">
            <label className="billing-field">
              <span className="billing-field-label">Début {slots.length > 1 ? index + 1 : ''}</span>
              <input
                type="datetime-local"
                className="admin-input"
                value={slot.startAt}
                onChange={(e) => updateSlot(index, { startAt: e.target.value, endAt: defaultAppointmentEndLocal(e.target.value) })}
              />
            </label>
            <label className="billing-field">
              <span className="billing-field-label">Fin {slots.length > 1 ? index + 1 : ''}</span>
              <input type="datetime-local" className="admin-input" value={slot.endAt} onChange={(e) => updateSlot(index, { endAt: e.target.value })} />
            </label>
          </div>
          {slots.length > 1 && (
            <button type="button" className="btn-secondary" onClick={() => setSlots((current) => current.filter((_, i) => i !== index))}>
              <Trash2 size={14} /> Retirer ce créneau
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn-secondary" onClick={() => setSlots((current) => [...current, freshSlot()])}>
        <Plus size={14} /> Ajouter un créneau
      </button>
      <div className="agenda-form-actions">
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Annuler</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Envoi…' : 'Envoyer dans la conversation'}
        </button>
      </div>
    </form>
  )
}
