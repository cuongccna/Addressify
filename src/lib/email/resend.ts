import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY not set. Email functionality will not work.')
}

export const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')

export const EMAIL_FROM = process.env.EMAIL_FROM || 'Addressify <onboarding@resend.dev>'

// Email types
export type EmailType = 
  | 'welcome'
  | 'quote_generated'
  | 'daily_summary'
  | 'weekly_summary'
  | 'price_alert'
  | 'failed_quote'
  | 'bulk_quote_completed'

// Email sending result
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Send email with logging
export async function sendEmail({
  to,
  subject,
  html,
  react,
  type = 'quote_generated',
  userId,
}: {
  to: string | string[]
  subject: string
  html?: string
  react?: React.ReactElement
  type?: EmailType
  userId?: string
}): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      react,
    })

    if (error) {
      console.error('❌ Email send failed:', error)
      
      // Log failure to database if userId provided
      if (userId) {
        await logEmail({
          userId,
          type,
          to: Array.isArray(to) ? to.join(', ') : to,
          subject,
          status: 'failed',
          error: error.message || 'Unknown error',
        })
      }
      
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }

    console.log('✅ Email sent:', data?.id)
    
    // Log success to database if userId provided
    if (userId) {
      await logEmail({
        userId,
        type,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        status: 'sent',
      })
    }

    return {
      success: true,
      messageId: data?.id,
    }
  } catch (error) {
    console.error('❌ Email send exception:', error)
    
    // Log exception to database if userId provided
    if (userId) {
      await logEmail({
        userId,
        type,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown exception',
      })
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown exception',
    }
  }
}

// Log email to database
async function logEmail({
  userId,
  type,
  to,
  subject,
  status,
  error,
}: {
  userId: string
  type: EmailType
  to: string
  subject: string
  status: 'sent' | 'failed' | 'pending'
  error?: string
}) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    await prisma.emailLog.create({
      data: {
        userId,
        type,
        to,
        subject,
        status,
        error,
      },
    })
  } catch (err) {
    console.error('Failed to log email:', err)
  }
}

// Get email logs for user
export async function getEmailLogs(userId: string, limit = 50) {
  const { prisma } = await import('@/lib/prisma')
  
  return await prisma.emailLog.findMany({
    where: { userId },
    orderBy: { sentAt: 'desc' },
    take: limit,
  })
}

// Get email statistics
export async function getEmailStats(userId: string, days = 30) {
  const { prisma } = await import('@/lib/prisma')
  
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  const logs = await prisma.emailLog.findMany({
    where: {
      userId,
      sentAt: {
        gte: since,
      },
    },
  })
  
  const total = logs.length
  const sent = logs.filter(log => log.status === 'sent').length
  const failed = logs.filter(log => log.status === 'failed').length
  const pending = logs.filter(log => log.status === 'pending').length
  
  const byType = logs.reduce((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    total,
    sent,
    failed,
    pending,
    successRate: total > 0 ? (sent / total) * 100 : 0,
    byType,
  }
}
