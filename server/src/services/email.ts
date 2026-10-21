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

export async function notifyClientWelcome(input: { to: string; name: string }) {
  const subject = 'Bienvenue sur Sirius Studio'
  const text = [
    `Bonjour ${input.name},`,
    '',
    'Votre compte client est créé. Vous pouvez suivre vos projets, échanger avec l’équipe et valider vos maquettes depuis votre espace :',
    `${config.publicAppUrl}/espace-client`,
    '',
    'Pour lancer un projet, déposez une demande depuis votre espace ou le formulaire du site.',
    '',
    'À très bientôt,',
    'L’équipe Sirius Studio',
  ].join('\n')
  return sendEmail({ to: input.to, subject, html: text.replace(/\n/g, '<br/>'), text })
}

export async function notifyClientContactReceived(input: { to: string; name: string }) {
  const subject = 'Nous avons bien reçu votre message'
  const text = [
    `Bonjour ${input.name},`,
    '',
    'Merci pour votre demande via le site Sirius Studio. Notre équipe la consulte et vous recontacte sous 48 h ouvrées.',
    '',
    `Vous pouvez aussi créer un compte pour suivre votre projet : ${config.publicAppUrl}/inscription`,
    '',
    'L’équipe Sirius Studio',
  ].join('\n')
  return sendEmail({ to: input.to, subject, html: text.replace(/\n/g, '<br/>'), text })
}

export async function notifyClientRequestReceived(input: { to: string; name: string; projectTitle: string }) {
  const subject = `Demande reçue · ${input.projectTitle}`
  const text = [
    `Bonjour ${input.name},`,
    '',
    `Nous avons bien enregistré votre demande pour le projet « ${input.projectTitle} ».`,
    'Un membre de l’équipe Sirius vous recontacte rapidement.',
    '',
    `Suivi en ligne : ${config.publicAppUrl}/espace-client/projets`,
    '',
    'L’équipe Sirius Studio',
  ].join('\n')
  return sendEmail({ to: input.to, subject, html: text.replace(/\n/g, '<br/>'), text })
}

export async function notifyAdminNewClientRequest(input: {
  clientName: string
  clientEmail: string
  projectTitle: string
  preview: string
  projectId: string
}) {
  const subject = `Demande client · ${input.projectTitle}`
  const text = [
    `${input.clientName} (${input.clientEmail}) a déposé une demande :`,
    '',
    input.preview,
    '',
    `Projet : ${config.publicAppUrl}/espace-admin/projets/${input.projectId}`,
  ].join('\n')
  return sendEmail({
    to: config.adminNotifyEmail,
    subject,
    html: text.replace(/\n/g, '<br/>'),
    text,
  })
}
