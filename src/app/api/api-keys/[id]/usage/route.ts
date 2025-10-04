import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// GET - Get API key usage statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

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

    // Get usage in the last N days
    const since = new Date()
    since.setDate(since.getDate() - days)

    const usage = await prisma.apiKeyUsage.findMany({
      where: {
        apiKeyId: id,
        timestamp: {
          gte: since,
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 1000, // Limit to 1000 recent entries
    })

    // Calculate statistics
    type UsageEntry = typeof usage[0]
    
    const total = usage.length
    const byEndpoint = usage.reduce((acc: Record<string, number>, entry: UsageEntry) => {
      acc[entry.endpoint] = (acc[entry.endpoint] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byMethod = usage.reduce((acc: Record<string, number>, entry: UsageEntry) => {
      acc[entry.method] = (acc[entry.method] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byStatusCode = usage.reduce((acc: Record<string, number>, entry: UsageEntry) => {
      const code = entry.statusCode.toString()
      acc[code] = (acc[code] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const avgResponseTime = total > 0
      ? usage.reduce((sum: number, entry: UsageEntry) => sum + entry.responseTime, 0) / total
      : 0

    // Get usage by day
    const byDay = usage.reduce((acc: Record<string, number>, entry: UsageEntry) => {
      const day = new Date(entry.timestamp).toISOString().split('T')[0]
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      stats: {
        total,
        avgResponseTime: Math.round(avgResponseTime),
        byEndpoint,
        byMethod,
        byStatusCode,
        byDay,
      },
      recentUsage: usage.slice(0, 50), // Return 50 most recent
    })
  } catch (error) {
    console.error('Failed to get API key usage:', error)
    return NextResponse.json(
      { error: 'Failed to get API key usage' },
      { status: 500 }
    )
  }
}
