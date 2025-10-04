-- Phase 5: Advanced Features Database Migration
-- Date: October 4, 2025

-- 1. Update User table with notification settings
ALTER TABLE addressify_users 
ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "notificationSettings" JSONB DEFAULT '{"quoteGenerated": false, "dailySummary": false, "weeklySummary": true, "priceAlerts": true, "failedQuotes": true}'::jsonb;

-- 2. Create Email Log table
CREATE TABLE IF NOT EXISTS addressify_email_logs (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES addressify_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  "to" TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  "sentAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_userId ON addressify_email_logs("userId");
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON addressify_email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sentAt ON addressify_email_logs("sentAt");

-- 3. Create API Key table
CREATE TABLE IF NOT EXISTS addressify_api_keys (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES addressify_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  "keyPrefix" TEXT NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  "lastUsedAt" TIMESTAMP WITH TIME ZONE,
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  "isActive" BOOLEAN DEFAULT true,
  "rateLimit" INTEGER DEFAULT 100,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_userId ON addressify_api_keys("userId");
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON addressify_api_keys(key);

-- 4. Create API Key Usage table
CREATE TABLE IF NOT EXISTS addressify_api_key_usage (
  id TEXT PRIMARY KEY,
  "apiKeyId" TEXT NOT NULL REFERENCES addressify_api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  "statusCode" INTEGER NOT NULL,
  "responseTime" INTEGER NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_key_usage_apiKeyId ON addressify_api_key_usage("apiKeyId");
CREATE INDEX IF NOT EXISTS idx_api_key_usage_timestamp ON addressify_api_key_usage(timestamp);

-- 5. Create Webhook table
CREATE TABLE IF NOT EXISTS addressify_webhooks (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES addressify_users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_userId ON addressify_webhooks("userId");

-- 6. Create Webhook Log table
CREATE TABLE IF NOT EXISTS addressify_webhook_logs (
  id TEXT PRIMARY KEY,
  "webhookId" TEXT NOT NULL REFERENCES addressify_webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  response JSONB,
  "statusCode" INTEGER,
  attempt INTEGER DEFAULT 1,
  success BOOLEAN DEFAULT false,
  error TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhookId ON addressify_webhook_logs("webhookId");
CREATE INDEX IF NOT EXISTS idx_webhook_logs_timestamp ON addressify_webhook_logs(timestamp);

-- 7. Enable RLS on new tables
ALTER TABLE addressify_email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE addressify_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE addressify_api_key_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE addressify_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE addressify_webhook_logs ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for Email Logs
CREATE POLICY "Users can view own email logs"
  ON addressify_email_logs FOR SELECT
  USING (auth.uid()::text = "userId");

-- 9. Create RLS policies for API Keys
CREATE POLICY "Users can manage own API keys"
  ON addressify_api_keys FOR ALL
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view own API key usage"
  ON addressify_api_key_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM addressify_api_keys
      WHERE addressify_api_keys.id = addressify_api_key_usage."apiKeyId"
      AND addressify_api_keys."userId" = auth.uid()::text
    )
  );

-- 10. Create RLS policies for Webhooks
CREATE POLICY "Users can manage own webhooks"
  ON addressify_webhooks FOR ALL
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view own webhook logs"
  ON addressify_webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM addressify_webhooks
      WHERE addressify_webhooks.id = addressify_webhook_logs."webhookId"
      AND addressify_webhooks."userId" = auth.uid()::text
    )
  );

-- 11. Grant permissions
GRANT ALL ON addressify_email_logs TO authenticated;
GRANT ALL ON addressify_api_keys TO authenticated;
GRANT ALL ON addressify_api_key_usage TO authenticated;
GRANT ALL ON addressify_webhooks TO authenticated;
GRANT ALL ON addressify_webhook_logs TO authenticated;

-- Migration complete!
-- Run this script in Supabase SQL Editor
