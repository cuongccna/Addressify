import { NextRequest, NextResponse } from 'next/server'
import { processAddressWithMasterData } from '@/utils/addressNormalizer.server'
import { processAddress } from '@/utils/addressNormalizer'
import type { AddressData } from '@/types/address'

export const dynamic = 'force-dynamic'

// POST /api/normalize - Process single or multiple addresses with master data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { addresses, useMasterData = true } = body as {
      addresses: string[]
      useMasterData?: boolean
    }

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid request: addresses array required' },
        { status: 400 }
      )
    }

    let results: AddressData[]

    if (useMasterData) {
      // Process with master data (async, fuzzy matching)
      results = await Promise.all(
        addresses.map(addr => processAddressWithMasterData(addr))
      )
    } else {
      // Process with regex only (sync, fallback)
      results = addresses.map(addr => processAddress(addr))
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      validCount: results.filter(r => r.isValid).length
    })

  } catch (error) {
    console.error('Address normalization error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process addresses'
      },
      { status: 500 }
    )
  }
}
