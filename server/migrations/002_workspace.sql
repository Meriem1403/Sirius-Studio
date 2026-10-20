CREATE TABLE IF NOT EXISTS workspace_collections (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deadline DATE,
  ADD COLUMN IF NOT EXISTS mockup_url TEXT,
  ADD COLUMN IF NOT EXISTS mockup_published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS validation JSONB;

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  project_id TEXT,
  project_title TEXT,
  created_by TEXT NOT NULL,
  location TEXT,
  meeting_url TEXT,
  type TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id, start_at);
