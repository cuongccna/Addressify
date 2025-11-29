import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { 
  generateApiKey, 
  hashApiKey, 
  maskApiKey,
  parsePermissions,
  type ApiKeyType 
} from '@/lib/api-keys/generate'

// GET - List all API keys for user
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        key: true, // Will be masked
        keyPrefix: true,
        permissions: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        rateLimit: true,
        createdAt: true,
      },
    })

    // Mask the keys before sending
    const maskedKeys = apiKeys.map(key => ({
      ...key,
      key: maskApiKey(key.key),
      permissions: parsePermissions(key.permissions),
    }))

    return NextResponse.json({ apiKeys: maskedKeys })
  } catch (error) {
    console.error('Failed to get API keys:', error)
    return NextResponse.json(
      { error: 'Failed to get API keys' },
      { status: 500 }
    )
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, permissions, rateLimit, expiresInDays } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json(
        { error: 'At least one permission is required' },
        { status: 400 }
      )
    }

    // Generate API key
    const apiKey = generateApiKey(type as ApiKeyType || 'live')
    const keyHash = hashApiKey(apiKey)

    // Calculate expiration date
    let expiresAt: Date | null = null
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    }

    // Create in database
    const newKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: name.trim(),
        key: keyHash, // Store hash, not plain key
        keyPrefix: type === 'test' ? 'addr_test' : 'addr_live',
        permissions: JSON.stringify(permissions),
        rateLimit: rateLimit || 100,
        expiresAt,
        isActive: true,
      },
    })

    return NextResponse.json({
      message: 'API key created successfully',
      key: apiKey, // Return plain key ONCE
      id: newKey.id,
      name: newKey.name,
    })
  } catch (error) {
    console.error('Failed to create API key:', error)
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    )
  }
}
