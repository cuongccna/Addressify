/**
 * Address Matcher using PostgreSQL database
 * Provides fuzzy matching for Vietnamese addresses
 */

import { PrismaClient, Province, District, Ward } from '@prisma/client'

const prisma = new PrismaClient()

// Cache for performance
let provincesCache: Province[] | null = null
let districtsCache: District[] | null = null
let wardsCache: Ward[] | null = null
let cacheLoadedAt: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function calculateSimilarity(a: string, b: string): number {
  const aNorm = normalizeText(a)
  const bNorm = normalizeText(b)

  if (aNorm === bNorm) return 1
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) return 0.8

  // Simple word overlap scoring
  const aWords = aNorm.split(" ")
  const bWords = bNorm.split(" ")
  const bSet = new Set(bWords)

  let intersectionCount = 0
  for (const word of aWords) {
    if (bSet.has(word)) intersectionCount++
  }

  const unionCount = new Set([...aWords, ...bWords]).size
  return unionCount > 0 ? intersectionCount / unionCount : 0
}

export interface MatchedProvince {
  id: string         // Database ID
  ghnId: number      // GHN Province ID
  name: string
  confidence: number
}

export interface MatchedDistrict {
  id: string
  ghnId: number
  name: string
  provinceId: string
  confidence: number
}

export interface MatchedWard {
  id: string
  ghnCode: string
  name: string
  districtId: string
  confidence: number
}

export class AddressMatcherDB {
  private provinces: Province[] = []
  private districts: District[] = []
  private wards: Ward[] = []

  async loadData(): Promise<void> {
    const now = Date.now()
    
    // Use cache if still valid
    if (provincesCache && districtsCache && wardsCache && (now - cacheLoadedAt) < CACHE_TTL) {
      this.provinces = provincesCache
      this.districts = districtsCache
      this.wards = wardsCache
      return
    }

    // Load from database
    const [provinces, districts, wards] = await Promise.all([
      prisma.province.findMany(),
      prisma.district.findMany(),
      prisma.ward.findMany()
    ])

    this.provinces = provinces
    this.districts = districts
    this.wards = wards

    // Update cache
    provincesCache = provinces
    districtsCache = districts
    wardsCache = wards
    cacheLoadedAt = now

    console.log(`[AddressMatcherDB] Loaded ${provinces.length} provinces, ${districts.length} districts, ${wards.length} wards`)
  }

  findProvince(query: string): MatchedProvince | null {
    if (!this.provinces.length) return null

    let bestMatch: { province: Province; score: number } | null = null

    for (const province of this.provinces) {
      let score = calculateSimilarity(query, province.name)

      // Check name extensions
      if (province.nameExtensions && province.nameExtensions.length > 0) {
        for (const ext of province.nameExtensions) {
          const extScore = calculateSimilarity(query, ext)
          if (extScore > score) {
            score = extScore
          }
        }
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { province, score }
      }
    }

    if (bestMatch && bestMatch.score >= 0.6) {
      return {
        id: bestMatch.province.id,
        ghnId: bestMatch.province.ghnId || 0,
        name: bestMatch.province.name,
        confidence: bestMatch.score
      }
    }

    return null
  }

  findDistrict(query: string, provinceId?: string): MatchedDistrict | null {
    if (!this.districts.length) return null

    const candidates = provinceId
      ? this.districts.filter((d) => d.provinceId === provinceId)
      : this.districts

    let bestMatch: { district: District; score: number } | null = null

    for (const district of candidates) {
      let score = calculateSimilarity(query, district.name)

      // Check name extensions
      if (district.nameExtensions && district.nameExtensions.length > 0) {
        for (const ext of district.nameExtensions) {
          const extScore = calculateSimilarity(query, ext)
          if (extScore > score) {
            score = extScore
          }
        }
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { district, score }
      }
    }

    if (bestMatch && bestMatch.score >= 0.6) {
      return {
        id: bestMatch.district.id,
        ghnId: bestMatch.district.ghnId || 0,
        name: bestMatch.district.name,
        provinceId: bestMatch.district.provinceId,
        confidence: bestMatch.score
      }
    }

    return null
  }

  findWard(query: string, districtId?: string): MatchedWard | null {
    if (!this.wards.length) return null

    const candidates = districtId
      ? this.wards.filter((w) => w.districtId === districtId)
      : this.wards

    let bestMatch: { ward: Ward; score: number } | null = null

    for (const ward of candidates) {
      let score = calculateSimilarity(query, ward.name)

      // Check name extensions
      if (ward.nameExtensions && ward.nameExtensions.length > 0) {
        for (const ext of ward.nameExtensions) {
          const extScore = calculateSimilarity(query, ext)
          if (extScore > score) {
            score = extScore
          }
        }
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { ward, score }
      }
    }

    if (bestMatch && bestMatch.score >= 0.6) {
      return {
        id: bestMatch.ward.id,
        ghnCode: bestMatch.ward.ghnCode || "",
        name: bestMatch.ward.name,
        districtId: bestMatch.ward.districtId,
        confidence: bestMatch.score
      }
    }

    return null
  }

  async resolveAddress(province: string, district: string, ward?: string): Promise<{
    province: MatchedProvince | null
    district: MatchedDistrict | null
    ward: MatchedWard | null
  }> {
    await this.loadData()

    const matchedProvince = this.findProvince(province)
    const matchedDistrict = this.findDistrict(
      district,
      matchedProvince?.id
    )
    const matchedWard = ward
      ? this.findWard(ward, matchedDistrict?.id)
      : null

    return {
      province: matchedProvince,
      district: matchedDistrict,
      ward: matchedWard
    }
  }
}

// Singleton instance
export const addressMatcherDB = new AddressMatcherDB()

// Helper function for backward compatibility
export async function resolveAddressFromDB(province: string, district: string, ward?: string) {
  return addressMatcherDB.resolveAddress(province, district, ward)
}
