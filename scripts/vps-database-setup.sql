-- ============================================================
-- ADDRESSIFY DATABASE SETUP SCRIPT FOR VPS
-- Server: 72.61.114.103
-- Run this script as postgres superuser
-- ============================================================

-- 1. Create database user for Addressify
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'addressify_user') THEN
        CREATE USER addressify_user WITH PASSWORD 'AddressifyVPS2025!@#';
    END IF;
END
$$;

-- 2. Create database
-- Use C.UTF-8 collation (compatible with VPS template)
-- Run this command separately: 
-- CREATE DATABASE addressify_db OWNER addressify_user ENCODING 'UTF8' LC_COLLATE 'C.UTF-8' LC_CTYPE 'C.UTF-8';
-- Or simply without collation specification (inherits from template):
CREATE DATABASE addressify_db OWNER addressify_user ENCODING 'UTF8';

-- 3. Connect to addressify_db and run the rest
\c addressify_db

-- 4. Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- 5. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE addressify_db TO addressify_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO addressify_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO addressify_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO addressify_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO addressify_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO addressify_user;

-- ============================================================
-- TABLES CREATION (Prisma will handle this, but here's manual SQL)
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS addressify_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    "emailVerified" BOOLEAN DEFAULT FALSE,
    "notificationSettings" JSONB DEFAULT '{"quoteGenerated": false, "dailySummary": false, "weeklySummary": true, "priceAlerts": true, "failedQuotes": true}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS addressify_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES addressify_users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON addressify_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON addressify_sessions("userId");

-- Shops table
CREATE TABLE IF NOT EXISTS addressify_shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    "userId" UUID NOT NULL REFERENCES addressify_users(id) ON DELETE CASCADE,
    "senderAddress" VARCHAR(500) NOT NULL,
    "senderWard" VARCHAR(255),
    "senderDistrict" VARCHAR(255) NOT NULL,
    "senderProvince" VARCHAR(255) NOT NULL,
    "ghnProvinceId" VARCHAR(50),
    "ghnDistrictId" VARCHAR(50),
    "ghnWardCode" VARCHAR(50),
    "ghnShopId" VARCHAR(50),
    "ghtkPickAddress" VARCHAR(500),
    "ghtkPickProvince" VARCHAR(255),
    "ghtkPickDistrict" VARCHAR(255),
    "ghtkPickWard" VARCHAR(255),
    "ghtkPartnerId" VARCHAR(50),
    "vtpProvinceId" VARCHAR(50),
    "vtpDistrictId" VARCHAR(50),
    "vtpWardId" VARCHAR(50),
    "vtpCustomerId" VARCHAR(50),
    "vtpGroupId" VARCHAR(50),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shops_userId ON addressify_shops("userId");

-- Quote History table
CREATE TABLE IF NOT EXISTS addressify_quote_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "shopId" UUID NOT NULL REFERENCES addressify_shops(id) ON DELETE CASCADE,
    "recipientName" VARCHAR(255) NOT NULL,
    "recipientPhone" VARCHAR(20) NOT NULL,
    "recipientAddress" VARCHAR(500) NOT NULL,
    "normalizedAddress" VARCHAR(500) NOT NULL,
    province VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    ward VARCHAR(255) NOT NULL,
    "wardCode" VARCHAR(50),
    confidence FLOAT NOT NULL,
    quotes JSONB NOT NULL,
    weight INTEGER DEFAULT 1000,
    value INTEGER DEFAULT 0,
    note TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quote_histories_shopId_createdAt ON addressify_quote_histories("shopId", "createdAt");

-- Email Logs table
CREATE TABLE IF NOT EXISTS addressify_email_logs (
    id VARCHAR(30) PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES addressify_users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error TEXT,
    "sentAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_logs_userId ON addressify_email_logs("userId");
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON addressify_email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sentAt ON addressify_email_logs("sentAt");

-- API Keys table
CREATE TABLE IF NOT EXISTS addressify_api_keys (
    id VARCHAR(30) PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES addressify_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) UNIQUE NOT NULL,
    "keyPrefix" VARCHAR(20) NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    "lastUsedAt" TIMESTAMP WITH TIME ZONE,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN DEFAULT TRUE,
    "rateLimit" INTEGER DEFAULT 100,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_keys_userId ON addressify_api_keys("userId");
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON addressify_api_keys(key);

-- API Key Usage table
CREATE TABLE IF NOT EXISTS addressify_api_key_usage (
    id VARCHAR(30) PRIMARY KEY,
    "apiKeyId" VARCHAR(30) NOT NULL REFERENCES addressify_api_keys(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "ipAddress" VARCHAR(50),
    "userAgent" TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_apiKeyId ON addressify_api_key_usage("apiKeyId");
CREATE INDEX IF NOT EXISTS idx_api_key_usage_timestamp ON addressify_api_key_usage(timestamp);

-- Webhooks table
CREATE TABLE IF NOT EXISTS addressify_webhooks (
    id VARCHAR(30) PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES addressify_users(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhooks_userId ON addressify_webhooks("userId");

-- Webhook Logs table
CREATE TABLE IF NOT EXISTS addressify_webhook_logs (
    id VARCHAR(30) PRIMARY KEY,
    "webhookId" VARCHAR(30) NOT NULL REFERENCES addressify_webhooks(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response JSONB,
    "statusCode" INTEGER,
    attempt INTEGER DEFAULT 1,
    success BOOLEAN DEFAULT FALSE,
    error TEXT,
    "responseTime" INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhookId ON addressify_webhook_logs("webhookId");
CREATE INDEX IF NOT EXISTS idx_webhook_logs_timestamp ON addressify_webhook_logs(timestamp);

-- ============================================================
-- MASTER DATA TABLES
-- ============================================================

-- Provinces table
CREATE TABLE IF NOT EXISTS addressify_provinces (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20),
    "ghnId" INTEGER UNIQUE,
    "ghtkId" VARCHAR(50),
    "vtpId" VARCHAR(50),
    "nameExtensions" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_provinces_name ON addressify_provinces(name);
CREATE INDEX IF NOT EXISTS idx_provinces_ghnId ON addressify_provinces("ghnId");

-- Districts table
CREATE TABLE IF NOT EXISTS addressify_districts (
    id VARCHAR(30) PRIMARY KEY,
    "provinceId" VARCHAR(30) NOT NULL REFERENCES addressify_provinces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20),
    type INTEGER,
    "ghnId" INTEGER UNIQUE,
    "ghtkId" VARCHAR(50),
    "vtpId" VARCHAR(50),
    "supportType" INTEGER,
    "nameExtensions" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_districts_provinceId ON addressify_districts("provinceId");
CREATE INDEX IF NOT EXISTS idx_districts_name ON addressify_districts(name);
CREATE INDEX IF NOT EXISTS idx_districts_ghnId ON addressify_districts("ghnId");

-- Wards table
CREATE TABLE IF NOT EXISTS addressify_wards (
    id VARCHAR(30) PRIMARY KEY,
    "districtId" VARCHAR(30) NOT NULL REFERENCES addressify_districts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    "ghnCode" VARCHAR(50) UNIQUE,
    "ghtkId" VARCHAR(50),
    "vtpId" VARCHAR(50),
    "supportType" INTEGER,
    "canUpdateCOD" BOOLEAN DEFAULT FALSE,
    "nameExtensions" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wards_districtId ON addressify_wards("districtId");
CREATE INDEX IF NOT EXISTS idx_wards_name ON addressify_wards(name);
CREATE INDEX IF NOT EXISTS idx_wards_ghnCode ON addressify_wards("ghnCode");

-- Streets table (optional)
CREATE TABLE IF NOT EXISTS addressify_streets (
    id VARCHAR(30) PRIMARY KEY,
    "wardId" VARCHAR(30),
    "districtId" VARCHAR(30) NOT NULL,
    name VARCHAR(255) NOT NULL,
    "nameExtensions" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_streets_districtId ON addressify_streets("districtId");
CREATE INDEX IF NOT EXISTS idx_streets_name ON addressify_streets(name);

-- Processed Addresses table
CREATE TABLE IF NOT EXISTS addressify_processed_addresses (
    id VARCHAR(30) PRIMARY KEY,
    "originalAddress" TEXT NOT NULL,
    "streetNumber" VARCHAR(50),
    "streetName" VARCHAR(255),
    "wardName" VARCHAR(255),
    "districtName" VARCHAR(255),
    "provinceName" VARCHAR(255),
    "normalizedAddress" TEXT,
    "ghnProvinceId" INTEGER,
    "ghnDistrictId" INTEGER,
    "ghnWardCode" VARCHAR(50),
    "provinceConfidence" FLOAT,
    "districtConfidence" FLOAT,
    "wardConfidence" FLOAT,
    "isValid" BOOLEAN DEFAULT FALSE,
    "validationErrors" TEXT[] DEFAULT '{}',
    source VARCHAR(50),
    "userId" VARCHAR(50),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_processed_addresses_originalAddress ON addressify_processed_addresses("originalAddress");
CREATE INDEX IF NOT EXISTS idx_processed_addresses_location ON addressify_processed_addresses("provinceName", "districtName", "wardName");
CREATE INDEX IF NOT EXISTS idx_processed_addresses_ghn ON addressify_processed_addresses("ghnProvinceId", "ghnDistrictId");
CREATE INDEX IF NOT EXISTS idx_processed_addresses_createdAt ON addressify_processed_addresses("createdAt");
CREATE INDEX IF NOT EXISTS idx_processed_addresses_userId ON addressify_processed_addresses("userId");

-- ============================================================
-- FINAL GRANTS (run after Prisma migrations too)
-- ============================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO addressify_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO addressify_user;

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE 'Addressify database setup completed successfully!';
    RAISE NOTICE 'Database: addressify_db';
    RAISE NOTICE 'User: addressify_user';
    RAISE NOTICE 'Password: AddressifyVPS2025!@#';
END
$$;
