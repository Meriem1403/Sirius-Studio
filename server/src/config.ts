function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value) throw new Error(`Variable d'environnement manquante: ${name}`)
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: required('DATABASE_URL', 'postgresql://sirius:sirius@localhost:5432/sirius'),
  jwtSecret: required('JWT_SECRET', 'dev-only-change-in-production'),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL ?? 'admin@sirius.studio',
  mailFrom: process.env.MAIL_FROM ?? 'Sirius Studio <noreply@sirius.studio>',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  publicAppUrl: process.env.PUBLIC_APP_URL ?? 'http://localhost:8080',
  seedOnStart: process.env.SEED_ON_START !== 'false',
  /** URL publique de l’API (callbacks OAuth), ex. https://api.domaine.fr */
  oauthRedirectBase: (process.env.OAUTH_REDIRECT_BASE ?? 'http://localhost:3001').replace(/\/$/, ''),
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  githubClientId: process.env.GITHUB_CLIENT_ID ?? '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
  microsoftClientId: process.env.MICROSOFT_CLIENT_ID ?? '',
  microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
  appleClientId: process.env.APPLE_CLIENT_ID ?? '',
  appleTeamId: process.env.APPLE_TEAM_ID ?? '',
  appleKeyId: process.env.APPLE_KEY_ID ?? '',
  applePrivateKey: process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
}
