-- file: src/worker/migrations/0014_techniques_and_roles.sql
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  image_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

CREATE TABLE IF NOT EXISTS techniques (
  id TEXT PRIMARY KEY,
  data_json TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_techniques_status ON techniques(status);
CREATE INDEX IF NOT EXISTS idx_techniques_kind ON techniques(kind);
