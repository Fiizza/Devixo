-- Run this against your EXISTING Neon database (you already ran schema.sql once,
-- so use this instead of re-running schema.sql, to avoid touching existing rows)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;
