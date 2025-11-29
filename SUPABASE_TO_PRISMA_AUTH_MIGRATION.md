# Supabase to Prisma Auth Migration

## Overview

This document details the migration from Supabase Auth to custom Prisma-based session authentication.

## Changes Made

### 1. Schema Updates (`prisma/schema.prisma`)

**Added to User model:**
```prisma
password String  // Hashed password using PBKDF2
```

**New Session model:**
```prisma
model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([userId])
  @@map("addressify_sessions")
  @@schema("public")
}
```

### 2. New Authentication Library (`src/lib/auth/index.ts`)

Custom authentication implementation with:

- **Password hashing:** PBKDF2 with 100,000 iterations
- **Session management:** 7-day sessions with httpOnly cookies
- **Key functions:**
  - `hashPassword()` - Hash passwords securely
  - `verifyPassword()` - Verify password against hash
  - `createSession()` - Create new session in database
  - `validateSession()` - Validate session token from request
  - `getCurrentUser()` - Get authenticated user from request
  - `signUp()` - Register new user
  - `signIn()` - Authenticate and create session
  - `deleteSession()` - Remove specific session
  - `deleteUserSessions()` - Remove all sessions for a user
  - `cleanupExpiredSessions()` - Remove expired sessions

### 3. Updated API Routes

**Auth routes (`src/app/api/auth/`):**
- `signup/route.ts` - Uses `signUp()` from auth library
- `login/route.ts` - Uses `signIn()` from auth library  
- `logout/route.ts` - Uses `deleteSession()` from auth library
- `user/route.ts` - Uses `getCurrentUser()` from auth library

**Protected API routes (12+ files):**
All routes using `createClient()` from Supabase were updated to use `getCurrentUser()`:
- `/api/api-keys/`
- `/api/notifications/settings/`
- `/api/quote-history/`
- `/api/shops/`
- `/api/webhooks/`
- etc.

### 4. Updated Client Components

**AuthContext (`src/contexts/AuthContext.tsx`):**
- Removed all Supabase imports
- Uses fetch to `/api/auth/*` endpoints
- Manages user state via API calls

**UserMenu (`src/components/layout/UserMenu.tsx`):**
- Changed `user.user_metadata?.name` to `user.name`

### 5. Deleted Files

- `src/lib/supabase/` folder (entire directory removed)

### 6. Package Changes

**Removed packages:**
```json
"@supabase/auth-helpers-nextjs": "removed",
"@supabase/ssr": "removed", 
"@supabase/supabase-js": "removed"
```

### 7. Environment Variables

**Removed (no longer needed for auth):**
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**Note:** Database still uses Supabase PostgreSQL, but auth is now handled by Prisma.

## Post-Migration Steps

1. **Run database migration:**
   ```bash
   npx prisma db push
   ```

2. **Start scheduler (production):**
   - Call `/api/jobs/start` endpoint, OR
   - Use process manager to initialize scheduler

3. **Test authentication flow:**
   - Sign up new user
   - Sign in
   - Access protected routes
   - Sign out

## Security Considerations

- Passwords are hashed using PBKDF2 with 100,000 iterations
- Session tokens are random UUIDs
- Sessions stored in httpOnly cookies
- Sessions expire after 7 days
- Cascade delete removes sessions when user is deleted

## Build Status

✅ Build successful (40/40 pages)
✅ TypeScript compilation passed
✅ All API routes updated
