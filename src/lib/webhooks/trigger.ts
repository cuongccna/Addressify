/**
 * Webhook Trigger System
 * Helper functions để trigger webhooks từ các parts của app
 */

import { WebhookEvent, WebhookEventType, WebhookPayload } from './events';
import { deliverToSubscribers } from './delivery';

/**
 * Create and trigger a webhook event
 */
export async function triggerWebhook(
  userId: string,
  eventType: WebhookEventType,
  payload: WebhookPayload
): Promise<void> {
  const event: WebhookEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type: eventType,
    data: payload,
    timestamp: new Date().toISOString(),
    userId,
  };

  // Deliver asynchronously (don't wait)
  deliverToSubscribers(userId, event).catch(error => {
    console.error('Webhook delivery failed:', error);
  });
}

/**
 * Trigger quote.created webhook
 */
export async function triggerQuoteCreated(
  userId: string,
  quote: {
    id: string;
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
    createdAt: Date;
  }
): Promise<void> {
  await triggerWebhook(userId, 'quote.created', {
    quoteId: quote.id,
    shopId: quote.shopId,
    recipient: quote.recipient,
    weight: quote.weight,
    value: quote.value,
    quotes: quote.quotes,
    createdAt: quote.createdAt.toISOString(),
  });
}

/**
 * Trigger quote.failed webhook
 */
export async function triggerQuoteFailed(
  userId: string,
  shopId: string,
  recipient: {
    name: string;
    phone: string;
    address: string;
  },
  error: string
): Promise<void> {
  await triggerWebhook(userId, 'quote.failed', {
    shopId,
    recipient,
    error,
    failedAt: new Date().toISOString(),
  });
}

/**
 * Trigger shop.created webhook
 */
export async function triggerShopCreated(
  userId: string,
  shop: {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
  }
): Promise<void> {
  await triggerWebhook(userId, 'shop.created', {
    shopId: shop.id,
    name: shop.name,
    description: shop.description,
    createdAt: shop.createdAt.toISOString(),
  });
}

/**
 * Trigger address.normalized webhook
 */
export async function triggerAddressNormalized(
  userId: string,
  original: string,
  normalized: string,
  confidence: number,
  components: {
    street?: string;
    ward?: string;
    district?: string;
    province?: string;
  }
): Promise<void> {
  await triggerWebhook(userId, 'address.normalized', {
    original,
    normalized,
    confidence,
    components,
    normalizedAt: new Date().toISOString(),
  });
}

/**
 * Trigger analytics.daily_summary webhook
 */
export async function triggerDailySummary(
  userId: string,
  summary: {
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
): Promise<void> {
  await triggerWebhook(userId, 'analytics.daily_summary', summary);
}

/**
 * Trigger analytics.weekly_summary webhook
 */
export async function triggerWeeklySummary(
  userId: string,
  summary: {
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
): Promise<void> {
  await triggerWebhook(userId, 'analytics.weekly_summary', summary);
}
