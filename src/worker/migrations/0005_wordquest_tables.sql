-- Migration number: 0005 	 2025-12-18T09:35:00.000Z

-- Table to track solved techinques in WordQuest
CREATE TABLE IF NOT EXISTS user_wordquest_progress (
  user_id TEXT NOT NULL,
  technique_id TEXT NOT NULL,
  solved_at INTEGER,
  PRIMARY KEY (user_id, technique_id)
);

CREATE INDEX IF NOT EXISTS idx_uwqp_user_id ON user_wordquest_progress(user_id);

-- Table to store generic game states (like score)
CREATE TABLE IF NOT EXISTS user_game_state (
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  data TEXT DEFAULT '{}', -- JSON string
  updated_at INTEGER,
  PRIMARY KEY (user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_ugs_user_id ON user_game_state(user_id);
