-- Run this in Supabase SQL Editor
-- Adds missing columns to premium_users table

ALTER TABLE premium_users
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'premium',
  ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Unique constraints so upsert works
ALTER TABLE premium_users
  DROP CONSTRAINT IF EXISTS premium_users_email_key;
ALTER TABLE premium_users
  ADD CONSTRAINT premium_users_email_key UNIQUE (email);

ALTER TABLE premium_users
  DROP CONSTRAINT IF EXISTS premium_users_user_id_key;
ALTER TABLE premium_users
  ADD CONSTRAINT premium_users_user_id_key UNIQUE (user_id);

-- Backfill existing premium users
UPDATE premium_users
SET renewal_date = COALESCE(renewal_date, NOW() + INTERVAL '30 days'),
    activated_at = COALESCE(activated_at, created_at, NOW()),
    updated_at   = NOW()
WHERE is_active = true;
