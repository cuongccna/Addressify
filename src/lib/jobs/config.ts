/**
 * Scheduled Jobs Configuration
 * Định nghĩa tất cả cron jobs trong hệ thống
 */

export interface JobConfig {
  name: string;
  schedule: string; // Cron expression
  description: string;
  enabled: boolean;
  handler: () => Promise<void>;
}

/**
 * Cron Schedule Examples:
 * 
 * Every minute:        * * * * *
 * Every 5 minutes:     *\/5 * * * *
 * Every hour:          0 * * * *
 * Every day at 2am:    0 2 * * *
 * Every Monday 9am:    0 9 * * 1
 * First day of month:  0 0 1 * *
 * 
 * Format: minute hour day month weekday
 */

export const JOB_SCHEDULES = {
  // Every 5 minutes
  EVERY_5_MIN: '*/5 * * * *',
  
  // Every 15 minutes
  EVERY_15_MIN: '*/15 * * * *',
  
  // Every hour
  HOURLY: '0 * * * *',
  
  // Every 6 hours
  EVERY_6_HOURS: '0 */6 * * *',
  
  // Daily at 2am
  DAILY_2AM: '0 2 * * *',
  
  // Daily at 6am
  DAILY_6AM: '0 6 * * *',
  
  // Daily at 9am
  DAILY_9AM: '0 9 * * *',
  
  // Weekly on Sunday at 3am
  WEEKLY_SUNDAY_3AM: '0 3 * * 0',
  
  // Weekly on Monday at 9am
  WEEKLY_MONDAY_9AM: '0 9 * * 1',
  
  // Monthly on 1st at midnight
  MONTHLY_1ST: '0 0 1 * *',
} as const;

export type JobSchedule = typeof JOB_SCHEDULES[keyof typeof JOB_SCHEDULES];

/**
 * Job configuration with environment-based enabling
 */
export function isJobEnabled(jobName: string): boolean {
  // Disable all jobs in development by default
  if (process.env.NODE_ENV === 'development') {
    return process.env[`ENABLE_JOB_${jobName}`] === 'true';
  }
  
  // Enable all jobs in production by default
  // But allow disabling specific jobs
  if (process.env[`DISABLE_JOB_${jobName}`] === 'true') {
    return false;
  }
  
  return true;
}

/**
 * Get job schedule from environment or use default
 */
export function getJobSchedule(
  jobName: string,
  defaultSchedule: JobSchedule
): string {
  return process.env[`SCHEDULE_${jobName}`] || defaultSchedule;
}
