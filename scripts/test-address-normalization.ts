/**
 * Test script for address normalization with GHN Master Data
 * Run: node --loader ts-node/esm scripts/test-address-normalization.ts
 */

import { processAddressWithMasterData } from '../src/utils/addressNormalizer.server'

const testAddresses = [
  '123 tên lữa p. an lạc a, bình tân, hcm',
  '456 le duan, ben nghe, quan 1, tp ho chi minh',
  '789 hoang hoa tham, ba dinh, ha noi',
  '34/5 nguyen van linh, p tan thuan dong, q7, tphcm',
  '12 ly thai to, hoan kiem, hn',
  '999 đường 3/2, p. xuân khánh, ninh kiều, cần thơ'
]

async function testNormalization() {
  console.log('🧪 Testing Address Normalization with GHN Master Data\n')
  console.log('=' .repeat(80))
  
  for (const address of testAddresses) {
    console.log(`\n📍 Input: ${address}`)
    console.log('-'.repeat(80))
    
    try {
      const result = await processAddressWithMasterData(address)
      
      console.log('✅ Results:')
      console.log(`   Original: ${result.original}`)
      console.log(`   Normalized: ${result.normalizedAddress}`)
      console.log(`   Street Number: ${result.streetNumber || 'N/A'}`)
      console.log(`   Street Name: ${result.streetName || 'N/A'}`)
      console.log(`   Province: ${result.province}`)
      console.log(`   District: ${result.district}`)
      console.log(`   Ward: ${result.ward}`)
      console.log(`   Valid: ${result.isValid ? '✅' : '❌'}`)
      
      if (result.ghnProvinceId) {
        console.log('\n📊 GHN Master Data:')
        console.log(`   Province ID: ${result.ghnProvinceId} (${result.ghnProvinceName})`)
        if (result.ghnDistrictId) {
          console.log(`   District ID: ${result.ghnDistrictId} (${result.ghnDistrictName})`)
        }
        if (result.ghnWardCode) {
          console.log(`   Ward Code: ${result.ghnWardCode} (${result.ghnWardName})`)
        }
        
        console.log('\n🎯 Confidence Scores:')
        if (result.matchConfidence?.province) {
          console.log(`   Province: ${(result.matchConfidence.province * 100).toFixed(0)}%`)
        }
        if (result.matchConfidence?.district) {
          console.log(`   District: ${(result.matchConfidence.district * 100).toFixed(0)}%`)
        }
        if (result.matchConfidence?.ward) {
          console.log(`   Ward: ${(result.matchConfidence.ward * 100).toFixed(0)}%`)
        }
      } else {
        console.log('\n⚠️  Master Data: Not matched (using fallback regex)')
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    console.log('='.repeat(80))
  }
  
  console.log('\n✅ Test completed!')
}

testNormalization().catch(console.error)
