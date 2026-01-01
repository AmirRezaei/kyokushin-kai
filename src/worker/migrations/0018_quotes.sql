-- file: src/worker/migrations/0018_quotes.sql
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  data_json TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_author ON quotes(author);
