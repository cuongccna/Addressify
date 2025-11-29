/**
 * Server-only address normalization functions
 * Uses PostgreSQL Master Data with fuzzy matching
 * 
 * ⚠️ WARNING: This file uses Prisma (server-side only)
 * Only import this in API routes or Server Components
 */

import { AddressData } from '@/types/address'
import { AddressMatcherDB } from '@/lib/master-data/address-matcher-db'
import { processAddress } from './addressNormalizer'

/**
 * Enhanced address processing with PostgreSQL Master Data fuzzy matching
 * 
 * @param rawAddress - Raw address string to normalize
 * @returns Promise<AddressData> with GHN IDs and confidence scores
 * 
 * @example
 * const result = await processAddressWithMasterData(
 *   "123 tên lữa p. an lạc a, bình tân, hcm"
 * )
 * // Returns: { ghnProvinceId: 202, ghnDistrictId: 1458, ... }
 */
export async function processAddressWithMasterData(rawAddress: string): Promise<AddressData> {
  // First extract using regex-based logic
  const basicResult = processAddress(rawAddress)
  
  try {
    // Try to match with master data from PostgreSQL
    const matcher = new AddressMatcherDB()
    
    console.log('[AddressNormalizer] Resolving address:', {
      province: basicResult.province,
      district: basicResult.district,
      ward: basicResult.ward
    })
    
    const resolved = await matcher.resolveAddress(
      basicResult.province,
      basicResult.district,
      basicResult.ward || undefined
    )
    
    console.log('[AddressNormalizer] Resolved result:', {
      province: resolved.province ? { ghnId: resolved.province.ghnId, name: resolved.province.name, confidence: resolved.province.confidence } : null,
      district: resolved.district ? { ghnId: resolved.district.ghnId, name: resolved.district.name, confidence: resolved.district.confidence } : null,
      ward: resolved.ward ? { ghnCode: resolved.ward.ghnCode, name: resolved.ward.name, confidence: resolved.ward.confidence } : null
    })
    
    if (resolved.province) {
      // Override with master data results
      return {
        ...basicResult,
        province: resolved.province.name,
        district: resolved.district?.name || basicResult.district,
        ward: resolved.ward?.name || basicResult.ward,
        ghnProvinceId: resolved.province.ghnId,
        ghnProvinceName: resolved.province.name,
        ghnDistrictId: resolved.district?.ghnId,
        ghnDistrictName: resolved.district?.name,
        ghnWardCode: resolved.ward?.ghnCode,
        ghnWardName: resolved.ward?.name,
        matchConfidence: {
          province: resolved.province.confidence,
          district: resolved.district?.confidence,
          ward: resolved.ward?.confidence
        },
        isValid: !!(resolved.province && resolved.district),
        normalizedAddress: [
          basicResult.streetNumber,
          basicResult.streetName,
          resolved.ward?.name || basicResult.ward,
          resolved.district?.name || basicResult.district,
          resolved.province.name,
          'Việt Nam'
        ].filter(Boolean).join(', ')
      }
    }
  } catch (error) {
    console.warn('Master data matching failed, using fallback:', error)
  }
  
  // Return basic result if master data not available
  return basicResult
}

/**
 * Process multiple addresses with master data (async version)
 * 
 * @param text - Multi-line text with one address per line
 * @returns Promise<AddressData[]> array of normalized addresses
 * 
 * @example
 * const results = await processAddressesFromTextWithMasterData(`
 *   123 tên lữa p. an lạc a, bình tân, hcm
 *   456 le duan, ben nghe, quan 1, tp ho chi minh
 * `)
 */
export async function processAddressesFromTextWithMasterData(text: string): Promise<AddressData[]> {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  // Process in parallel for better performance
  return await Promise.all(lines.map(line => processAddressWithMasterData(line)))
}
