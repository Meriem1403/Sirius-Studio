import { pool, uid } from './db.js'
import { hashPassword } from './services/auth.js'

export async function seedIfEmpty() {
  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM users')
  if (Number(rows[0]?.count) > 0) return

  const adminId = 'fixture-admin-1'
  const marieId = 'fixture-client-marie'
  const thomasId = 'fixture-client-thomas'

  const users = [
    { id: adminId, email: 'admin@sirius.studio', password: 'Admin2026!', name: 'Équipe Sirius', role: 'admin' as const },
    { id: marieId, email: 'marie@demo.sirius', password: 'Demo2026!', name: 'Marie Dupont', company: 'Atelier Lumière', role: 'client' as const },
    { id: thomasId, email: 'thomas@demo.sirius', password: 'Demo2026!', name: 'Thomas Martin', company: 'BioFresh', role: 'client' as const },
  ]

  for (const u of users) {
    const password_hash = await hashPassword(u.password)
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, company, role) VALUES ($1,$2,$3,$4,$5,$6)`,
      [u.id, u.email, password_hash, u.name, u.company ?? null, u.role],
    )
  }

  const projectMarie = uid('proj')
  const projectThomas = uid('proj')

  await pool.query(
    `INSERT INTO projects (id, user_id, title, type, status, progress, next_step, description, milestones)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
    [
      projectMarie,
      marieId,
      'Refonte site vitrine',
      'Site web',
      'en_cours',
      45,
      'Validation maquette accueil',
      'Modernisation de l’identité en ligne.',
      JSON.stringify([
        { id: 'm1', label: 'Brief validé', done: true },
        { id: 'm2', label: 'Maquette accueil', done: false },
      ]),
    ],
  )

  await pool.query(
    `INSERT INTO projects (id, user_id, title, type, status, progress, next_step, description, milestones)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
    [
      projectThomas,
      thomasId,
      'Application mobile commande',
      'Application mobile',
      'maquette',
      20,
      'Première maquette UX',
      'Parcours commande B2B.',
      JSON.stringify([{ id: 'm1', label: 'Atelier cadrage', done: true }]),
    ],
  )

  await pool.query(
    `INSERT INTO messages (id, user_id, project_id, project_title, from_label, from_user_id, role, content, read)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      uid('msg'),
      marieId,
      projectMarie,
      'Refonte site vitrine',
      'Équipe Sirius · Sirius Studio',
      adminId,
      'team',
      'Bonjour Marie, la maquette accueil est prête pour votre retour.',
      false,
    ],
  )

  console.info('[seed] Utilisateurs et projets de démo créés.')
}
