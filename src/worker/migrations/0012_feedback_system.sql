-- Migration number: 0012 	 2025-12-29T20:14:00.000Z

-- Create user_feedback table for bug reports and feature requests
CREATE TABLE user_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('bug', 'feature')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  app_version TEXT NOT NULL,
  browser_info TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in-progress', 'resolved', 'closed', 'wont-fix')),
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0
);

-- Create indexes for efficient querying
CREATE INDEX idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX idx_user_feedback_type ON user_feedback(type);
CREATE INDEX idx_user_feedback_status ON user_feedback(status);
CREATE INDEX idx_user_feedback_app_version ON user_feedback(app_version);
