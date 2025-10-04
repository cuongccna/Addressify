/**
 * Webhook Events System
 * Định nghĩa các event types và payload structures
 */

// Event types
export const WEBHOOK_EVENTS = {
  // Quote events
  QUOTE_CREATED: 'quote.created',
  QUOTE_UPDATED: 'quote.updated',
  QUOTE_DELETED: 'quote.deleted',
  QUOTE_FAILED: 'quote.failed',
  
  // Shop events
  SHOP_CREATED: 'shop.created',
  SHOP_UPDATED: 'shop.updated',
  SHOP_DELETED: 'shop.deleted',
  
  // Address events
  ADDRESS_NORMALIZED: 'address.normalized',
  ADDRESS_VALIDATION_FAILED: 'address.validation_failed',
  
  // Analytics events
  ANALYTICS_DAILY_SUMMARY: 'analytics.daily_summary',
  ANALYTICS_WEEKLY_SUMMARY: 'analytics.weekly_summary',
} as const;

export type WebhookEventType = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];

// Event payload interfaces
export interface QuoteCreatedPayload {
  quoteId: string;
  shopId: string;
  recipient: {
    name: string;
    phone: string;
    address: string;
    normalizedAddress?: string;
  };
  weight: number;
  value: number;
  quotes: Array<{
    service: string;
    provider: string;
    price: number;
    estimatedDays: string;
  }>;
  createdAt: string;
}

export interface QuoteUpdatedPayload {
  quoteId: string;
  shopId: string;
  changes: Record<string, unknown>;
  updatedAt: string;
}

export interface QuoteDeletedPayload {
  quoteId: string;
  shopId: string;
  deletedAt: string;
}

export interface QuoteFailedPayload {
  shopId: string;
  recipient: {
    name: string;
    phone: string;
    address: string;
  };
  error: string;
  failedAt: string;
}

export interface ShopCreatedPayload {
  shopId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface ShopUpdatedPayload {
  shopId: string;
  changes: Record<string, unknown>;
  updatedAt: string;
}

export interface ShopDeletedPayload {
  shopId: string;
  deletedAt: string;
}

export interface AddressNormalizedPayload {
  original: string;
  normalized: string;
  confidence: number;
  components: {
    street?: string;
    ward?: string;
    district?: string;
    province?: string;
  };
  normalizedAt: string;
}

export interface AddressValidationFailedPayload {
  address: string;
  error: string;
  failedAt: string;
}

export interface AnalyticsDailySummaryPayload {
  date: string;
  totalQuotes: number;
  successfulQuotes: number;
  failedQuotes: number;
  totalValue: number;
  averageWeight: number;
  topProviders: Array<{
    provider: string;
    count: number;
  }>;
}

export interface AnalyticsWeeklySummaryPayload {
  weekStart: string;
  weekEnd: string;
  totalQuotes: number;
  successfulQuotes: number;
  failedQuotes: number;
  totalValue: number;
  averageWeight: number;
  topProviders: Array<{
    provider: string;
    count: number;
  }>;
  topDestinations: Array<{
    province: string;
    count: number;
  }>;
}

// Union type for all payloads
export type WebhookPayload =
  | QuoteCreatedPayload
  | QuoteUpdatedPayload
  | QuoteDeletedPayload
  | QuoteFailedPayload
  | ShopCreatedPayload
  | ShopUpdatedPayload
  | ShopDeletedPayload
  | AddressNormalizedPayload
  | AddressValidationFailedPayload
  | AnalyticsDailySummaryPayload
  | AnalyticsWeeklySummaryPayload;

// Webhook event structure
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: WebhookPayload;
  timestamp: string;
  userId: string;
}

// Event descriptions for UI
export const EVENT_DESCRIPTIONS: Record<WebhookEventType, string> = {
  [WEBHOOK_EVENTS.QUOTE_CREATED]: 'Khi tạo báo giá mới thành công',
  [WEBHOOK_EVENTS.QUOTE_UPDATED]: 'Khi cập nhật thông tin báo giá',
  [WEBHOOK_EVENTS.QUOTE_DELETED]: 'Khi xóa báo giá',
  [WEBHOOK_EVENTS.QUOTE_FAILED]: 'Khi tạo báo giá thất bại',
  [WEBHOOK_EVENTS.SHOP_CREATED]: 'Khi tạo shop mới',
  [WEBHOOK_EVENTS.SHOP_UPDATED]: 'Khi cập nhật thông tin shop',
  [WEBHOOK_EVENTS.SHOP_DELETED]: 'Khi xóa shop',
  [WEBHOOK_EVENTS.ADDRESS_NORMALIZED]: 'Khi chuẩn hóa địa chỉ thành công',
  [WEBHOOK_EVENTS.ADDRESS_VALIDATION_FAILED]: 'Khi validate địa chỉ thất bại',
  [WEBHOOK_EVENTS.ANALYTICS_DAILY_SUMMARY]: 'Tổng kết hàng ngày',
  [WEBHOOK_EVENTS.ANALYTICS_WEEKLY_SUMMARY]: 'Tổng kết hàng tuần',
};

// Event categories for UI grouping
export const EVENT_CATEGORIES = {
  quotes: [
    WEBHOOK_EVENTS.QUOTE_CREATED,
    WEBHOOK_EVENTS.QUOTE_UPDATED,
    WEBHOOK_EVENTS.QUOTE_DELETED,
    WEBHOOK_EVENTS.QUOTE_FAILED,
  ],
  shops: [
    WEBHOOK_EVENTS.SHOP_CREATED,
    WEBHOOK_EVENTS.SHOP_UPDATED,
    WEBHOOK_EVENTS.SHOP_DELETED,
  ],
  addresses: [
    WEBHOOK_EVENTS.ADDRESS_NORMALIZED,
    WEBHOOK_EVENTS.ADDRESS_VALIDATION_FAILED,
  ],
  analytics: [
    WEBHOOK_EVENTS.ANALYTICS_DAILY_SUMMARY,
    WEBHOOK_EVENTS.ANALYTICS_WEEKLY_SUMMARY,
  ],
};
