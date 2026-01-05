-- Migration number: 0030 	 2026-01-05T21:20:00.000Z

CREATE TABLE IF NOT EXISTS user_scheduled_sessions (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  start_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  recurrence TEXT NOT NULL,
  color TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  version INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_uss_user_id ON user_scheduled_sessions(user_id);
