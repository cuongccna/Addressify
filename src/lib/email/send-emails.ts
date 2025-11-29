/**
 * Email sending helper functions
 * These functions handle sending specific email types with proper templates
 */

import { sendEmail, EmailResult } from './resend'
import WelcomeEmail from './templates/WelcomeEmail'
import QuoteGeneratedEmail from './templates/QuoteGeneratedEmail'
import { createElement } from 'react'

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail({
  userId,
  email,
  name,
}: {
  userId: string
  email: string
  name?: string
}): Promise<EmailResult> {
  console.log(`📧 Sending welcome email to ${email}`)
  
  return await sendEmail({
    to: email,
    subject: '🎉 Chào mừng đến với Addressify!',
    react: createElement(WelcomeEmail, { email, name }),
    type: 'welcome',
    userId,
  })
}

/**
 * Send quote generated notification email
 */
export async function sendQuoteNotificationEmail({
  userId,
  email,
  userName,
  shopName,
  recipientAddress,
  quotes,
  createdAt,
}: {
  userId: string
  email: string
  userName?: string
  shopName: string
  recipientAddress: string
  quotes: Array<{
    provider: string
    service: string
    amount: number
    currency?: string
  }>
  createdAt: Date | string
}): Promise<EmailResult> {
  console.log(`📧 Sending quote notification email to ${email}`)
  
  // Find best quote (lowest price)
  const sortedQuotes = [...quotes].sort((a, b) => a.amount - b.amount)
  const bestQuote = sortedQuotes.length > 0 ? sortedQuotes[0] : undefined
  
  // Ensure all quotes have currency
  const quotesWithCurrency = quotes.map(q => ({
    ...q,
    currency: q.currency || 'VND',
  }))
  
  return await sendEmail({
    to: email,
    subject: `📦 Báo giá mới cho ${shopName}`,
    react: createElement(QuoteGeneratedEmail, {
      userName,
      shopName,
      recipientAddress,
      quotes: quotesWithCurrency,
      bestQuote,
      createdAt: typeof createdAt === 'string' ? createdAt : createdAt.toISOString(),
    }),
    type: 'quote_generated',
    userId,
  })
}

/**
 * Check if user has enabled email notifications
 */
export async function shouldSendEmailNotification(
  userId: string,
  notificationType: 'quoteGenerated' | 'marketing' | 'dailySummary' | 'weeklySummary' | 'priceAlerts' | 'failedQuotes'
): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationSettings: true },
    })
    
    if (!user || !user.notificationSettings) {
      // Default: enable quote notifications
      return notificationType === 'quoteGenerated'
    }
    
    const settings = user.notificationSettings as Record<string, boolean>
    
    // Return the setting value, default to true for quoteGenerated
    return settings[notificationType] ?? (notificationType === 'quoteGenerated')
  } catch (error) {
    console.error('Error checking notification settings:', error)
    // Default to true for quote notifications on error
    return notificationType === 'quoteGenerated'
  }
}
