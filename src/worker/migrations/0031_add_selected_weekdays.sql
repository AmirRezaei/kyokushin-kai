-- Migration number: 0031 	 2026-01-05T22:40:00.000Z

ALTER TABLE user_scheduled_sessions ADD COLUMN selected_weekdays TEXT;
