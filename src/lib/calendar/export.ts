import type { Appointment } from '../auth/types'

function formatIcsDate(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

export function buildGoogleCalendarUrl(appt: Appointment) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: appt.title,
    dates: `${formatIcsDate(appt.startAt)}/${formatIcsDate(appt.endAt)}`,
    details: [appt.description, appt.meetingUrl && `Lien : ${appt.meetingUrl}`].filter(Boolean).join('\n\n'),
    location: appt.location ?? '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function buildIcsFile(appt: Appointment) {
  const uid = `${appt.id}@sirius.studio`
  const now = formatIcsDate(new Date().toISOString())
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sirius Studio//Agenda//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatIcsDate(appt.startAt)}`,
    `DTEND:${formatIcsDate(appt.endAt)}`,
    `SUMMARY:${appt.title.replace(/,/g, '\\,')}`,
    appt.description ? `DESCRIPTION:${appt.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}` : '',
    appt.location ? `LOCATION:${appt.location.replace(/,/g, '\\,')}` : '',
    appt.meetingUrl ? `URL:${appt.meetingUrl}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  return lines.join('\r\n')
}

export function downloadIcs(appt: Appointment, filename?: string) {
  const blob = new Blob([buildIcsFile(appt)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? `sirius-rdv-${appt.id.slice(-6)}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

export function openGoogleCalendar(appt: Appointment) {
  window.open(buildGoogleCalendarUrl(appt), '_blank', 'noopener,noreferrer')
}
