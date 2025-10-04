// Simple in-memory rate limiter
// For production, use Redis or similar distributed cache

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Store: apiKeyId -> RateLimitEntry
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  const keysToDelete: string[] = []
  
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      keysToDelete.push(key)
    }
  })
  
  keysToDelete.forEach(key => rateLimitStore.delete(key))
}, 5 * 60 * 1000)

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if API key has exceeded rate limit
 * @param apiKeyId - API key ID
 * @param limit - Requests per minute (default: 100)
 * @returns RateLimitResult
 */
export function checkRateLimit(
  apiKeyId: string,
  limit: number = 100
): RateLimitResult {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  
  let entry = rateLimitStore.get(apiKeyId)
  
  // Create new entry if doesn't exist or expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(apiKeyId, entry)
  }
  
  // Increment count
  entry.count++
  
  const allowed = entry.count <= limit
  const remaining = Math.max(0, limit - entry.count)
  
  return {
    allowed,
    limit,
    remaining,
    reset: Math.floor(entry.resetAt / 1000), // Unix timestamp in seconds
  }
}

/**
 * Reset rate limit for API key
 * @param apiKeyId - API key ID
 */
export function resetRateLimit(apiKeyId: string): void {
  rateLimitStore.delete(apiKeyId)
}

/**
 * Get current rate limit status
 * @param apiKeyId - API key ID
 * @param limit - Requests per minute
 * @returns RateLimitResult
 */
export function getRateLimitStatus(
  apiKeyId: string,
  limit: number = 100
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(apiKeyId)
  
  if (!entry || entry.resetAt < now) {
    return {
      allowed: true,
      limit,
      remaining: limit,
      reset: Math.floor((now + 60 * 1000) / 1000),
    }
  }
  
  const remaining = Math.max(0, limit - entry.count)
  
  return {
    allowed: remaining > 0,
    limit,
    remaining,
    reset: Math.floor(entry.resetAt / 1000),
  }
}

// Rate limit headers for HTTP responses
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}
