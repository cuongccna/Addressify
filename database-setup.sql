-- Addressify Database Setup Script
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/yzeuoubfqtpnsqyvrukc/sql

-- =====================================================
-- ADDRESSIFY TABLES (prefix: addressify_)
-- =====================================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS public.addressify_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Shops table
CREATE TABLE IF NOT EXISTS public.addressify_shops (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "senderDistrict" TEXT NOT NULL,
    "senderProvince" TEXT NOT NULL,
    "ghnProvinceId" TEXT,
    "ghnDistrictId" TEXT,
    "ghnWardCode" TEXT,
    "ghnShopId" TEXT,
    "ghtkPickAddress" TEXT,
    "ghtkPickProvince" TEXT,
    "ghtkPickDistrict" TEXT,
    "ghtkPickWard" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "addressify_shops_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES public.addressify_users(id) 
        ON DELETE CASCADE
);

-- 3. Quote histories table
CREATE TABLE IF NOT EXISTS public.addressify_quote_histories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "shopId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "normalizedAddress" TEXT NOT NULL,
    province TEXT NOT NULL,
    district TEXT NOT NULL,
    ward TEXT NOT NULL,
    "wardCode" TEXT,
    confidence DOUBLE PRECISION NOT NULL,
    quotes JSONB NOT NULL,
    weight INTEGER DEFAULT 1000 NOT NULL,
    value INTEGER DEFAULT 0 NOT NULL,
    note TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "addressify_quote_histories_shopId_fkey" 
        FOREIGN KEY ("shopId") 
        REFERENCES public.addressify_shops(id) 
        ON DELETE CASCADE
);

-- =====================================================
-- INDEXES for better performance
-- =====================================================

CREATE INDEX IF NOT EXISTS "addressify_shops_userId_idx" 
    ON public.addressify_shops("userId");

CREATE INDEX IF NOT EXISTS "addressify_quote_histories_shopId_createdAt_idx" 
    ON public.addressify_quote_histories("shopId", "createdAt");

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Optional but recommended
-- =====================================================

-- Enable RLS
ALTER TABLE public.addressify_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addressify_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addressify_quote_histories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view own data" ON public.addressify_users;
DROP POLICY IF EXISTS "Users can view own shops" ON public.addressify_shops;
DROP POLICY IF EXISTS "Users can insert own shops" ON public.addressify_shops;
DROP POLICY IF EXISTS "Users can update own shops" ON public.addressify_shops;
DROP POLICY IF EXISTS "Users can delete own shops" ON public.addressify_shops;
DROP POLICY IF EXISTS "Users can view own quote histories" ON public.addressify_quote_histories;
DROP POLICY IF EXISTS "Users can insert own quote histories" ON public.addressify_quote_histories;

-- Users can only see their own data
CREATE POLICY "Users can view own data" 
    ON public.addressify_users FOR SELECT 
    USING (auth.uid()::text = id);

-- Users can only manage their own shops
CREATE POLICY "Users can view own shops" 
    ON public.addressify_shops FOR SELECT 
    USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own shops" 
    ON public.addressify_shops FOR INSERT 
    WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own shops" 
    ON public.addressify_shops FOR UPDATE 
    USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own shops" 
    ON public.addressify_shops FOR DELETE 
    USING (auth.uid()::text = "userId");

-- Users can only see quote histories of their shops
CREATE POLICY "Users can view own quote histories" 
    ON public.addressify_quote_histories FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.addressify_shops 
            WHERE id = "shopId" AND "userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own quote histories" 
    ON public.addressify_quote_histories FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.addressify_shops 
            WHERE id = "shopId" AND "userId" = auth.uid()::text
        )
    );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE tablename LIKE 'addressify_%'
ORDER BY tablename;

-- Show table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name LIKE 'addressify_%'
ORDER BY table_name, ordinal_position;
