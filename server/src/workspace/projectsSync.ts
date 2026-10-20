import { pool } from '../db.js'

export async function syncProjectsTable(projects: Record<string, unknown>[]) {
  for (const raw of projects) {
    if (!raw.id || !raw.userId || !raw.title) continue
    await pool.query(
      `INSERT INTO projects (id, user_id, title, type, status, progress, updated_at, next_step, description, started_at, deadline, milestones, mockup_url, mockup_published_at, validation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         title = EXCLUDED.title,
         type = EXCLUDED.type,
         status = EXCLUDED.status,
         progress = EXCLUDED.progress,
         updated_at = EXCLUDED.updated_at,
         next_step = EXCLUDED.next_step,
         description = EXCLUDED.description,
         started_at = EXCLUDED.started_at,
         deadline = EXCLUDED.deadline,
         milestones = EXCLUDED.milestones,
         mockup_url = EXCLUDED.mockup_url,
         mockup_published_at = EXCLUDED.mockup_published_at,
         validation = EXCLUDED.validation`,
      [
        raw.id,
        raw.userId,
        raw.title,
        raw.type ?? 'web',
        raw.status ?? 'discovery',
        raw.progress ?? 0,
        raw.updatedAt ?? new Date().toISOString(),
        raw.nextStep ?? '',
        raw.description ?? '',
        raw.startedAt ?? new Date().toISOString(),
        raw.deadline ?? null,
        JSON.stringify(raw.milestones ?? []),
        raw.mockupUrl ?? null,
        raw.mockupPublishedAt ?? null,
        raw.validation ? JSON.stringify(raw.validation) : null,
      ],
    )
  }
}
