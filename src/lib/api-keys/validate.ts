import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashApiKey, isValidApiKeyFormat, parsePermissions, hasPermission } from './generate'
import { checkRateLimit, getRateLimitHeaders } from './rate-limit'

export interface ApiKeyContext {
  apiKeyId: string
  userId: string
  permissions: string[]
  rateLimit: number
}

/**
 * Validate API key from request headers
 * Returns ApiKeyContext if valid, null if invalid
 */
export async function validateApiKey(request: NextRequest): Promise<ApiKeyContext | null> {
  // Get API key from Authorization header
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const apiKey = authHeader.substring(7) // Remove "Bearer " prefix
  
  // Validate format
  if (!isValidApiKeyFormat(apiKey)) {
    return null
  }
  
  // Hash the key for lookup
  const keyHash = hashApiKey(apiKey)
  
  try {
    // Find API key in database
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        key: keyHash,
        isActive: true,
      },
      select: {
        id: true,
        userId: true,
        permissions: true,
        rateLimit: true,
        expiresAt: true,
      },
    })
    
    if (!apiKeyRecord) {
      return null
    }
    
    // Check if key has expired
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      return null
    }
    
    // Update last used timestamp (async, don't wait)
    prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    }).catch(err => console.error('Failed to update lastUsedAt:', err))
    
    return {
      apiKeyId: apiKeyRecord.id,
      userId: apiKeyRecord.userId,
      permissions: parsePermissions(apiKeyRecord.permissions),
      rateLimit: apiKeyRecord.rateLimit,
    }
  } catch (error) {
    console.error('API key validation error:', error)
    return null
  }
}

/**
 * Middleware to require valid API key
 */
export async function requireApiKey(
  request: NextRequest,
  requiredPermission?: string
): Promise<{ context: ApiKeyContext } | NextResponse> {
  const context = await validateApiKey(request)
  
  if (!context) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    )
  }
  
  // Check rate limit
  const rateLimitResult = checkRateLimit(context.apiKeyId, context.rateLimit)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    )
  }
  
  // Check permission if required
  if (requiredPermission && !hasPermission(context.permissions, requiredPermission)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  // Log API usage (async, don't wait)
  logApiUsage(request, context).catch(err => 
    console.error('Failed to log API usage:', err)
  )
  
  return { context }
}

/**
 * Log API key usage
 */
async function logApiUsage(request: NextRequest, context: ApiKeyContext): Promise<void> {
  const url = new URL(request.url)
  const startTime = Date.now()
  
  try {
    await prisma.apiKeyUsage.create({
      data: {
        apiKeyId: context.apiKeyId,
        endpoint: url.pathname,
        method: request.method || 'GET',
        statusCode: 200, // Will be updated by actual response
        responseTime: Date.now() - startTime,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })
  } catch (error) {
    console.error('Failed to log API usage:', error)
  }
}

/**
 * Get rate limit headers for response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  apiKeyId: string,
  rateLimit: number
): NextResponse {
  const headers = getRateLimitHeaders(checkRateLimit(apiKeyId, rateLimit))
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}
