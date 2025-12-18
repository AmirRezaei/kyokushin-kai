-- Migration number: 0004 	 2025-12-18T09:10:00.000Z
CREATE TABLE IF NOT EXISTS user_terminology_progress (
  user_id TEXT NOT NULL,
  term_id TEXT NOT NULL,
  is_bookmarked INTEGER DEFAULT 0,
  updated_at INTEGER,
  PRIMARY KEY (user_id, term_id)
);

CREATE INDEX IF NOT EXISTS idx_utterm_user_id ON user_terminology_progress(user_id);
