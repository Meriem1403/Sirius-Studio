CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'admin')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prospects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  sector TEXT NOT NULL DEFAULT 'Non renseigné',
  source TEXT NOT NULL CHECK (source IN ('auto', 'manual', 'website')),
  status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  score INTEGER NOT NULL DEFAULT 50,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_contact_at TIMESTAMPTZ,
  converted_user_id TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS contact_leads (
  id TEXT PRIMARY KEY,
  prospect_id TEXT REFERENCES prospects(id),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_step TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deadline DATE,
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  mockup_url TEXT,
  mockup_published_at TIMESTAMPTZ,
  validation JSONB
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  from_label TEXT NOT NULL,
  from_user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('client', 'team')),
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  attachments JSONB,
  document_request_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status, created_at DESC);
