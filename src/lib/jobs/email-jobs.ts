/**
 * Email Jobs
 * Send scheduled email summary reports
 */

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/resend';
import { shouldSendEmailNotification } from '@/lib/email/send-emails';
import WeeklySummaryEmail from '@/lib/email/templates/WeeklySummaryEmail';
import { createElement } from 'react';

/**
 * Send daily summary emails to all users
 * Runs every day at 7am
 */
export async function runSendDailySummary(): Promise<void> {
  console.log('[JOB] Starting daily summary job...');
  
  try {
    // Get all users with daily summary enabled
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, notificationSettings: true },
    });
    
    // Calculate yesterday's date range
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    let sentCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      // Check if user has daily summary enabled
      const shouldSend = await shouldSendEmailNotification(user.id, 'dailySummary');
      
      if (!shouldSend) {
        skippedCount++;
        continue;
      }
      
      // Get user's quotes for yesterday
      const quotes = await prisma.quoteHistory.findMany({
        where: {
          shop: { userId: user.id },
          createdAt: {
            gte: yesterday,
            lte: yesterdayEnd,
          },
        },
        include: { shop: true },
      });
      
      if (quotes.length === 0) {
        skippedCount++;
        continue;
      }
      
      // Calculate stats
      const totalQuotes = quotes.length;
      const shopIds = new Set(quotes.map(q => q.shopId));
      
      // Send a simple daily summary email
      await sendEmail({
        to: user.email,
        subject: `📊 Tóm tắt ngày ${yesterday.toLocaleDateString('vi-VN')}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h1>📊 Tóm tắt hoạt động ngày ${yesterday.toLocaleDateString('vi-VN')}</h1>
            <p>Xin chào ${user.name || user.email},</p>
            <p>Hôm qua bạn đã tạo <strong>${totalQuotes}</strong> báo giá từ <strong>${shopIds.size}</strong> shop.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/history">Xem chi tiết</a></p>
            <p>Trân trọng,<br/>Đội ngũ Addressify</p>
          </div>
        `,
        type: 'daily_summary',
        userId: user.id,
      });
      
      sentCount++;
    }
    
    console.log(`[JOB] ✅ Daily summary job completed: ${sentCount} sent, ${skippedCount} skipped`);
  } catch (error) {
    console.error('[JOB] ❌ Daily summaries job failed:', error);
    throw error;
  }
}

/**
 * Send weekly summary emails to all users
 * Runs every Monday at 8am
 */
export async function runSendWeeklySummary(): Promise<void> {
  console.log('[JOB] Starting weekly summary job...');
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, notificationSettings: true },
    });
    
    // Calculate last week's date range (last Monday to Sunday)
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - (today.getDay() + 6) % 7 - 7);
    lastMonday.setHours(0, 0, 0, 0);
    
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);
    
    let sentCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      // Check if user has weekly summary enabled
      const shouldSend = await shouldSendEmailNotification(user.id, 'weeklySummary');
      
      if (!shouldSend) {
        skippedCount++;
        continue;
      }
      
      // Get user's quotes for last week
      const quotes = await prisma.quoteHistory.findMany({
        where: {
          shop: { userId: user.id },
          createdAt: {
            gte: lastMonday,
            lte: lastSunday,
          },
        },
        include: { shop: true },
      });
      
      if (quotes.length === 0) {
        skippedCount++;
        continue;
      }
      
      // Get user's shops
      const shops = await prisma.shop.findMany({
        where: { userId: user.id },
        select: { id: true, name: true },
      });
      
      // Calculate stats
      const totalQuotes = quotes.length;
      const totalShops = shops.length;
      
      // Calculate provider stats from quotes
      const providerCounts: Record<string, number> = {};
      const shopCounts: Record<string, number> = {};
      let totalAmount = 0;
      
      for (const quote of quotes) {
        // Count by shop
        shopCounts[quote.shop.name] = (shopCounts[quote.shop.name] || 0) + 1;
        
        // Parse quotes to get provider info
        if (Array.isArray(quote.quotes)) {
          for (const q of quote.quotes as Array<{ provider: string; price: number }>) {
            providerCounts[q.provider] = (providerCounts[q.provider] || 0) + 1;
            totalAmount += q.price || 0;
          }
        }
      }
      
      // Find top provider and shop
      const topProvider = Object.entries(providerCounts).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
      const topShop = Object.entries(shopCounts).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
      
      // Send weekly summary email
      await sendEmail({
        to: user.email,
        subject: `📊 Báo cáo tuần ${lastMonday.toLocaleDateString('vi-VN')} - ${lastSunday.toLocaleDateString('vi-VN')}`,
        react: createElement(WeeklySummaryEmail, {
          userName: user.name || undefined,
          weekStart: lastMonday.toISOString(),
          weekEnd: lastSunday.toISOString(),
          stats: {
            totalQuotes,
            totalShops,
            totalSavings: 0, // Would need more complex calculation
            avgAmount: totalQuotes > 0 ? Math.round(totalAmount / totalQuotes) : 0,
            topProvider: { name: topProvider[0], count: topProvider[1] },
            topShop: { name: topShop[0], count: topShop[1] },
          },
        }),
        type: 'weekly_summary',
        userId: user.id,
      });
      
      sentCount++;
    }
    
    console.log(`[JOB] ✅ Weekly summary job completed: ${sentCount} sent, ${skippedCount} skipped`);
  } catch (error) {
    console.error('[JOB] ❌ Weekly summaries job failed:', error);
    throw error;
  }
}
