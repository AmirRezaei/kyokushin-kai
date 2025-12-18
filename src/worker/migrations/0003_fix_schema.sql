-- Migration number: 0003 	 2025-12-18T09:00:00.000Z
-- Fix stale schema by dropping and re-creating the table
DROP TABLE IF EXISTS user_technique_progress;

CREATE TABLE user_technique_progress (
  user_id TEXT NOT NULL,
  technique_id TEXT NOT NULL,
  status TEXT DEFAULT 'not-started',
  rating INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  tags TEXT DEFAULT '[]', -- JSON string
  video_links TEXT DEFAULT '[]', -- JSON string
  updated_at INTEGER,
  PRIMARY KEY (user_id, technique_id)
);

CREATE INDEX IF NOT EXISTS idx_utp_user_id ON user_technique_progress(user_id);
