import crypto from 'crypto'

// API key prefixes
export const API_KEY_PREFIXES = {
  live: 'addr_live',
  test: 'addr_test',
} as const

export type ApiKeyType = keyof typeof API_KEY_PREFIXES

// Generate a secure API key
export function generateApiKey(type: ApiKeyType = 'live'): string {
  const prefix = API_KEY_PREFIXES[type]
  const randomBytes = crypto.randomBytes(32)
  const key = randomBytes.toString('base64url')
  
  return `${prefix}_sk_${key}`
}

// Generate API key secret for webhooks
export function generateSecret(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Hash API key for storage (we store hash, not plain key)
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

// Verify API key against hash
export function verifyApiKey(key: string, hash: string): boolean {
  const keyHash = hashApiKey(key)
  return crypto.timingSafeEqual(
    Buffer.from(keyHash),
    Buffer.from(hash)
  )
}

// Extract prefix from API key
export function getKeyPrefix(key: string): string {
  const match = key.match(/^(addr_(?:live|test))_sk_/)
  return match ? match[1] : ''
}

// Validate API key format
export function isValidApiKeyFormat(key: string): boolean {
  // Format: addr_{live|test}_sk_{32_base64url_chars}
  const pattern = /^addr_(live|test)_sk_[A-Za-z0-9_-]{43}$/
  return pattern.test(key)
}

// Mask API key for display (show first 12 and last 4 characters)
export function maskApiKey(key: string): string {
  if (key.length < 20) return key
  
  const start = key.substring(0, 12)
  const end = key.substring(key.length - 4)
  const masked = '•'.repeat(Math.min(key.length - 16, 20))
  
  return `${start}${masked}${end}`
}

// Parse permissions from JSON
export function parsePermissions(permissions: unknown): string[] {
  if (Array.isArray(permissions)) {
    return permissions.filter(p => typeof p === 'string')
  }
  return []
}

// Check if API key has permission
export function hasPermission(permissions: string[], required: string): boolean {
  // Wildcard permission
  if (permissions.includes('*')) return true
  
  // Exact match
  if (permissions.includes(required)) return true
  
  // Prefix match (e.g., "quotes:*" matches "quotes:read")
  const [resource] = required.split(':')
  if (permissions.includes(`${resource}:*`)) return true
  
  return false
}

// Default permissions
export const DEFAULT_PERMISSIONS = [
  'quotes:read',
  'quotes:create',
  'shops:read',
]

// All available permissions
export const ALL_PERMISSIONS = [
  'quotes:read',
  'quotes:create',
  'quotes:update',
  'quotes:delete',
  'shops:read',
  'shops:create',
  'shops:update',
  'shops:delete',
  'addresses:normalize',
  'analytics:read',
] as const

export type Permission = typeof ALL_PERMISSIONS[number]

// Permission descriptions
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  'quotes:read': 'Xem lịch sử báo giá',
  'quotes:create': 'Tạo báo giá mới',
  'quotes:update': 'Cập nhật báo giá',
  'quotes:delete': 'Xóa báo giá',
  'shops:read': 'Xem thông tin shop',
  'shops:create': 'Tạo shop mới',
  'shops:update': 'Cập nhật thông tin shop',
  'shops:delete': 'Xóa shop',
  'addresses:normalize': 'Chuẩn hóa địa chỉ',
  'analytics:read': 'Xem thống kê và phân tích',
}
