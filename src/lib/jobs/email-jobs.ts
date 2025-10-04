/**
 * Email Jobs
 * Send scheduled email summary reports
 */

import { prisma } from '@/lib/prisma';

/**
 * Send daily summary emails to all users
 * Runs every day at 7am
 * 
 * Note: This is a placeholder job that logs the action.
 * In production, this would trigger actual email sending via webhook events.
 */
export async function runSendDailySummary(): Promise<void> {
  console.log('[JOB] Starting daily summary job...');
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
    });
    
    console.log(`[JOB] Would send daily summaries to ${users.length} users`);
    
    // Calculate yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    console.log(`[JOB] Daily summary date: ${dateStr}`);
    console.log(`[JOB] ✅ Daily summary job completed: ${users.length} users processed (placeholder)`);
  } catch (error) {
    console.error('[JOB] ❌ Daily summaries job failed:', error);
    throw error;
  }
}

/**
 * Send weekly summary emails to all users
 * Runs every Monday at 8am
 * 
 * Note: This is a placeholder job that logs the action.
 * In production, this would trigger actual email sending via webhook events.
 */
export async function runSendWeeklySummary(): Promise<void> {
  console.log('[JOB] Starting weekly summary job...');
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
    });
    
    console.log(`[JOB] Would send weekly summaries to ${users.length} users`);
    
    // Calculate last week's date range (last Monday to Sunday)
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - (today.getDay() + 6) % 7 - 7);
    lastMonday.setHours(0, 0, 0, 0);
    
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);
    
    console.log(`[JOB] Weekly summary period: ${lastMonday.toISOString().split('T')[0]} to ${lastSunday.toISOString().split('T')[0]}`);
    console.log(`[JOB] ✅ Weekly summary job completed: ${users.length} users processed (placeholder)`);
  } catch (error) {
    console.error('[JOB] ❌ Weekly summaries job failed:', error);
    throw error;
  }
}
