/**
 * Master Data Service for PostgreSQL
 * Sync data from GHN API to local PostgreSQL database
 */

import { PrismaClient } from '@prisma/client'
import { getServerEnv } from '@/config/env'
import axios from 'axios'

const prisma = new PrismaClient()

export interface GHNProvince {
  ProvinceID: number
  ProvinceName: string
  Code?: string
  NameExtension?: string[]
}

export interface GHNDistrict {
  DistrictID: number
  ProvinceID: number
  DistrictName: string
  Code?: string
  Type?: number
  SupportType?: number
  NameExtension?: string[]
}

export interface GHNWard {
  WardCode: string
  DistrictID: number
  WardName: string
  NameExtension?: string[]
  CanUpdateCOD?: boolean
  SupportType?: number
}

interface GHNApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface SyncResult {
  provinces: { created: number; updated: number; total: number }
  districts: { created: number; updated: number; skipped: number; total: number }
  wards: { created: number; updated: number; skipped: number; total: number }
}

/**
 * Master Data Database Service
 * Handles syncing GHN master data to PostgreSQL
 */
export class MasterDataDBService {
  private baseURL: string
  private token: string

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL
    this.token = token
  }

  static fromEnv(): MasterDataDBService {
    const env = getServerEnv()
    return new MasterDataDBService(env.GHN_API_BASE_URL, env.GHN_API_TOKEN)
  }

  // ==================== FETCH FROM GHN API ====================

  async fetchProvinces(): Promise<GHNProvince[]> {
    const response = await axios.get<GHNApiResponse<GHNProvince[]>>(
      `${this.baseURL}/master-data/province`,
      { headers: { Token: this.token } }
    )

    if (response.data.code !== 200) {
      throw new Error(`GHN API error: ${response.data.message}`)
    }

    return response.data.data
  }

  async fetchDistricts(): Promise<GHNDistrict[]> {
    const response = await axios.get<GHNApiResponse<GHNDistrict[]>>(
      `${this.baseURL}/master-data/district`,
      { headers: { Token: this.token } }
    )

    if (response.data.code !== 200) {
      throw new Error(`GHN API error: ${response.data.message}`)
    }

    return response.data.data
  }

  async fetchWards(districtId: number): Promise<GHNWard[]> {
    const response = await axios.get<GHNApiResponse<GHNWard[]>>(
      `${this.baseURL}/master-data/ward?district_id=${districtId}`,
      { headers: { Token: this.token } }
    )

    if (response.data.code !== 200) {
      throw new Error(`GHN API error: ${response.data.message}`)
    }

    return response.data.data || []
  }

  // ==================== SYNC TO DATABASE ====================

  async syncProvinces(): Promise<{ created: number; updated: number; total: number }> {
    const provinces = await this.fetchProvinces()
    let created = 0
    let updated = 0

    for (const province of provinces) {
      const existing = await prisma.province.findUnique({
        where: { ghnId: province.ProvinceID }
      })

      const data = {
        name: province.ProvinceName,
        code: province.Code || null,
        ghnId: province.ProvinceID,
        nameExtensions: province.NameExtension || []
      }

      if (existing) {
        await prisma.province.update({
          where: { id: existing.id },
          data
        })
        updated++
      } else {
        await prisma.province.create({ data })
        created++
      }
    }

    return { created, updated, total: provinces.length }
  }

  async syncDistricts(): Promise<{ created: number; updated: number; skipped: number; total: number }> {
    const districts = await this.fetchDistricts()
    let created = 0
    let updated = 0
    let skipped = 0

    // Build province map for lookup
    const provinces = await prisma.province.findMany({
      select: { id: true, ghnId: true }
    })
    const provinceMap = new Map(provinces.map(p => [p.ghnId, p.id]))

    for (const district of districts) {
      const provinceDbId = provinceMap.get(district.ProvinceID)

      if (!provinceDbId) {
        skipped++
        continue
      }

      const existing = await prisma.district.findUnique({
        where: { ghnId: district.DistrictID }
      })

      const data = {
        provinceId: provinceDbId,
        name: district.DistrictName,
        code: district.Code || null,
        type: district.Type || null,
        ghnId: district.DistrictID,
        supportType: district.SupportType || null,
        nameExtensions: district.NameExtension || []
      }

      if (existing) {
        await prisma.district.update({
          where: { id: existing.id },
          data
        })
        updated++
      } else {
        await prisma.district.create({ data })
        created++
      }
    }

    return { created, updated, skipped, total: districts.length }
  }

  async syncWards(): Promise<{ created: number; updated: number; skipped: number; total: number }> {
    // Get all districts
    const districts = await prisma.district.findMany({
      select: { id: true, ghnId: true }
    })
    const districtMap = new Map(districts.map(d => [d.ghnId, d.id]))

    let created = 0
    let updated = 0
    let skipped = 0
    let total = 0

    // Fetch wards for each district
    for (const district of districts) {
      if (!district.ghnId) continue

      try {
        const wards = await this.fetchWards(district.ghnId)
        total += wards.length

        for (const ward of wards) {
          const districtDbId = districtMap.get(ward.DistrictID)

          if (!districtDbId) {
            skipped++
            continue
          }

          const existing = await prisma.ward.findUnique({
            where: { ghnCode: ward.WardCode }
          })

          const data = {
            districtId: districtDbId,
            name: ward.WardName,
            ghnCode: ward.WardCode,
            supportType: ward.SupportType || null,
            canUpdateCOD: ward.CanUpdateCOD || false,
            nameExtensions: ward.NameExtension || []
          }

          if (existing) {
            await prisma.ward.update({
              where: { id: existing.id },
              data
            })
            updated++
          } else {
            await prisma.ward.create({ data })
            created++
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error) {
        console.warn(`Failed to sync wards for district ${district.ghnId}:`, error)
      }
    }

    return { created, updated, skipped, total }
  }

  async syncAll(): Promise<SyncResult> {
    console.log('[MasterData] Starting full sync...')

    const provincesResult = await this.syncProvinces()
    console.log(`[MasterData] Provinces: ${provincesResult.created} created, ${provincesResult.updated} updated`)

    const districtsResult = await this.syncDistricts()
    console.log(`[MasterData] Districts: ${districtsResult.created} created, ${districtsResult.updated} updated`)

    const wardsResult = await this.syncWards()
    console.log(`[MasterData] Wards: ${wardsResult.created} created, ${wardsResult.updated} updated`)

    return {
      provinces: provincesResult,
      districts: districtsResult,
      wards: wardsResult
    }
  }

  // ==================== READ FROM DATABASE ====================

  async getProvinces() {
    return prisma.province.findMany({
      orderBy: { name: 'asc' }
    })
  }

  async getDistricts(provinceGhnId?: number) {
    if (provinceGhnId) {
      const province = await prisma.province.findUnique({
        where: { ghnId: provinceGhnId }
      })
      if (!province) return []

      return prisma.district.findMany({
        where: { provinceId: province.id },
        orderBy: { name: 'asc' }
      })
    }

    return prisma.district.findMany({
      orderBy: { name: 'asc' }
    })
  }

  async getWards(districtGhnId?: number) {
    if (districtGhnId) {
      const district = await prisma.district.findUnique({
        where: { ghnId: districtGhnId }
      })
      if (!district) return []

      return prisma.ward.findMany({
        where: { districtId: district.id },
        orderBy: { name: 'asc' }
      })
    }

    return prisma.ward.findMany({
      orderBy: { name: 'asc' }
    })
  }

  async getStats() {
    const [provinces, districts, wards] = await Promise.all([
      prisma.province.count(),
      prisma.district.count(),
      prisma.ward.count()
    ])

    return { provinces, districts, wards }
  }
}

// Export singleton instance
export const masterDataDB = MasterDataDBService.fromEnv()
