import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { triggerWebhook } from '@/lib/webhooks/trigger'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/shops/[id] - Get a specific shop
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const shop = await prisma.shop.findUnique({
      where: { id },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    // Verify ownership
    if (shop.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error fetching shop:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shop' },
      { status: 500 }
    )
  }
}

// PATCH /api/shops/[id] - Update a shop
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Verify ownership
    const existingShop = await prisma.shop.findUnique({
      where: { id },
    })

    if (!existingShop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    if (existingShop.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const shop = await prisma.shop.update({
      where: { id },
      data: {
        ...body,
        userId: user.id, // Ensure userId cannot be changed
      },
    })

    // Trigger webhook asynchronously
    triggerWebhook(user.id, 'shop.updated', {
      shopId: shop.id,
      changes: body,
      updatedAt: shop.updatedAt.toISOString(),
    }).catch(error => {
      console.error('Failed to trigger shop.updated webhook:', error);
    });

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error updating shop:', error)
    return NextResponse.json(
      { error: 'Failed to update shop' },
      { status: 500 }
    )
  }
}

// DELETE /api/shops/[id] - Delete a shop
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Verify ownership
    const existingShop = await prisma.shop.findUnique({
      where: { id },
    })

    if (!existingShop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    if (existingShop.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.shop.delete({
      where: { id },
    })

    // Trigger webhook asynchronously
    triggerWebhook(user.id, 'shop.deleted', {
      shopId: id,
      deletedAt: new Date().toISOString(),
    }).catch(error => {
      console.error('Failed to trigger shop.deleted webhook:', error);
    });

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting shop:', error)
    return NextResponse.json(
      { error: 'Failed to delete shop' },
      { status: 500 }
    )
  }
}
