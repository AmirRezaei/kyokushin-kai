-- Migration: 0008_gym_tables.sql

-- User Muscle Groups
CREATE TABLE IF NOT EXISTS user_muscle_groups (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER DEFAULT (UNIXEPOCH()),
    updated_at INTEGER DEFAULT (UNIXEPOCH()),
    PRIMARY KEY (user_id, id)
);
CREATE INDEX IF NOT EXISTS idx_user_muscle_groups_user_id ON user_muscle_groups(user_id);

-- User Gym Equipment
CREATE TABLE IF NOT EXISTS user_gym_equipment (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at INTEGER DEFAULT (UNIXEPOCH()),
    updated_at INTEGER DEFAULT (UNIXEPOCH()),
    PRIMARY KEY (user_id, id)
);
CREATE INDEX IF NOT EXISTS idx_user_gym_equipment_user_id ON user_gym_equipment(user_id);

-- User Gym Exercises
CREATE TABLE IF NOT EXISTS user_gym_exercises (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    muscle_group_ids TEXT, -- JSON array of IDs
    equipment_ids TEXT, -- JSON array of IDs
    how TEXT,
    created_at INTEGER DEFAULT (UNIXEPOCH()),
    updated_at INTEGER DEFAULT (UNIXEPOCH()),
    PRIMARY KEY (user_id, id)
);
CREATE INDEX IF NOT EXISTS idx_user_gym_exercises_user_id ON user_gym_exercises(user_id);

-- User Workout Plans
CREATE TABLE IF NOT EXISTS user_workout_plans (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    exercises TEXT, -- JSON array of {exerciseId, sets, reps, rest}
    created_at INTEGER DEFAULT (UNIXEPOCH()),
    updated_at INTEGER DEFAULT (UNIXEPOCH()),
    PRIMARY KEY (user_id, id)
);
CREATE INDEX IF NOT EXISTS idx_user_workout_plans_user_id ON user_workout_plans(user_id);

-- User Gym Sessions
CREATE TABLE IF NOT EXISTS user_gym_sessions (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    workout_plan_id TEXT,
    date TEXT NOT NULL, -- ISO date string
    exercises TEXT, -- JSON array of {exerciseId, weight, reps, times}
    created_at INTEGER DEFAULT (UNIXEPOCH()),
    updated_at INTEGER DEFAULT (UNIXEPOCH()),
    PRIMARY KEY (user_id, id)
);
CREATE INDEX IF NOT EXISTS idx_user_gym_sessions_user_id ON user_gym_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gym_sessions_date ON user_gym_sessions(date);
