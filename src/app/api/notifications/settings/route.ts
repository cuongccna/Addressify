import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET - Get notification settings
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { notificationSettings: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      settings: dbUser.notificationSettings || {
        quoteGenerated: false,
        dailySummary: false,
        weeklySummary: true,
        priceAlerts: true,
        failedQuotes: true,
      },
    })
  } catch (error) {
    console.error('Failed to get notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to get notification settings' },
      { status: 500 }
    )
  }
}

// PUT - Update notification settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings format' },
        { status: 400 }
      )
    }

    // Validate settings keys
    const validKeys = ['quoteGenerated', 'dailySummary', 'weeklySummary', 'priceAlerts', 'failedQuotes']
    const hasInvalidKeys = Object.keys(settings).some(key => !validKeys.includes(key))
    
    if (hasInvalidKeys) {
      return NextResponse.json(
        { error: 'Invalid settings keys' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { notificationSettings: settings },
    })

    return NextResponse.json({
      message: 'Notification settings updated',
      settings: updatedUser.notificationSettings,
    })
  } catch (error) {
    console.error('Failed to update notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}
