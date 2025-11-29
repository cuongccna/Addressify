/**
 * Script để migrate master data từ JSON files sang PostgreSQL
 * 
 * Chạy: npx tsx scripts/migrate-master-data.ts
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

const MASTER_DATA_DIR = path.join(process.cwd(), 'src', 'data', 'master-data')

interface GHNProvince {
  ProvinceID: number
  ProvinceName: string
  Code?: string
  NameExtension?: string[]
}

interface GHNDistrict {
  DistrictID: number
  ProvinceID: number
  DistrictName: string
  Code?: string
  Type?: number
  SupportType?: number
  NameExtension?: string[]
}

interface GHNWard {
  WardCode: string
  DistrictID: number
  WardName: string
  NameExtension?: string[]
  CanUpdateCOD?: boolean
  SupportType?: number
}

async function loadJsonFile<T>(filename: string): Promise<T> {
  const filepath = path.join(MASTER_DATA_DIR, filename)
  const content = await fs.readFile(filepath, 'utf-8')
  return JSON.parse(content)
}

async function migrateProvinces(): Promise<Map<number, string>> {
  console.log('📍 Migrating provinces...')
  
  const provinces = await loadJsonFile<GHNProvince[]>('ghn-provinces.json')
  const ghnIdToDbId = new Map<number, string>()
  
  let created = 0
  let updated = 0
  
  for (const province of provinces) {
    const existing = await prisma.province.findFirst({
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
      ghnIdToDbId.set(province.ProvinceID, existing.id)
      updated++
    } else {
      const newProvince = await prisma.province.create({ data })
      ghnIdToDbId.set(province.ProvinceID, newProvince.id)
      created++
    }
  }
  
  console.log(`   ✅ Provinces: ${created} created, ${updated} updated (total: ${provinces.length})`)
  return ghnIdToDbId
}

async function migrateDistricts(provinceMap: Map<number, string>): Promise<Map<number, string>> {
  console.log('📍 Migrating districts...')
  
  const districts = await loadJsonFile<GHNDistrict[]>('ghn-districts.json')
  const ghnIdToDbId = new Map<number, string>()
  
  let created = 0
  let updated = 0
  let skipped = 0
  
  for (const district of districts) {
    const provinceDbId = provinceMap.get(district.ProvinceID)
    
    if (!provinceDbId) {
      console.warn(`   ⚠️ Skipping district ${district.DistrictName}: Province ${district.ProvinceID} not found`)
      skipped++
      continue
    }
    
    const existing = await prisma.district.findFirst({
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
      ghnIdToDbId.set(district.DistrictID, existing.id)
      updated++
    } else {
      const newDistrict = await prisma.district.create({ data })
      ghnIdToDbId.set(district.DistrictID, newDistrict.id)
      created++
    }
  }
  
  console.log(`   ✅ Districts: ${created} created, ${updated} updated, ${skipped} skipped (total: ${districts.length})`)
  return ghnIdToDbId
}

async function migrateWards(districtMap: Map<number, string>): Promise<void> {
  console.log('📍 Migrating wards...')
  
  // Load all wards from the combined file
  let allWards: GHNWard[] = []
  
  try {
    allWards = await loadJsonFile<GHNWard[]>('ghn-all-wards.json')
  } catch {
    console.log('   ⚠️ ghn-all-wards.json not found, loading from individual files...')
    
    // Load from individual ward files
    const files = await fs.readdir(MASTER_DATA_DIR)
    const wardFiles = files.filter(f => f.startsWith('ghn-wards-') && f.endsWith('.json'))
    
    for (const file of wardFiles) {
      const wards = await loadJsonFile<GHNWard[]>(file)
      allWards.push(...wards)
    }
  }
  
  console.log(`   📦 Found ${allWards.length} wards to process...`)
  
  let created = 0
  let updated = 0
  let skipped = 0
  
  // Process in batches for better performance
  const batchSize = 100
  const totalBatches = Math.ceil(allWards.length / batchSize)
  
  for (let i = 0; i < allWards.length; i += batchSize) {
    const batch = allWards.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    
    process.stdout.write(`\r   ⏳ Processing batch ${batchNum}/${totalBatches}...`)
    
    for (const ward of batch) {
      const districtDbId = districtMap.get(ward.DistrictID)
      
      if (!districtDbId) {
        skipped++
        continue
      }
      
      const existing = await prisma.ward.findFirst({
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
  }
  
  console.log(`\n   ✅ Wards: ${created} created, ${updated} updated, ${skipped} skipped (total: ${allWards.length})`)
}

async function printSummary(): Promise<void> {
  console.log('\n📊 Database Summary:')
  
  const [provinces, districts, wards] = await Promise.all([
    prisma.province.count(),
    prisma.district.count(),
    prisma.ward.count()
  ])
  
  console.log(`   - Provinces: ${provinces}`)
  console.log(`   - Districts: ${districts}`)
  console.log(`   - Wards: ${wards}`)
  
  // Sample data
  console.log('\n📋 Sample data:')
  
  const sampleProvince = await prisma.province.findFirst({
    where: { name: { contains: 'Hồ Chí Minh' } },
    include: {
      districts: {
        take: 3,
        include: {
          wards: { take: 2 }
        }
      }
    }
  })
  
  if (sampleProvince) {
    console.log(`   Province: ${sampleProvince.name} (GHN ID: ${sampleProvince.ghnId})`)
    for (const district of sampleProvince.districts) {
      console.log(`     - District: ${district.name} (GHN ID: ${district.ghnId})`)
      for (const ward of district.wards) {
        console.log(`       - Ward: ${ward.name} (GHN Code: ${ward.ghnCode})`)
      }
    }
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting master data migration from JSON to PostgreSQL...\n')
  
  try {
    // Step 1: Migrate provinces
    const provinceMap = await migrateProvinces()
    
    // Step 2: Migrate districts
    const districtMap = await migrateDistricts(provinceMap)
    
    // Step 3: Migrate wards
    await migrateWards(districtMap)
    
    // Print summary
    await printSummary()
    
    console.log('\n✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
