-- file: src/worker/migrations/0024_add_mottos.sql
CREATE TABLE IF NOT EXISTS mottos (
  id TEXT PRIMARY KEY,
  data_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_mottos_status ON mottos(status);
