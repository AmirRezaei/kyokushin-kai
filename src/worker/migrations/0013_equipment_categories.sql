-- Migration: 0013_equipment_categories.sql

-- User Equipment Categories
CREATE TABLE IF NOT EXISTS user_equipment_categories (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT, -- Hex color code for UI display (e.g., #FF5733)
    created_at INTEGER DEFAULT (UNIXEPOCH()),
    updated_at INTEGER DEFAULT (UNIXEPOCH()),
    PRIMARY KEY (user_id, id)
);
CREATE INDEX IF NOT EXISTS idx_user_equipment_categories_user_id ON user_equipment_categories(user_id);

-- Add category_id column to user_gym_equipment
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- This will fail if column already exists, but that's okay - we can ignore the error
-- The migration system should handle this gracefully
ALTER TABLE user_gym_equipment ADD COLUMN category_id TEXT;
CREATE INDEX IF NOT EXISTS idx_user_gym_equipment_category_id ON user_gym_equipment(category_id);
