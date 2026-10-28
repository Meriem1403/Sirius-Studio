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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderEmail(input: {
  eyebrow: string
  title: string
  paragraphs?: string[]
  quote?: string
  rows?: { label: string; value: string }[]
  cta?: { label: string; href: string }
}) {
  const paragraphs = (input.paragraphs ?? [])
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-family:Georgia,'Iowan Old Style',serif;font-size:16px;line-height:1.6;color:#1c2230;">${escapeHtml(p)}</p>`,
    )
    .join('')

  const quote = input.quote
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
        <tr>
          <td style="border-left:3px solid #7c7ff5;background:#f4f5fb;border-radius:0 12px 12px 0;padding:16px 18px;font-family:Georgia,'Iowan Old Style',serif;font-size:16px;line-height:1.6;color:#1c2230;">
            ${escapeHtml(input.quote).replace(/\n/g, '<br/>')}
          </td>
        </tr>
      </table>`
    : ''

  const rows = (input.rows ?? [])
    .map(
      (row) => `<tr>
        <td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8b93a7;width:120px;vertical-align:top;">${escapeHtml(row.label)}</td>
        <td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.45;color:#1c2230;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join('')

  const details = rows
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;border-top:1px solid #eceef5;">${rows}</table>`
    : ''

  const cta = input.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 8px;">
        <tr>
          <td style="border-radius:999px;background:#5b5ef0;">
            <a href="${escapeHtml(input.cta.href)}" style="display:inline-block;padding:13px 22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(input.cta.label)}</a>
          </td>
        </tr>
      </table>`
    : ''

  return `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#eef0f6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f6;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e4e7f0;">
            <tr>
              <td style="background:#141820;padding:28px 32px 24px;">
                <p style="margin:0 0 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;letter-spacing:0.22em;color:#a5b4fc;">SIRIUS STUDIO</p>
                <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7dd3fc;">${escapeHtml(input.eyebrow)}</p>
                <h1 style="margin:0;font-family:Georgia,'Iowan Old Style',serif;font-size:28px;line-height:1.25;font-weight:500;color:#f8fafc;">${escapeHtml(input.title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="height:3px;background:#7c7ff5;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 32px 12px;">
                ${paragraphs}
                ${quote}
                ${details}
                ${cta}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;line-height:1.5;color:#8b93a7;">
                Sirius Studio · <a href="${escapeHtml(config.publicAppUrl)}" style="color:#5b5ef0;text-decoration:none;">studio-sirius.fr</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
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

  const html = renderEmail({
    eyebrow: 'Prospection',
    title: input.name,
    quote: input.message,
    rows: [
      { label: 'Email', value: input.email },
      ...(input.company ? [{ label: 'Entreprise', value: input.company }] : []),
      ...(input.phone ? [{ label: 'Téléphone', value: input.phone }] : []),
    ],
    cta: { label: 'Ouvrir la prospection', href: `${config.publicAppUrl}/espace-admin/prospection` },
  })

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
  const href = `${config.publicAppUrl}/espace-admin/messages?project=${input.projectId}`
  const text = [`${input.clientName} a écrit :`, '', input.preview, '', `Répondre : ${href}`].join('\n')
  const html = renderEmail({
    eyebrow: 'Message client',
    title: input.projectTitle,
    paragraphs: [`${input.clientName} a écrit :`],
    quote: input.preview,
    cta: { label: 'Répondre dans l’admin', href },
  })
  return sendEmail({
    to: config.adminNotifyEmail,
    subject,
    html,
    text,
  })
}

export async function notifyUserNewReply(input: { to: string; name: string; projectTitle: string; preview: string }) {
  const subject = `Réponse Sirius Studio · ${input.projectTitle}`
  const href = `${config.publicAppUrl}/espace-client/messages`
  const text = `Bonjour ${input.name},\n\nL'équipe Sirius Studio vous a répondu sur le projet « ${input.projectTitle} » :\n\n${input.preview}\n\nConnectez-vous : ${href}`
  const html = renderEmail({
    eyebrow: 'Réponse de l’équipe',
    title: input.projectTitle,
    paragraphs: [`Bonjour ${input.name},`, 'L’équipe Sirius Studio vous a répondu :'],
    quote: input.preview,
    cta: { label: 'Lire le message', href },
  })
  return sendEmail({ to: input.to, subject, html, text })
}

export async function notifyClientWelcome(input: { to: string; name: string }) {
  const subject = 'Bienvenue sur Sirius Studio'
  const href = `${config.publicAppUrl}/espace-client`
  const text = [
    `Bonjour ${input.name},`,
    '',
    'Votre compte client est créé. Vous pouvez suivre vos projets, échanger avec l’équipe et valider vos maquettes depuis votre espace :',
    href,
    '',
    'Pour lancer un projet, déposez une demande depuis votre espace ou le formulaire du site.',
    '',
    'À très bientôt,',
    'L’équipe Sirius Studio',
  ].join('\n')
  const html = renderEmail({
    eyebrow: 'Bienvenue',
    title: `Bonjour ${input.name}`,
    paragraphs: [
      'Votre compte client est créé. Vous pouvez suivre vos projets, échanger avec l’équipe et valider vos maquettes depuis votre espace.',
      'Pour lancer un projet, déposez une demande depuis votre espace ou le formulaire du site.',
    ],
    cta: { label: 'Ouvrir mon espace', href },
  })
  return sendEmail({ to: input.to, subject, html, text })
}

export async function notifyClientContactReceived(input: { to: string; name: string }) {
  const subject = 'Nous avons bien reçu votre message'
  const href = `${config.publicAppUrl}/inscription`
  const text = [
    `Bonjour ${input.name},`,
    '',
    'Merci pour votre demande via le site Sirius Studio. Notre équipe la consulte et vous recontacte sous 48 h ouvrées.',
    '',
    `Vous pouvez aussi créer un compte pour suivre votre projet : ${href}`,
    '',
    'L’équipe Sirius Studio',
  ].join('\n')
  const html = renderEmail({
    eyebrow: 'Accusé de réception',
    title: `Bonjour ${input.name}`,
    paragraphs: [
      'Merci pour votre demande via le site Sirius Studio. Notre équipe la consulte et vous recontacte sous 48 h ouvrées.',
      'Vous pouvez aussi créer un compte pour suivre votre projet.',
    ],
    cta: { label: 'Créer mon compte', href },
  })
  return sendEmail({ to: input.to, subject, html, text })
}

export async function notifyClientRequestReceived(input: { to: string; name: string; projectTitle: string }) {
  const subject = `Demande reçue · ${input.projectTitle}`
  const href = `${config.publicAppUrl}/espace-client/projets`
  const text = [
    `Bonjour ${input.name},`,
    '',
    `Nous avons bien enregistré votre demande pour le projet « ${input.projectTitle} ».`,
    'Un membre de l’équipe Sirius vous recontacte rapidement.',
    '',
    `Suivi en ligne : ${href}`,
    '',
    'L’équipe Sirius Studio',
  ].join('\n')
  const html = renderEmail({
    eyebrow: 'Demande reçue',
    title: input.projectTitle,
    paragraphs: [
      `Bonjour ${input.name},`,
      'Nous avons bien enregistré votre demande. Un membre de l’équipe Sirius vous recontacte rapidement.',
    ],
    cta: { label: 'Suivre mon projet', href },
  })
  return sendEmail({ to: input.to, subject, html, text })
}

export async function notifyPasswordReset(input: { to: string; name: string; link: string }) {
  const subject = 'Réinitialiser votre mot de passe · Sirius Studio'
  const text = [
    `Bonjour ${input.name},`,
    '',
    'Vous avez demandé à choisir un nouveau mot de passe. Ce lien est valable 1 heure :',
    input.link,
    '',
    'Si vous n’êtes pas à l’origine de cette demande, ignorez cet email. Votre mot de passe actuel reste inchangé.',
    '',
    'L’équipe Sirius Studio',
  ].join('\n')
  const html = renderEmail({
    eyebrow: 'Mot de passe',
    title: `Bonjour ${input.name}`,
    paragraphs: [
      'Vous avez demandé à choisir un nouveau mot de passe. Ce lien est valable 1 heure.',
      'Si vous n’êtes pas à l’origine de cette demande, ignorez cet email. Votre mot de passe actuel reste inchangé.',
    ],
    cta: { label: 'Choisir un nouveau mot de passe', href: input.link },
  })
  return sendEmail({ to: input.to, subject, html, text })
}

export async function notifyAdminNewClientRequest(input: {
  clientName: string
  clientEmail: string
  projectTitle: string
  preview: string
  projectId: string
}) {
  const subject = `Demande client · ${input.projectTitle}`
  const href = `${config.publicAppUrl}/espace-admin/projets/${input.projectId}`
  const text = [
    `${input.clientName} (${input.clientEmail}) a déposé une demande :`,
    '',
    input.preview,
    '',
    `Projet : ${href}`,
  ].join('\n')
  const html = renderEmail({
    eyebrow: 'Nouvelle demande',
    title: input.projectTitle,
    quote: input.preview,
    rows: [
      { label: 'Client', value: input.clientName },
      { label: 'Email', value: input.clientEmail },
    ],
    cta: { label: 'Ouvrir le projet', href },
  })
  return sendEmail({
    to: config.adminNotifyEmail,
    subject,
    html,
    text,
  })
}
