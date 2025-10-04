/**
 * Webhook Maintenance Jobs
 * Tự động retry failed webhooks và cleanup logs
 */

import { retryFailedWebhooks, cleanupWebhookLogs } from '@/lib/webhooks/delivery';

/**
 * Retry failed webhook deliveries
 * Runs every hour
 */
export async function retryFailedWebhooksJob(): Promise<void> {
  console.log('[JOB] Starting webhook retry job...');
  
  try {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const retried = await retryFailedWebhooks(maxAge);
    
    console.log(`[JOB] ✅ Webhook retry complete: ${retried} webhooks retried`);
  } catch (error) {
    console.error('[JOB] ❌ Webhook retry failed:', error);
    throw error;
  }
}

/**
 * Cleanup old webhook logs
 * Runs daily at 2am
 */
export async function cleanupWebhookLogsJob(): Promise<void> {
  console.log('[JOB] Starting webhook logs cleanup...');
  
  try {
    const maxAge = parseInt(process.env.WEBHOOK_LOG_RETENTION_DAYS || '30', 10);
    const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;
    
    const deleted = await cleanupWebhookLogs(maxAgeMs);
    
    console.log(`[JOB] ✅ Webhook logs cleanup complete: ${deleted} logs deleted`);
  } catch (error) {
    console.error('[JOB] ❌ Webhook logs cleanup failed:', error);
    throw error;
  }
}

/**
 * Monitor webhook health
 * Check for consistently failing webhooks
 */
export async function monitorWebhookHealthJob(): Promise<void> {
  console.log('[JOB] Starting webhook health monitor...');
  
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // Find webhooks with high failure rate in last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const failingWebhooks = await prisma.$queryRaw<Array<{
      webhookId: string;
      url: string;
      totalAttempts: bigint;
      failedAttempts: bigint;
      failureRate: number;
    }>>`
      SELECT 
        wl."webhookId",
        w.url,
        COUNT(*) as "totalAttempts",
        COUNT(*) FILTER (WHERE wl.success = false) as "failedAttempts",
        (COUNT(*) FILTER (WHERE wl.success = false)::float / COUNT(*)::float * 100) as "failureRate"
      FROM addressify_webhook_logs wl
      JOIN addressify_webhooks w ON w.id = wl."webhookId"
      WHERE wl.timestamp > ${oneDayAgo}
      GROUP BY wl."webhookId", w.url
      HAVING (COUNT(*) FILTER (WHERE wl.success = false)::float / COUNT(*)::float) > 0.5
      ORDER BY "failureRate" DESC
    `;
    
    if (failingWebhooks.length > 0) {
      console.log(`[JOB] ⚠️ Found ${failingWebhooks.length} failing webhooks:`);
      
      for (const webhook of failingWebhooks) {
        console.log(`  - ${webhook.url}: ${webhook.failureRate.toFixed(1)}% failure rate`);
        
        // TODO: Send alert email to user
        // Could disable webhook automatically if failure rate too high
      }
    } else {
      console.log('[JOB] ✅ All webhooks healthy');
    }
  } catch (error) {
    console.error('[JOB] ❌ Webhook health monitor failed:', error);
    throw error;
  }
}
