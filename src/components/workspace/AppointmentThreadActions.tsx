import { useState } from 'react'
import type { Appointment, User } from '../../lib/auth/types'
import { useWorkspace } from '../../context/WorkspaceContext'
import { answerAppointment, formatSlot, sendAppointmentProposal } from '../../lib/services/appointmentConversation'
import {
  defaultAppointmentEndLocal,
  defaultAppointmentStartLocal,
  localDatetimeToIso,
} from '../../lib/calendar/formDefaults'

interface AppointmentThreadActionsProps {
  viewer: 'admin' | 'client'
  user: User
  projectId?: string
  onChange: () => void
}

export default function AppointmentThreadActions({ viewer, user, projectId, onChange }: AppointmentThreadActionsProps) {
  const { appointments } = useWorkspace()
  const [counterFor, setCounterFor] = useState<string | null>(null)
  const [startAt, setStartAt] = useState(defaultAppointmentStartLocal)
  const [endAt, setEndAt] = useState(() => defaultAppointmentEndLocal(defaultAppointmentStartLocal()))
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const pending = appointments.filter((appt) => {
    if (appt.status !== 'proposed' && appt.status !== 'requested') return false
    if (!appt.projectId) return false
    if (projectId && appt.projectId !== projectId) return false
    return true
  })

  const groups = new Map<string, Appointment[]>()
  for (const appt of pending) {
    const key = appt.proposalId ?? appt.id
    const list = groups.get(key) ?? []
    list.push(appt)
    groups.set(key, list)
  }

  if (groups.size === 0) return null

  async function decide(appt: Appointment, decision: 'confirm' | 'decline') {
    setBusyId(appt.id)
    setError(null)
    try {
      await answerAppointment({
        sender: user,
        appointment: appt,
        projectTitle: appt.projectTitle ?? 'Projet',
        decision,
      })
      onChange()
    } catch {
      setError('La réponse n’a pas pu être envoyée.')
    } finally {
      setBusyId(null)
    }
  }

  async function counter(appt: Appointment) {
    setBusyId(appt.id)
    setError(null)
    try {
      const created = await sendAppointmentProposal({
        sender: user,
        clientUserId: appt.userId,
        clientName: appt.clientName,
        projectId: appt.projectId!,
        projectTitle: appt.projectTitle ?? 'Projet',
        title: appt.title,
        slots: [{ startAt: localDatetimeToIso(startAt), endAt: localDatetimeToIso(endAt) }],
        status: viewer === 'admin' ? 'proposed' : 'requested',
        type: appt.type,
        location: appt.location,
        meetingUrl: appt.meetingUrl,
      })
      if (!created) {
        setError('La date de fin doit être après le début.')
        return
      }
      setCounterFor(null)
      onChange()
    } catch {
      setError('Le nouveau créneau n’a pas pu être envoyé.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="appointment-thread">
      {error && <p className="client-alert-desc text-red-300">{error}</p>}
      {[...groups.values()].map((slots) => {
        const first = slots[0]
        const waitingForClient = first.status === 'proposed'
        const canAnswer = (viewer === 'client' && waitingForClient) || (viewer === 'admin' && !waitingForClient)
        return (
          <article key={first.proposalId ?? first.id} className="appointment-thread-card">
            <p className="billing-section-title">{first.title}</p>
            <p className="client-message-hint">
              {waitingForClient
                ? viewer === 'client'
                  ? 'Sirius vous propose un rendez-vous. Acceptez, refusez ou proposez une autre date.'
                  : 'En attente de la réponse du client.'
                : viewer === 'admin'
                  ? 'Le client demande un rendez-vous. Validez, refusez ou proposez une autre date.'
                  : 'Votre demande est en attente de validation.'}
            </p>
            <ul className="appointment-slot-list">
              {slots.map((slot) => (
                <li key={slot.id} className="appointment-slot">
                  <p>{formatSlot(slot.startAt)} → {formatSlot(slot.endAt)}</p>
                  {canAnswer && (
                    <div className="appointment-slot-actions">
                      <button type="button" className="btn-primary" disabled={busyId === slot.id} onClick={() => void decide(slot, 'confirm')}>
                        {viewer === 'admin' ? 'Valider' : 'Accepter'}
                      </button>
                      <button type="button" className="btn-secondary" disabled={busyId === slot.id} onClick={() => void decide(slot, 'decline')}>
                        Refuser
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {canAnswer && (
              counterFor === (first.proposalId ?? first.id) ? (
                <form
                  className="appointment-counter"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void counter(first)
                  }}
                >
                  <div className="agenda-form-row">
                    <label className="billing-field">
                      <span className="billing-field-label">Autre début</span>
                      <input type="datetime-local" className="admin-input" value={startAt} onChange={(e) => { setStartAt(e.target.value); setEndAt(defaultAppointmentEndLocal(e.target.value)) }} />
                    </label>
                    <label className="billing-field">
                      <span className="billing-field-label">Autre fin</span>
                      <input type="datetime-local" className="admin-input" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
                    </label>
                  </div>
                  <div className="agenda-form-actions">
                    <button type="button" className="btn-secondary" onClick={() => setCounterFor(null)}>Annuler</button>
                    <button type="submit" className="btn-primary" disabled={busyId === first.id}>Envoyer cette date</button>
                  </div>
                </form>
              ) : (
                <button type="button" className="btn-secondary" onClick={() => setCounterFor(first.proposalId ?? first.id)}>
                  Proposer une autre date
                </button>
              )
            )}
          </article>
        )
      })}
    </div>
  )
}
