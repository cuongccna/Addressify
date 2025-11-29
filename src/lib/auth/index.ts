/**
 * Authentication Library using Prisma
 * Replaces Supabase Auth with custom session-based authentication
 */

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Session expiry time (7 days)
const SESSION_EXPIRY_DAYS = 7

/**
 * Hash password using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':')
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return hash === verifyHash
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a new session for user
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)
  
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })
  
  return token
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60, // in seconds
    path: '/',
  })
}

/**
 * Get session token from cookie
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('session')?.value || null
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

/**
 * Validate session and get user
 */
export async function validateSession(): Promise<{
  user: { id: string; email: string; name: string | null } | null
  error: string | null
}> {
  try {
    const token = await getSessionToken()
    
    if (!token) {
      return { user: null, error: 'No session token' }
    }
    
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })
    
    if (!session) {
      return { user: null, error: 'Invalid session' }
    }
    
    if (new Date() > session.expiresAt) {
      // Session expired, clean it up
      await prisma.session.delete({ where: { id: session.id } })
      return { user: null, error: 'Session expired' }
    }
    
    return { user: session.user, error: null }
  } catch (error) {
    console.error('Session validation error:', error)
    return { user: null, error: 'Session validation failed' }
  }
}

/**
 * Get current authenticated user (for API routes)
 */
export async function getCurrentUser(): Promise<{
  id: string
  email: string
  name: string | null
} | null> {
  const { user } = await validateSession()
  return user
}

/**
 * Delete session (logout)
 */
export async function deleteSession(): Promise<void> {
  const token = await getSessionToken()
  
  if (token) {
    await prisma.session.deleteMany({
      where: { token },
    })
  }
  
  await clearSessionCookie()
}

/**
 * Delete all sessions for user (force logout everywhere)
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  })
}

/**
 * Clean up expired sessions (for cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
  return result.count
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, name?: string): Promise<{
  user: { id: string; email: string; name: string | null } | null
  error: string | null
}> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUser) {
      return { user: null, error: 'Email đã được sử dụng' }
    }
    
    // Validate password
    if (password.length < 6) {
      return { user: null, error: 'Mật khẩu phải có ít nhất 6 ký tự' }
    }
    
    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })
    
    return { user, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { user: null, error: 'Đăng ký thất bại' }
  }
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string): Promise<{
  user: { id: string; email: string; name: string | null } | null
  token: string | null
  error: string | null
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    })
    
    if (!user) {
      return { user: null, token: null, error: 'Email hoặc mật khẩu không đúng' }
    }
    
    const isValidPassword = await verifyPassword(password, user.password)
    
    if (!isValidPassword) {
      return { user: null, token: null, error: 'Email hoặc mật khẩu không đúng' }
    }
    
    // Create session
    const token = await createSession(user.id)
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
      error: null,
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return { user: null, token: null, error: 'Đăng nhập thất bại' }
  }
}
