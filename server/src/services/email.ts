import { config } from '../config.js'

export async function sendEmail(input: { to: string; subject: string; html: string; text: string }) {
  if (!config.resendApiKey) {
    console.info('[email:simulation]', input.to, input.subject)
    console.info(input.text)
    return { ok: true as const, simulated: true }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.mailFrom,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[email:error]', res.status, body)
    return { ok: false as const, error: body }
  }

  return { ok: true as const, simulated: false }
}

export async function notifyAdminNewLead(input: {
  name: string
  email: string
  company?: string
  phone?: string
  message?: string
}) {
  const subject = `Nouvelle demande · ${input.name}`
  const text = [
    `Nom : ${input.name}`,
    `Email : ${input.email}`,
    input.company ? `Entreprise : ${input.company}` : '',
    input.phone ? `Téléphone : ${input.phone}` : '',
    input.message ? `\nMessage :\n${input.message}` : '',
    `\nEspace admin : ${config.publicAppUrl}/espace-admin/prospection`,
  ]
    .filter(Boolean)
    .join('\n')

  const html = text.replace(/\n/g, '<br/>')

  return sendEmail({
    to: config.adminNotifyEmail,
    subject,
    html,
    text,
  })
}

export async function notifyAdminNewClientMessage(input: {
  clientName: string
  projectTitle: string
  preview: string
  projectId: string
}) {
  const subject = `Message client · ${input.projectTitle}`
  const text = [
    `${input.clientName} a écrit :`,
    '',
    input.preview,
    '',
    `Répondre : ${config.publicAppUrl}/espace-admin/messages?project=${input.projectId}`,
  ].join('\n')
  return sendEmail({
    to: config.adminNotifyEmail,
    subject,
    html: text.replace(/\n/g, '<br/>'),
    text,
  })
}

export async function notifyUserNewReply(input: { to: string; name: string; projectTitle: string; preview: string }) {
  const subject = `Réponse Sirius Studio · ${input.projectTitle}`
  const text = `Bonjour ${input.name},\n\nL'équipe Sirius Studio vous a répondu sur le projet « ${input.projectTitle} » :\n\n${input.preview}\n\nConnectez-vous : ${config.publicAppUrl}/espace-client/messages`
  return sendEmail({ to: input.to, subject, html: text.replace(/\n/g, '<br/>'), text })
}
