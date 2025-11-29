/**
 * Job Scheduler
 * Central scheduler for all cron jobs
 */

import cron from 'node-cron';
import { JOB_SCHEDULES, isJobEnabled, getJobSchedule, type JobConfig } from './config';

// Webhook Jobs
import {
  retryFailedWebhooksJob,
  cleanupWebhookLogsJob,
  monitorWebhookHealthJob,
} from './webhook-jobs';

// Email Jobs
import {
  runSendWeeklySummary,
  runSendDailySummary,
} from './email-jobs';

// Database Jobs
import {
  cleanupEmailLogsJob,
  cleanupApiKeyUsageJob,
  cleanupExpiredApiKeysJob,
  cleanupOldQuotesJob,
  optimizeDatabaseJob,
  generateDatabaseStatsJob,
} from './database-jobs';

/**
 * All scheduled jobs configuration
 */
export const JOBS: JobConfig[] = [
  // Webhook Jobs
  {
    name: 'RETRY_FAILED_WEBHOOKS',
    schedule: getJobSchedule('RETRY_FAILED_WEBHOOKS', JOB_SCHEDULES.HOURLY),
    description: 'Retry failed webhook deliveries from last 24h',
    enabled: isJobEnabled('RETRY_FAILED_WEBHOOKS'),
    handler: retryFailedWebhooksJob,
  },
  {
    name: 'CLEANUP_WEBHOOK_LOGS',
    schedule: getJobSchedule('CLEANUP_WEBHOOK_LOGS', JOB_SCHEDULES.DAILY_2AM),
    description: 'Delete webhook logs older than retention period',
    enabled: isJobEnabled('CLEANUP_WEBHOOK_LOGS'),
    handler: cleanupWebhookLogsJob,
  },
  {
    name: 'MONITOR_WEBHOOK_HEALTH',
    schedule: getJobSchedule('MONITOR_WEBHOOK_HEALTH', JOB_SCHEDULES.EVERY_6_HOURS),
    description: 'Check for failing webhooks and alert',
    enabled: isJobEnabled('MONITOR_WEBHOOK_HEALTH'),
    handler: monitorWebhookHealthJob,
  },

  // Email Jobs
  {
    name: 'SEND_WEEKLY_SUMMARIES',
    schedule: getJobSchedule('SEND_WEEKLY_SUMMARIES', JOB_SCHEDULES.WEEKLY_MONDAY_9AM),
    description: 'Send weekly summary emails to users',
    enabled: isJobEnabled('SEND_WEEKLY_SUMMARIES'),
    handler: runSendWeeklySummary,
  },
  {
    name: 'SEND_DAILY_SUMMARIES',
    schedule: getJobSchedule('SEND_DAILY_SUMMARIES', JOB_SCHEDULES.DAILY_9AM),
    description: 'Trigger daily summary webhooks',
    enabled: isJobEnabled('SEND_DAILY_SUMMARIES'),
    handler: runSendDailySummary,
  },

  // Database Maintenance Jobs
  {
    name: 'CLEANUP_EMAIL_LOGS',
    schedule: getJobSchedule('CLEANUP_EMAIL_LOGS', JOB_SCHEDULES.DAILY_2AM),
    description: 'Delete old email logs',
    enabled: isJobEnabled('CLEANUP_EMAIL_LOGS'),
    handler: cleanupEmailLogsJob,
  },
  {
    name: 'CLEANUP_API_KEY_USAGE',
    schedule: getJobSchedule('CLEANUP_API_KEY_USAGE', JOB_SCHEDULES.DAILY_2AM),
    description: 'Delete old API key usage logs',
    enabled: isJobEnabled('CLEANUP_API_KEY_USAGE'),
    handler: cleanupApiKeyUsageJob,
  },
  {
    name: 'CLEANUP_EXPIRED_API_KEYS',
    schedule: getJobSchedule('CLEANUP_EXPIRED_API_KEYS', JOB_SCHEDULES.DAILY_2AM),
    description: 'Deactivate expired API keys',
    enabled: isJobEnabled('CLEANUP_EXPIRED_API_KEYS'),
    handler: cleanupExpiredApiKeysJob,
  },
  {
    name: 'CLEANUP_OLD_QUOTES',
    schedule: getJobSchedule('CLEANUP_OLD_QUOTES', JOB_SCHEDULES.MONTHLY_1ST),
    description: 'Delete old quote history',
    enabled: isJobEnabled('CLEANUP_OLD_QUOTES'),
    handler: cleanupOldQuotesJob,
  },
  {
    name: 'OPTIMIZE_DATABASE',
    schedule: getJobSchedule('OPTIMIZE_DATABASE', JOB_SCHEDULES.WEEKLY_SUNDAY_3AM),
    description: 'Run database optimization and ANALYZE',
    enabled: isJobEnabled('OPTIMIZE_DATABASE'),
    handler: optimizeDatabaseJob,
  },
  {
    name: 'GENERATE_DATABASE_STATS',
    schedule: getJobSchedule('GENERATE_DATABASE_STATS', JOB_SCHEDULES.DAILY_6AM),
    description: 'Generate database statistics report',
    enabled: isJobEnabled('GENERATE_DATABASE_STATS'),
    handler: generateDatabaseStatsJob,
  },
];

/**
 * Active cron tasks
 */
const activeTasks: Array<{ name: string; task: ReturnType<typeof cron.schedule> }> = [];

/**
 * Start all enabled scheduled jobs
 * @returns Number of jobs started
 */
export function startScheduler(): number {
  console.log('\n🚀 Starting job scheduler...\n');

  let started = 0;
  let skipped = 0;

  for (const job of JOBS) {
    if (!job.enabled) {
      console.log(`⏭️  Skipping ${job.name}: disabled`);
      skipped++;
      continue;
    }

    try {
      const task = cron.schedule(
        job.schedule,
        async () => {
          const startTime = Date.now();
          console.log(`\n⏰ [${new Date().toISOString()}] Running job: ${job.name}`);

          try {
            await job.handler();
            const duration = Date.now() - startTime;
            console.log(`✅ Job completed: ${job.name} (${duration}ms)\n`);
          } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ Job failed: ${job.name} (${duration}ms)`);
            console.error(error);
            console.log('');
          }
        },
        {
          timezone: process.env.TZ || 'Asia/Ho_Chi_Minh',
        }
      );

      activeTasks.push({ name: job.name, task });
      console.log(`✅ Started: ${job.name}`);
      console.log(`   Schedule: ${job.schedule}`);
      console.log(`   Description: ${job.description}`);
      started++;
    } catch (error) {
      console.error(`❌ Failed to start: ${job.name}`);
      console.error(error);
    }
  }

  console.log(`\n📊 Scheduler started: ${started} jobs active, ${skipped} skipped\n`);
  
  return started;
}

/**
 * Stop all scheduled jobs
 */
export function stopScheduler(): void {
  console.log('\n🛑 Stopping job scheduler...\n');

  for (const { name, task } of activeTasks) {
    task.stop();
    console.log(`⏹️  Stopped: ${name}`);
  }

  activeTasks.length = 0;
  console.log('\n✅ Scheduler stopped\n');
}

/**
 * Get status of all jobs
 */
export function getSchedulerStatus(): Array<{
  name: string;
  schedule: string;
  description: string;
  enabled: boolean;
  running: boolean;
}> {
  return JOBS.map(job => ({
    name: job.name,
    schedule: job.schedule,
    description: job.description,
    enabled: job.enabled,
    running: activeTasks.some(t => t.name === job.name),
  }));
}

/**
 * Run a specific job manually
 */
export async function runJobManually(jobName: string): Promise<void> {
  const job = JOBS.find(j => j.name === jobName);
  
  if (!job) {
    throw new Error(`Job not found: ${jobName}`);
  }

  console.log(`\n🔧 Running job manually: ${jobName}`);
  const startTime = Date.now();

  try {
    await job.handler();
    const duration = Date.now() - startTime;
    console.log(`✅ Job completed: ${jobName} (${duration}ms)\n`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Job failed: ${jobName} (${duration}ms)`);
    throw error;
  }
}
