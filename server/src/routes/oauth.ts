import { Hono } from 'hono'
import { SignJWT, jwtVerify } from 'jose'
import { config } from '../config.js'
import { signToken } from '../services/auth.js'
import { findOrCreateOAuthUser } from '../services/oauthUsers.js'

const secret = new TextEncoder().encode(config.jwtSecret)

type Provider = 'google' | 'github' | 'microsoft' | 'apple'

const PROVIDERS: Provider[] = ['google', 'github', 'microsoft', 'apple']

function redirectUri(provider: Provider) {
  return `${config.oauthRedirectBase}/auth/oauth/${provider}/callback`
}

async function signOAuthState(next: string, provider: Provider) {
  return new SignJWT({ next, provider })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}

async function verifyOAuthState(state: string) {
  const { payload } = await jwtVerify(state, secret)
  const next = payload.next
  const provider = payload.provider
  if (typeof next !== 'string' || typeof provider !== 'string') return null
  return { next, provider: provider as Provider }
}

function clientRedirect(token: string, next: string) {
  const url = new URL('/auth/callback', config.publicAppUrl)
  url.searchParams.set('token', token)
  url.searchParams.set('next', next)
  return url.toString()
}

function providerConfigured(provider: Provider) {
  switch (provider) {
    case 'google':
      return Boolean(config.googleClientId && config.googleClientSecret)
    case 'github':
      return Boolean(config.githubClientId && config.githubClientSecret)
    case 'microsoft':
      return Boolean(config.microsoftClientId && config.microsoftClientSecret)
    case 'apple':
      return Boolean(config.appleClientId && config.appleTeamId && config.appleKeyId && config.applePrivateKey)
  }
}

function authorizeUrl(provider: Provider, state: string) {
  const redirect = encodeURIComponent(redirectUri(provider))
  const st = encodeURIComponent(state)
  switch (provider) {
    case 'google':
      return (
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(config.googleClientId)}` +
        `&redirect_uri=${redirect}&response_type=code&scope=${encodeURIComponent('openid email profile')}` +
        `&state=${st}&access_type=online&prompt=select_account`
      )
    case 'github':
      return (
        `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(config.githubClientId)}` +
        `&redirect_uri=${redirect}&scope=${encodeURIComponent('read:user user:email')}&state=${st}`
      )
    case 'microsoft':
      return (
        `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${encodeURIComponent(config.microsoftClientId)}` +
        `&redirect_uri=${redirect}&response_type=code&scope=${encodeURIComponent('openid email profile User.Read')}` +
        `&state=${st}&response_mode=query`
      )
    case 'apple':
      return (
        `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(config.appleClientId)}` +
        `&redirect_uri=${redirect}&response_type=code&scope=${encodeURIComponent('name email')}` +
        `&state=${st}&response_mode=form_post`
      )
  }
}

async function exchangeCode(provider: Provider, code: string) {
  switch (provider) {
    case 'google': {
      const body = new URLSearchParams({
        code,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: redirectUri(provider),
        grant_type: 'authorization_code',
      })
      const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body })
      if (!res.ok) throw new Error('TOKEN_EXCHANGE')
      const data = (await res.json()) as { access_token: string; id_token?: string }
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      if (!profileRes.ok) throw new Error('PROFILE')
      const p = (await profileRes.json()) as { sub: string; email: string; name?: string; email_verified?: boolean }
      return {
        provider,
        subject: p.sub,
        email: p.email,
        name: p.name ?? p.email.split('@')[0],
        emailVerified: p.email_verified,
      }
    }
    case 'github': {
      const body = new URLSearchParams({
        code,
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        redirect_uri: redirectUri(provider),
      })
      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
      })
      if (!res.ok) throw new Error('TOKEN_EXCHANGE')
      const data = (await res.json()) as { access_token?: string; error?: string }
      if (!data.access_token) throw new Error('TOKEN_EXCHANGE')
      const profileRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${data.access_token}`, Accept: 'application/json' },
      })
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${data.access_token}`, Accept: 'application/json' },
      })
      if (!profileRes.ok) throw new Error('PROFILE')
      const p = (await profileRes.json()) as { id: number; name?: string; email?: string }
      let email = p.email ?? ''
      if (!email && emailsRes.ok) {
        const emails = (await emailsRes.json()) as { email: string; primary: boolean; verified: boolean }[]
        email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? ''
      }
      return {
        provider,
        subject: String(p.id),
        email,
        name: p.name ?? email.split('@')[0] ?? 'Client GitHub',
        emailVerified: true,
      }
    }
    case 'microsoft': {
      const body = new URLSearchParams({
        code,
        client_id: config.microsoftClientId,
        client_secret: config.microsoftClientSecret,
        redirect_uri: redirectUri(provider),
        grant_type: 'authorization_code',
        scope: 'openid email profile User.Read',
      })
      const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        body,
      })
      if (!res.ok) throw new Error('TOKEN_EXCHANGE')
      const data = (await res.json()) as { access_token: string }
      const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      if (!profileRes.ok) throw new Error('PROFILE')
      const p = (await profileRes.json()) as { id: string; mail?: string; userPrincipalName?: string; displayName?: string }
      const email = (p.mail ?? p.userPrincipalName ?? '').toLowerCase()
      return {
        provider,
        subject: p.id,
        email,
        name: p.displayName ?? email.split('@')[0],
        emailVerified: true,
      }
    }
    case 'apple': {
      throw new Error('APPLE_POST_REQUIRED')
    }
  }
}

export const oauthRoutes = new Hono()

oauthRoutes.get('/providers', (c) => {
  const configured = PROVIDERS.filter((p) => providerConfigured(p))
  return c.json({ providers: configured })
})

oauthRoutes.get('/:provider/start', async (c) => {
  const provider = c.req.param('provider') as Provider
  if (!PROVIDERS.includes(provider)) return c.json({ error: 'Provider inconnu.' }, 404)
  if (!providerConfigured(provider)) {
    const fail = new URL('/connexion', config.publicAppUrl)
    fail.searchParams.set('oauth_error', 'not_configured')
    fail.searchParams.set('provider', provider)
    return c.redirect(fail.toString(), 302)
  }

  const nextRaw = c.req.query('next') ?? '/espace-client/nouvelle-demande'
  const next = nextRaw.startsWith('/') ? nextRaw : '/espace-client/nouvelle-demande'
  const state = await signOAuthState(next, provider)
  return c.redirect(authorizeUrl(provider, state), 302)
})

async function handleCallback(provider: Provider, code: string | undefined, state: string | undefined) {
  if (!code || !state) throw new Error('MISSING_PARAMS')
  const parsed = await verifyOAuthState(state)
  if (!parsed || parsed.provider !== provider) throw new Error('INVALID_STATE')
  const profile = await exchangeCode(provider, code)
  if (profile.emailVerified === false) throw new Error('EMAIL_NOT_VERIFIED')
  const user = await findOrCreateOAuthUser(profile)
  const token = await signToken(user.id)
  return clientRedirect(token, parsed.next)
}

oauthRoutes.get('/:provider/callback', async (c) => {
  const provider = c.req.param('provider') as Provider
  if (!PROVIDERS.includes(provider)) return c.text('Provider inconnu.', 404)
  try {
    const url = await handleCallback(provider, c.req.query('code'), c.req.query('state'))
    return c.redirect(url, 302)
  } catch (err) {
    console.error('[oauth]', provider, err)
    const fail = new URL('/connexion', config.publicAppUrl)
    fail.searchParams.set('oauth_error', '1')
    return c.redirect(fail.toString(), 302)
  }
})

oauthRoutes.post('/apple/callback', async (c) => {
  try {
    const body = await c.req.parseBody()
    const code = typeof body.code === 'string' ? body.code : undefined
    const state = typeof body.state === 'string' ? body.state : undefined
    if (!providerConfigured('apple')) throw new Error('NOT_CONFIGURED')
    // Apple user info is only sent on first auth in `user` JSON field — link by subject requires id_token decode.
    // Minimal path: treat as misconfigured until id_token verification is added.
    if (!code || !state) throw new Error('MISSING_PARAMS')
    const parsed = await verifyOAuthState(state)
    if (!parsed || parsed.provider !== 'apple') throw new Error('INVALID_STATE')
    const fail = new URL('/connexion', config.publicAppUrl)
    fail.searchParams.set('oauth_error', 'apple_setup')
    return c.redirect(fail.toString(), 302)
  } catch (err) {
    console.error('[oauth] apple', err)
    const fail = new URL('/connexion', config.publicAppUrl)
    fail.searchParams.set('oauth_error', '1')
    return c.redirect(fail.toString(), 302)
  }
})
