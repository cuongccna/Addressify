import { AddressData } from '@/types/address'

// Vietnamese administrative divisions data (simplified for demo)
// Used as fallback if master data not available
export const vietnamProvinces = [
  { name: 'Hà Nội', aliases: ['ha noi', 'hanoi', 'hn'] },
  { name: 'Hồ Chí Minh', aliases: ['ho chi minh', 'hcm', 'sai gon', 'saigon', 'tp hcm', 'tphcm', 'tp.hcm', 'tp ho chi minh'] },
  { name: 'Đà Nẵng', aliases: ['da nang', 'danang', 'đà nẵng'] },
  { name: 'Hải Phòng', aliases: ['hai phong', 'haiphong'] },
  { name: 'Cần Thơ', aliases: ['can tho', 'cantho'] },
  { name: 'An Giang', aliases: ['an giang', 'angiang'] },
  { name: 'Bà Rịa - Vũng Tàu', aliases: ['ba ria vung tau', 'vung tau', 'brvt'] },
  { name: 'Bắc Giang', aliases: ['bac giang', 'bacgiang'] },
  { name: 'Bắc Kạn', aliases: ['bac kan', 'backan'] },
  { name: 'Bạc Liêu', aliases: ['bac lieu', 'baclieu'] },
  { name: 'Bắc Ninh', aliases: ['bac ninh', 'bacninh'] },
  { name: 'Bến Tre', aliases: ['ben tre', 'bentre'] },
  { name: 'Bình Định', aliases: ['binh dinh', 'binhdinh'] },
  { name: 'Bình Dương', aliases: ['binh duong', 'binhduong'] },
  { name: 'Bình Phước', aliases: ['binh phuoc', 'binhphuoc'] },
  { name: 'Bình Thuận', aliases: ['binh thuan', 'binhthuan'] },
  { name: 'Cà Mau', aliases: ['ca mau', 'camau'] },
  { name: 'Cao Bằng', aliases: ['cao bang', 'caobang'] },
  { name: 'Đắk Lắk', aliases: ['dak lak', 'daklak', 'đắk lắk'] },
  { name: 'Đắk Nông', aliases: ['dak nong', 'daknong', 'đắk nông'] },
  { name: 'Điện Biên', aliases: ['dien bien', 'dienbien', 'điện biên'] },
]

// Minimal curated data for HCMC districts to improve accuracy
const HCMC_DISTRICTS = [
  'Quận 1','Quận 3','Quận 4','Quận 5','Quận 6','Quận 7','Quận 8','Quận 10','Quận 11','Quận 12',
  'Bình Thạnh','Gò Vấp','Phú Nhuận','Tân Bình','Tân Phú','Bình Tân','Thủ Đức','Bình Chánh','Hóc Môn','Củ Chi','Nhà Bè','Cần Giờ'
]

// Common address patterns and variations
const addressPatterns = {
  province: /(?:tỉnh|thành phố|tp\.?)[\s:]*([^,]+)/i,
  district: /(?:quận|huyện|thị xã|q\.?|h\.?)[\s:]*([^,]+)/i,
  ward: /(?:phường|xã|thị trấn|p\.?|x\.?)[\s:]*([^,]+)/i,
  street: /^(\d+)?\s*([^,\d]+?)\s*(?:,|$)/i
}

function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Normalize Vietnamese text
export function normalizeVietnameseText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Extract province from address string
export function extractProvince(address: string): string {
  const normalized = normalizeVietnameseText(address)
  
  // Try to find province by exact match or aliases
  for (const province of vietnamProvinces) {
    const provinceName = normalizeVietnameseText(province.name)
    if (normalized.includes(provinceName)) {
      return province.name
    }
    
    for (const alias of province.aliases) {
      if (normalized.includes(alias)) {
        return province.name
      }
    }
  }
  
  // Try pattern matching
  const match = address.match(addressPatterns.province)
  if (match) {
    const extracted = match[1].trim()
    // Try to match the extracted part with provinces
    for (const province of vietnamProvinces) {
      if (normalizeVietnameseText(province.name).includes(normalizeVietnameseText(extracted))) {
        return province.name
      }
    }
    return extracted
  }
  
  return ''
}

// Extract district from address string
export function extractDistrict(address: string): string {
  // Prefer curated lookup for HCMC to avoid truncations like 'tân'
  if (normalizeVietnameseText(address).includes('ho chi minh') || /\b(hcm|tphcm|tp\.hcm)\b/i.test(address)) {
    for (const d of HCMC_DISTRICTS) {
      const dn = normalizeVietnameseText(d)
      if (normalizeVietnameseText(address).includes(dn)) return d
    }
  }

  const match = address.match(addressPatterns.district)
  if (match) {
    return match[1].trim()
  }

  // Fallback: try to capture after comma segments for words like "Bình Tân", "Tân Phú"
  const segments = address.split(',').map((s) => s.trim()).filter(Boolean)
  for (const seg of segments) {
    const segNorm = normalizeVietnameseText(seg)
    for (const d of HCMC_DISTRICTS) {
      if (normalizeVietnameseText(d).includes(segNorm) || segNorm.includes(normalizeVietnameseText(d))) {
        return d
      }
    }
  }
  return ''
}

// Extract ward from address string
export function extractWard(address: string, district?: string): string {
  const match = address.match(addressPatterns.ward)
  if (match) {
    return match[1].trim()
  }
  
  // Try common ward patterns
  const wardKeywords = ['phường', 'xã', 'thị trấn', 'p.', 'x.']
  const normalized = normalizeVietnameseText(address)
  
  for (const keyword of wardKeywords) {
    const keywordNorm = normalizeVietnameseText(keyword)
    const index = normalized.indexOf(keywordNorm)
    if (index !== -1) {
      const after = address.substring(index + keyword.length).trim()
      const nextComma = after.indexOf(',')
      const result = nextComma !== -1 ? after.substring(0, nextComma) : after.split(' ').slice(0, 3).join(' ')
      if (result.trim()) {
        return result.trim()
      }
    }
  }
  
  // NEW: Smart extraction for addresses without explicit ward keywords
  // Format: "street, ward, district, province" or "number street, ward, district, province"
  const segments = address.split(',').map(s => s.trim()).filter(Boolean)
  if (segments.length >= 4 && district) {
    // Find which segment is the district
    const districtNorm = normalizeVietnameseText(district)
    for (let i = 0; i < segments.length; i++) {
      const segNorm = normalizeVietnameseText(segments[i])
      if (segNorm.includes(districtNorm) || districtNorm.includes(segNorm)) {
        // The segment before district should be the ward (if it exists and isn't the street)
        if (i > 0 && i - 1 > 0) {
          // segments[0] is street, segments[i-1] is ward
          return segments[i - 1]
        }
      }
    }
  }
  
  return ''
}

// Extract house number and street name
export function extractStreet(address: string): { streetNumber?: string; streetName?: string } {
  const match = addressPatterns.street.exec(address)
  if (!match) return {}
  const streetNumber = (match[1] || '').trim() || undefined
  const streetName = (match[2] || '').trim()
  // Clean common prefixes like 'đường', 'duong'
  const cleanedName = streetName
    .replace(/^\b(duong|đường)\b\s*/i, '')
    .replace(/^\b(phố)\b\s*/i, '')
  return {
    streetNumber,
    streetName: titleCase(cleanedName)
  }
}

// Convert 2-tier address to 3-tier for shipping APIs
export function convertTo3Tier(province: string, district: string): { province: string; district: string; ward: string } {
  // For 2-tier addresses (some urban areas), we need to map them to 3-tier equivalents
  const mappings: Record<string, { district: string; ward: string }> = {
    // Hà Nội districts that are actually wards in the API
    'Ba Đình': { district: 'Quận Ba Đình', ward: 'Phường Ba Đình' },
    'Hoàn Kiếm': { district: 'Quận Hoàn Kiếm', ward: 'Phường Hoàn Kiếm' },
    'Hai Bà Trưng': { district: 'Quận Hai Bà Trưng', ward: 'Phường Bạch Mai' },
    'Đống Đa': { district: 'Quận Đống Đa', ward: 'Phường Láng Thượng' },
    'Tây Hồ': { district: 'Quận Tây Hồ', ward: 'Phường Quảng An' },
    'Cầu Giấy': { district: 'Quận Cầu Giấy', ward: 'Phường Dịch Vọng' },
    'Thanh Xuân': { district: 'Quận Thanh Xuân', ward: 'Phường Nhân Chính' },
    
    // HCM districts
    'Quận 1': { district: 'Quận 1', ward: 'Phường Bến Nghé' },
    'Quận 2': { district: 'Quận 2', ward: 'Phường An Phú' },
    'Quận 3': { district: 'Quận 3', ward: 'Phường Võ Thị Sáu' },
    'Quận 4': { district: 'Quận 4', ward: 'Phường 1' },
    'Quận 5': { district: 'Quận 5', ward: 'Phường 1' },
    'Quận 6': { district: 'Quận 6', ward: 'Phường 1' },
    'Quận 7': { district: 'Quận 7', ward: 'Phường Tân Thuận Đông' },
    'Quận 8': { district: 'Quận 8', ward: 'Phường 1' },
    'Quận 9': { district: 'Quận 9', ward: 'Phường Long Bình' },
    'Quận 10': { district: 'Quận 10', ward: 'Phường 1' },
    'Quận 11': { district: 'Quận 11', ward: 'Phường 1' },
    'Quận 12': { district: 'Quận 12', ward: 'Phường Thạnh Xuân' },
  }
  
  const mapping = mappings[district]
  if (mapping) {
    return {
      province,
      district: mapping.district,
      ward: mapping.ward
    }
  }
  
  return { province, district, ward: district ? `Phường ${district}` : '' }
}

// Main address processing function (with fallback to regex-based extraction)
export function processAddress(rawAddress: string): AddressData {
  const trimmed = rawAddress.trim()
  
  const province = extractProvince(trimmed)
  const district = extractDistrict(trimmed)
  const ward = extractWard(trimmed, district)
  const { streetNumber, streetName } = extractStreet(trimmed)
  
  // If no ward found, try to convert 2-tier to 3-tier
  let finalProvince = province
  let finalDistrict = district
  let finalWard = ward
  
  if (!ward && district) {
    const converted = convertTo3Tier(province, district)
    finalProvince = converted.province
    finalDistrict = converted.district
    finalWard = converted.ward
  }
  
  const isValid = !!(finalProvince && finalDistrict)
  
  return {
    original: rawAddress,
    province: finalProvince || 'Hồ Chí Minh',
    district: finalDistrict,
    ward: finalWard,
    streetNumber,
    streetName,
    country: 'Việt Nam',
    isValid,
    normalizedAddress: isValid
      ? `${[streetNumber, streetName, finalWard, finalDistrict, finalProvince, 'Việt Nam'].filter(Boolean).join(', ')}`
      : rawAddress
  }
}

// Process multiple addresses from text input (sync version - uses fallback)
export function processAddressesFromText(text: string): AddressData[] {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  return lines.map(line => processAddress(line))
}

// NOTE: Master data functions moved to addressNormalizer.server.ts
// to avoid bundling Node.js modules (fs/promises) in client code

// Process addresses from CSV text
export function processAddressesFromCSV(csvText: string): AddressData[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  const addresses: AddressData[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Simple CSV parsing - assume address is in first column or the entire line
    const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''))
    const addressText = columns.length > 1 ? columns[0] : line
    
    if (addressText) {
      addresses.push(processAddress(addressText))
    }
  }
  
  return addresses
}
