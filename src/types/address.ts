export interface AddressData {
  original: string
  province: string
  district: string
  ward: string
  isValid: boolean
  normalizedAddress?: string
  streetNumber?: string
  streetName?: string
  country?: string
  // GHN Master Data IDs (from fuzzy matching)
  ghnProvinceId?: number
  ghnProvinceName?: string
  ghnDistrictId?: number
  ghnDistrictName?: string
  ghnWardCode?: string
  ghnWardName?: string
  matchConfidence?: {
    province?: number
    district?: number
    ward?: number
  }
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface ProcessedAddress extends AddressData {
  id: string
  createdAt: Date
}

export interface ProvinceData {
  id: string
  name: string
  code: string
  districts: DistrictData[]
}

export interface DistrictData {
  id: string
  name: string
  code: string
  provinceId: string
  wards: WardData[]
}

export interface WardData {
  id: string
  name: string
  code: string
  districtId: string
}

export interface ShippingProvider {
  id: string
  name: string
  logo?: string
}

export interface ShippingRate {
  providerId: string
  providerName: string
  cost: number
  estimatedDays: string
  service: string
}

export interface ShippingQuote {
  addressId: string
  rates: ShippingRate[]
  error?: string
}