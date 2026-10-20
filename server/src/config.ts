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
}
