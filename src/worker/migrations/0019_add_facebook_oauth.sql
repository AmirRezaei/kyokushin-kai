-- Identities table
CREATE TABLE identities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(provider, provider_user_id)
);
CREATE INDEX idx_identities_user_id ON identities(user_id);

-- OAuth Transactions (ephemeral)
CREATE TABLE oauth_transactions (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  state TEXT NOT NULL,
  pkce_verifier TEXT NOT NULL,
  mode TEXT NOT NULL, -- 'login' | 'link'
  return_to TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER NULL
);
CREATE INDEX idx_oauth_tx_expires ON oauth_transactions(expires_at);
CREATE INDEX idx_oauth_tx_provider_state ON oauth_transactions(provider, state);

-- Pending Links (ephemeral)
CREATE TABLE pending_links (
  code TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  return_to TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER NULL
);
CREATE INDEX idx_pending_links_expires ON pending_links(expires_at);
CREATE INDEX idx_pending_links_provider_user ON pending_links(provider, provider_user_id);
-- Partial unique index for active pending link
CREATE UNIQUE INDEX uq_pending_links_active_identity 
ON pending_links(provider, provider_user_id) 
WHERE consumed_at IS NULL;
