-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR FIRST
-- Authentication → SQL Editor → New Query
-- ============================================

CREATE TABLE IF NOT EXISTS api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT 'API Key',
  key_hash        TEXT NOT NULL UNIQUE,
  key_preview     TEXT NOT NULL,
  requests_count  INTEGER DEFAULT 0,
  last_used_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id  ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
