-- Add unique constraint on rate_limits so upsert works
ALTER TABLE rate_limits DROP CONSTRAINT IF EXISTS rate_limits_ip_date_key;
ALTER TABLE rate_limits ADD CONSTRAINT rate_limits_ip_date_key UNIQUE (ip, date);

-- Make sure downloads table allows null user_id for guest tracking
ALTER TABLE downloads ALTER COLUMN user_id DROP NOT NULL;
