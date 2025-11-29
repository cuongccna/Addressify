import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST - Revoke (deactivate) API key
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    // Deactivate
    await prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'API key revoked successfully',
    })
  } catch (error) {
    console.error('Failed to revoke API key:', error)
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    )
  }
}
