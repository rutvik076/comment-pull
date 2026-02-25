-- ============================================
-- RUN THIS IN: Supabase → SQL Editor → New Query
-- ============================================

-- 1. Rate limiting table (tracks free downloads per IP per day)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ip, date)
);

-- Auto-cleanup old rate limit records (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 2. Download history table (for logged-in users)
CREATE TABLE IF NOT EXISTS downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Premium users table
CREATE TABLE IF NOT EXISTS premium_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Row Level Security
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;

-- Allow API to insert/update rate_limits (service role)
CREATE POLICY "Allow all on rate_limits" ON rate_limits FOR ALL USING (true);

-- Users can only see their own downloads
CREATE POLICY "Users see own downloads" ON downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own downloads" ON downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can see own premium status
CREATE POLICY "Users see own premium" ON premium_users
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- VERIFY: Run these to check tables exist
-- ============================================
-- SELECT * FROM rate_limits;
-- SELECT * FROM downloads;
-- SELECT * FROM premium_users;
