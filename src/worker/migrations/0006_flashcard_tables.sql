-- Migration number: 0006 	 2025-12-18T09:45:00.000Z

CREATE TABLE IF NOT EXISTS user_flashcard_decks (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  updated_at INTEGER,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_udecks_user_id ON user_flashcard_decks(user_id);

CREATE TABLE IF NOT EXISTS user_flashcards (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  deck_id TEXT,
  updated_at INTEGER,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_ufcards_user_id ON user_flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_ufcards_deck_id ON user_flashcards(deck_id);
