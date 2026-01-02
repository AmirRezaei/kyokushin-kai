-- Migration number: 0020  2025-12-28T00:00:00.000Z

ALTER TABLE refresh_tokens ADD COLUMN provider TEXT;
