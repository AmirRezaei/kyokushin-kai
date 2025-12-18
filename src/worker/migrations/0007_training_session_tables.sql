-- Migration number: 0007 	 2025-12-18T10:00:00.000Z

CREATE TABLE IF NOT EXISTS user_training_sessions (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  intensity TEXT,
  notes TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_uts_user_id ON user_training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_uts_date ON user_training_sessions(date);
