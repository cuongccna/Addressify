/**
 * Webhook Delivery System
 * Gửi webhooks với retry logic và exponential backoff
 */

import { createWebhookHeaders } from './signature';
import { WebhookEvent, WebhookEventType } from './events';
import { prisma } from '@/lib/prisma';

interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  response?: unknown;
  error?: string;
  attempt: number;
  responseTime: number;
}

/**
 * Deliver webhook to URL with retry logic
 */
export async function deliverWebhook(
  webhookId: string,
  url: string,
  secret: string,
  event: WebhookEvent,
  maxAttempts: number = 3
): Promise<DeliveryResult> {
  const payload = JSON.stringify(event);
  let lastError: string = '';
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const startTime = Date.now();
    
    try {
      const headers = createWebhookHeaders(
        payload,
        secret,
        event.id,
        event.type
      );

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: payload,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const responseTime = Date.now() - startTime;
      
      // Log the attempt
      await logWebhookDelivery(
        webhookId,
        event,
        response.status,
        null,
        attempt,
        response.ok,
        responseTime
      );

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          response: await response.text().catch(() => null),
          attempt,
          responseTime,
        };
      }

      lastError = `HTTP ${response.status}: ${response.statusText}`;
      
      // Don't retry for 4xx errors (except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        break;
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      lastError = error instanceof Error ? error.message : 'Unknown error';
      
      await logWebhookDelivery(
        webhookId,
        event,
        null,
        lastError,
        attempt,
        false,
        responseTime
      );
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxAttempts) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError,
    attempt: maxAttempts,
    responseTime: 0,
  };
}

/**
 * Log webhook delivery attempt
 */
async function logWebhookDelivery(
  webhookId: string,
  event: WebhookEvent,
  statusCode: number | null,
  error: string | null,
  attempt: number,
  success: boolean,
  _responseTime: number
) {
  try {
    await prisma.webhookLog.create({
      data: {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        webhookId,
        event: event.type,
        payload: event.data as object,
        statusCode,
        attempt,
        success,
        error,
        timestamp: new Date(),
      },
    });
  } catch (err) {
    console.error('Failed to log webhook delivery:', err);
  }
}

/**
 * Deliver webhook to all subscribed webhooks for an event
 */
export async function deliverToSubscribers(
  userId: string,
  event: WebhookEvent
): Promise<void> {
  try {
    // Find all active webhooks subscribed to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        userId,
        isActive: true,
        events: {
          has: event.type,
        },
      },
    });

    if (webhooks.length === 0) {
      return;
    }

    // Deliver to all webhooks in parallel
    const deliveries = webhooks.map(webhook =>
      deliverWebhook(webhook.id, webhook.url, webhook.secret, event)
    );

    await Promise.allSettled(deliveries);
  } catch (error) {
    console.error('Failed to deliver webhooks:', error);
  }
}

/**
 * Retry failed webhook deliveries
 */
export async function retryFailedWebhooks(
  maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<number> {
  try {
    const cutoffTime = new Date(Date.now() - maxAge);
    
    // Find recent failed deliveries
    const failedLogs = await prisma.webhookLog.findMany({
      where: {
        success: false,
        attempt: {
          lt: 3, // Haven't reached max attempts
        },
        timestamp: {
          gte: cutoffTime,
        },
      },
      include: {
        webhook: true,
      },
      take: 100, // Limit batch size
    });

    let retried = 0;

    for (const log of failedLogs) {
      if (!log.webhook.isActive) {
        continue;
      }

      const event: WebhookEvent = {
        id: log.id,
        type: log.event as WebhookEventType,
        data: log.payload as never,
        timestamp: log.timestamp.toISOString(),
        userId: log.webhook.userId,
      };

      const result = await deliverWebhook(
        log.webhook.id,
        log.webhook.url,
        log.webhook.secret,
        event,
        3 - log.attempt // Remaining attempts
      );

      if (result.success) {
        retried++;
      }
    }

    return retried;
  } catch (error) {
    console.error('Failed to retry webhooks:', error);
    return 0;
  }
}

/**
 * Cleanup old webhook logs
 */
export async function cleanupWebhookLogs(
  maxAge: number = 30 * 24 * 60 * 60 * 1000 // 30 days
): Promise<number> {
  try {
    const cutoffTime = new Date(Date.now() - maxAge);
    
    const result = await prisma.webhookLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffTime,
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error('Failed to cleanup webhook logs:', error);
    return 0;
  }
}
