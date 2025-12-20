-- Migration number: 0010 	 2025-12-21T00:00:00.000Z

-- Add version column to user_settings
ALTER TABLE user_settings ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- Add version column to user_technique_progress
ALTER TABLE user_technique_progress ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- Add version column to user_flashcard_decks
ALTER TABLE user_flashcard_decks ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- Add version column to user_flashcards
ALTER TABLE user_flashcards ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- Add version column to user_training_sessions
ALTER TABLE user_training_sessions ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- Add version column to user_game_state
ALTER TABLE user_game_state ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- Add version column to user_muscle_groups
ALTER TABLE user_muscle_groups ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- Add version column to user_gym_equipment
ALTER TABLE user_gym_equipment ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- Add version column to user_gym_exercises
ALTER TABLE user_gym_exercises ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- Add version column to user_workout_plans
ALTER TABLE user_workout_plans ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- Add version column to user_gym_sessions
ALTER TABLE user_gym_sessions ADD COLUMN version INTEGER NOT NULL DEFAULT 0;
