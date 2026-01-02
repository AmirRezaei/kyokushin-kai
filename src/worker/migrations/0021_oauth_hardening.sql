-- OAuth hardening: bind pending links to user and add login codes
ALTER TABLE pending_links ADD COLUMN expected_user_id TEXT;
ALTER TABLE oauth_transactions ADD COLUMN user_id TEXT;

CREATE TABLE oauth_login_codes (
  code TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  user_id TEXT NOT NULL,
  return_to TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER NULL
);
CREATE INDEX idx_oauth_login_codes_expires ON oauth_login_codes(expires_at);
CREATE INDEX idx_oauth_login_codes_user_id ON oauth_login_codes(user_id);
CREATE INDEX idx_oauth_login_codes_provider ON oauth_login_codes(provider);
