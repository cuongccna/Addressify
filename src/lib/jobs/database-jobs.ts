/**
 * Database Maintenance Jobs
 * Cleanup old data and optimize database
 */

import { prisma } from '@/lib/prisma';

/**
 * Cleanup old email logs
 * Runs daily at 2am
 */
export async function cleanupEmailLogsJob(): Promise<void> {
  console.log('[JOB] Starting email logs cleanup...');
  
  try {
    const retentionDays = parseInt(process.env.EMAIL_LOG_RETENTION_DAYS || '90', 10);
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const result = await prisma.emailLog.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate,
        },
      },
    });
    
    console.log(`[JOB] ✅ Email logs cleanup complete: ${result.count} logs deleted`);
  } catch (error) {
    console.error('[JOB] ❌ Email logs cleanup failed:', error);
    throw error;
  }
}

/**
 * Cleanup old API key usage logs
 * Runs daily at 2am
 */
export async function cleanupApiKeyUsageJob(): Promise<void> {
  console.log('[JOB] Starting API key usage cleanup...');
  
  try {
    const retentionDays = parseInt(process.env.API_KEY_USAGE_RETENTION_DAYS || '30', 10);
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const result = await prisma.apiKeyUsage.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });
    
    console.log(`[JOB] ✅ API key usage cleanup complete: ${result.count} entries deleted`);
  } catch (error) {
    console.error('[JOB] ❌ API key usage cleanup failed:', error);
    throw error;
  }
}

/**
 * Cleanup expired API keys
 * Runs daily at 2am
 */
export async function cleanupExpiredApiKeysJob(): Promise<void> {
  console.log('[JOB] Starting expired API keys cleanup...');
  
  try {
    const now = new Date();
    
    // Find expired but still active keys
    const expiredKeys = await prisma.apiKey.findMany({
      where: {
        isActive: true,
        expiresAt: {
          not: null,
          lt: now,
        },
      },
    });
    
    if (expiredKeys.length > 0) {
      // Deactivate expired keys
      await prisma.apiKey.updateMany({
        where: {
          id: {
            in: expiredKeys.map(k => k.id),
          },
        },
        data: {
          isActive: false,
          updatedAt: now,
        },
      });
      
      console.log(`[JOB] ✅ Expired API keys cleanup complete: ${expiredKeys.length} keys deactivated`);
    } else {
      console.log('[JOB] ✅ No expired API keys found');
    }
  } catch (error) {
    console.error('[JOB] ❌ Expired API keys cleanup failed:', error);
    throw error;
  }
}

/**
 * Cleanup old quote history
 * Runs monthly on 1st at midnight
 */
export async function cleanupOldQuotesJob(): Promise<void> {
  console.log('[JOB] Starting old quotes cleanup...');
  
  try {
    const retentionDays = parseInt(process.env.QUOTE_RETENTION_DAYS || '365', 10);
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const result = await prisma.quoteHistory.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    console.log(`[JOB] ✅ Old quotes cleanup complete: ${result.count} quotes deleted`);
  } catch (error) {
    console.error('[JOB] ❌ Old quotes cleanup failed:', error);
    throw error;
  }
}

/**
 * Database optimization and maintenance
 * Runs weekly on Sunday at 3am
 */
export async function optimizeDatabaseJob(): Promise<void> {
  console.log('[JOB] Starting database optimization...');
  
  try {
    // Run ANALYZE to update statistics
    await prisma.$executeRaw`ANALYZE`;
    
    console.log('[JOB] ✅ Database optimization complete');
  } catch (error) {
    console.error('[JOB] ❌ Database optimization failed:', error);
    throw error;
  }
}

/**
 * Generate database statistics report
 * Runs daily at 6am
 */
export async function generateDatabaseStatsJob(): Promise<void> {
  console.log('[JOB] Generating database statistics...');
  
  try {
    const stats = {
      users: await prisma.user.count(),
      shops: await prisma.shop.count(),
      quotes: await prisma.quoteHistory.count(),
      apiKeys: await prisma.apiKey.count({ where: { isActive: true } }),
      webhooks: await prisma.webhook.count({ where: { isActive: true } }),
      emailLogs: await prisma.emailLog.count(),
      webhookLogs: await prisma.webhookLog.count(),
      apiKeyUsage: await prisma.apiKeyUsage.count(),
    };
    
    console.log('[JOB] ✅ Database statistics:', stats);
    
    // TODO: Store stats for trending analysis
    // Could send to monitoring service
    
  } catch (error) {
    console.error('[JOB] ❌ Database stats generation failed:', error);
    throw error;
  }
}
