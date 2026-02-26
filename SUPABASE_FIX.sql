-- Run this in Supabase SQL Editor to fix the premium_users table

-- Step 1: Add missing columns (safe to run even if they exist)
ALTER TABLE premium_users
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'premium',
  ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Make user_id NOT require uniqueness conflict (drop and re-add safely)
ALTER TABLE premium_users DROP CONSTRAINT IF EXISTS premium_users_email_key;
ALTER TABLE premium_users DROP CONSTRAINT IF EXISTS premium_users_user_id_key;
ALTER TABLE premium_users ADD CONSTRAINT premium_users_email_key UNIQUE (email);

-- Step 3: Manually activate the test user (YOUR FIX — run this NOW)
-- Replace with your actual email
UPDATE premium_users
SET is_active = true,
    plan = 'premium',
    activated_at = NOW(),
    renewal_date = NOW() + INTERVAL '30 days',
    updated_at = NOW()
WHERE email = 'patelrutvik2715@gmail.com';

-- Step 4: If no row exists yet for your email, insert one
INSERT INTO premium_users (email, is_active, plan, activated_at, renewal_date, updated_at)
VALUES ('patelrutvik2715@gmail.com', true, 'premium', NOW(), NOW() + INTERVAL '30 days', NOW())
ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  plan = 'premium',
  activated_at = COALESCE(premium_users.activated_at, NOW()),
  renewal_date = COALESCE(premium_users.renewal_date, NOW() + INTERVAL '30 days'),
  updated_at = NOW();

-- Step 5: Link your user_id to the premium row
-- Run this AFTER the above to connect the auth user ID
UPDATE premium_users p
SET user_id = u.id
FROM auth.users u
WHERE u.email = p.email
  AND p.user_id IS NULL;
