import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { triggerShopCreated } from '@/lib/webhooks/trigger'

// GET /api/shops - Get all shops for current user
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shops = await prisma.shop.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ shops })
  } catch (error) {
    console.error('Error fetching shops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
      { status: 500 }
    )
  }
}

// POST /api/shops - Create a new shop
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      senderAddress,
      senderDistrict,
      senderProvince,
      ghnProvinceId,
      ghnDistrictId,
      ghnWardCode,
      ghnShopId,
      ghtkPickAddress,
      ghtkPickProvince,
      ghtkPickDistrict,
      ghtkPickWard,
    } = body

    // Validation
    if (!name || !senderAddress || !senderDistrict || !senderProvince) {
      return NextResponse.json(
        { error: 'Missing required fields: name, senderAddress, senderDistrict, senderProvince' },
        { status: 400 }
      )
    }

    const shop = await prisma.shop.create({
      data: {
        userId: user.id,
        name,
        senderAddress,
        senderDistrict,
        senderProvince,
        ghnProvinceId,
        ghnDistrictId,
        ghnWardCode,
        ghnShopId,
        ghtkPickAddress,
        ghtkPickProvince,
        ghtkPickDistrict,
        ghtkPickWard,
      },
    })

    // Trigger webhook asynchronously
    triggerShopCreated(user.id, {
      id: shop.id,
      name: shop.name,
      description: `${shop.senderAddress}, ${shop.senderDistrict}, ${shop.senderProvince}`,
      createdAt: shop.createdAt,
    }).catch(error => {
      console.error('Failed to trigger shop.created webhook:', error);
    });

    return NextResponse.json({ shop }, { status: 201 })
  } catch (error) {
    console.error('Error creating shop:', error)
    return NextResponse.json(
      { error: 'Failed to create shop' },
      { status: 500 }
    )
  }
}
