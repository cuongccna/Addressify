import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/quote-history?shopId=xxx&limit=50 - Get quote history for a shop
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!shopId) {
      return NextResponse.json(
        { error: 'Missing required parameter: shopId' },
        { status: 400 }
      )
    }

    // Verify shop ownership
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    if (shop.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const quoteHistories = await prisma.quoteHistory.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ quoteHistories })
  } catch (error) {
    console.error('Error fetching quote history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote history' },
      { status: 500 }
    )
  }
}

// POST /api/quote-history - Save quote results
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      shopId,
      recipientName,
      recipientPhone,
      recipientAddress,
      normalizedAddress,
      province,
      district,
      ward,
      wardCode,
      confidence,
      quotes,
      weight,
      value,
      note,
    } = body

    // Validation
    if (!shopId || !recipientName || !recipientPhone || !recipientAddress || !quotes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify shop ownership
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    if (shop.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const quoteHistory = await prisma.quoteHistory.create({
      data: {
        shopId,
        recipientName,
        recipientPhone,
        recipientAddress,
        normalizedAddress: normalizedAddress || recipientAddress,
        province: province || '',
        district: district || '',
        ward: ward || '',
        wardCode,
        confidence: confidence || 0,
        quotes,
        weight: weight || 1000,
        value: value || 0,
        note,
      },
    })

    return NextResponse.json({ quoteHistory }, { status: 201 })
  } catch (error) {
    console.error('Error creating quote history:', error)
    return NextResponse.json(
      { error: 'Failed to create quote history' },
      { status: 500 }
    )
  }
}
