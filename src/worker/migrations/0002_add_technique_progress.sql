-- Migration number: 0002 	 2025-12-18T00:00:00.000Z
CREATE TABLE IF NOT EXISTS user_technique_progress (
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
