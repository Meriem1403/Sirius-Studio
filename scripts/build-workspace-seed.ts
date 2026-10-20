/**
 * Génère server/fixtures/workspace-seed.json depuis les fixtures front.
 * Usage: npx tsx scripts/build-workspace-seed.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FIXTURE_ACTIVITIES, FIXTURE_PROJECTS } from '../src/fixtures/projects.ts'
import { FIXTURE_MESSAGES } from '../src/fixtures/messages.ts'
import { FIXTURE_PROFILES } from '../src/fixtures/profiles.ts'
import { FIXTURE_DOCUMENT_REQUESTS } from '../src/fixtures/documentRequests.ts'
import { FIXTURE_PROSPECTS } from '../src/fixtures/prospects.ts'
import {
  FIXTURE_ACCOUNTING,
  FIXTURE_INVOICES,
  FIXTURE_PAYMENTS,
  FIXTURE_QUOTES,
  FIXTURE_REFUNDS,
} from '../src/fixtures/billing.ts'
import { FIXTURE_APPOINTMENTS } from '../src/fixtures/appointments.ts'

const root = path.dirname(fileURLToPath(import.meta.url))

const payload = {
  projects: FIXTURE_PROJECTS,
  activities: FIXTURE_ACTIVITIES,
  notifications: [
    {
      id: 'notif-seed-1',
      userId: 'fixture-client-2',
      type: 'mockup_ready',
      title: 'Votre maquette est prête',
      body: 'Consultez la maquette E-commerce Mercier & Co et indiquez si elle vous convient.',
      date: '2026-09-07T09:05:00',
      read: false,
      projectId: 'proj-3',
      link: '/espace-client/projets/proj-3',
    },
  ],
  profiles: FIXTURE_PROFILES,
  deliveries: [],
  documentRequests: FIXTURE_DOCUMENT_REQUESTS,
  prospects: FIXTURE_PROSPECTS,
  quotes: FIXTURE_QUOTES,
  invoices: FIXTURE_INVOICES,
  payments: FIXTURE_PAYMENTS,
  refunds: FIXTURE_REFUNDS,
  accounting: FIXTURE_ACCOUNTING,
  appointments: FIXTURE_APPOINTMENTS,
  messages: FIXTURE_MESSAGES,
}

const out = path.join(root, '../server/fixtures/workspace-seed.json')
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify(payload, null, 2))
console.info('Écrit:', out)
