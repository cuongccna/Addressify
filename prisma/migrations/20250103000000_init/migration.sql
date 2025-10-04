-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."addressify_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addressify_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."addressify_shops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addressify_shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."addressify_quote_histories" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "normalizedAddress" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "wardCode" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "quotes" JSONB NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1000,
    "value" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addressify_quote_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "addressify_users_email_key" ON "public"."addressify_users"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "addressify_shops_userId_idx" ON "public"."addressify_shops"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "addressify_quote_histories_shopId_createdAt_idx" ON "public"."addressify_quote_histories"("shopId", "createdAt");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'addressify_shops_userId_fkey'
    ) THEN
        ALTER TABLE "public"."addressify_shops" ADD CONSTRAINT "addressify_shops_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "public"."addressify_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'addressify_quote_histories_shopId_fkey'
    ) THEN
        ALTER TABLE "public"."addressify_quote_histories" ADD CONSTRAINT "addressify_quote_histories_shopId_fkey" 
        FOREIGN KEY ("shopId") REFERENCES "public"."addressify_shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
