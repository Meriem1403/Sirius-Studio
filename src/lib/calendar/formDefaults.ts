/** Valeurs par défaut pour datetime-local (heure locale). */
export function defaultAppointmentStartLocal() {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return toDatetimeLocalValue(d)
}

export function defaultAppointmentEndLocal(startLocal?: string) {
  const d = startLocal ? fromDatetimeLocalValue(startLocal) : new Date()
  if (!startLocal) {
    d.setMinutes(0, 0, 0)
    d.setHours(d.getHours() + 1)
  }
  d.setMinutes(d.getMinutes() + 45)
  return toDatetimeLocalValue(d)
}

export function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDatetimeLocalValue(value: string) {
  return new Date(value)
}

export function localDatetimeToIso(value: string) {
  return fromDatetimeLocalValue(value).toISOString()
}
