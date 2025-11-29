import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'
import WelcomeEmail from '@/lib/email/templates/WelcomeEmail'
import QuoteGeneratedEmail from '@/lib/email/templates/QuoteGeneratedEmail'
import WeeklySummaryEmail from '@/lib/email/templates/WeeklySummaryEmail'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get template type from query params
    const { searchParams } = new URL(request.url)
    const template = searchParams.get('template') || 'welcome'
    const to = searchParams.get('to') || user.email || 'test@example.com'
    const userEmail = user.email || 'test@example.com'
    const userName = userEmail.split('@')[0]

    let subject = ''
    let emailTemplate

    switch (template) {
      case 'welcome':
        subject = 'Chào mừng bạn đến với Addressify! 🎉'
        emailTemplate = WelcomeEmail({
          name: userName,
          email: userEmail,
        })
        break

      case 'quote':
        subject = 'Báo giá mới cho Shop Demo 📦'
        emailTemplate = QuoteGeneratedEmail({
          userName,
          shopName: 'Shop Demo',
          recipientAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
          quotes: [
            { provider: 'GHN', service: 'Hỏa tốc', amount: 25000, currency: 'VND' },
            { provider: 'GHTK', service: 'Nhanh', amount: 22000, currency: 'VND' },
            { provider: 'VTP', service: 'Tiêu chuẩn', amount: 28000, currency: 'VND' },
          ],
          bestQuote: { provider: 'GHTK', service: 'Nhanh', amount: 22000 },
          createdAt: new Date().toISOString(),
        })
        break

      case 'weekly':
        subject = 'Báo cáo tuần của bạn 📊'
        emailTemplate = WeeklySummaryEmail({
          userName,
          weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          weekEnd: new Date().toISOString(),
          stats: {
            totalQuotes: 45,
            totalShops: 3,
            totalSavings: 125000,
            avgAmount: 24500,
            topProvider: { name: 'GHTK', count: 25 },
            topShop: { name: 'Shop Thời Trang', count: 20 },
          },
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid template. Use: welcome, quote, or weekly' },
          { status: 400 }
        )
    }

    // Send email
    const result = await sendEmail({
      to,
      subject,
      react: emailTemplate,
      type: 'quote_generated',
      userId: user.id,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '✅ Email đã được gửi thành công!',
        messageId: result.messageId,
        template,
        to,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: '❌ Không thể gửi email',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: '❌ Đã xảy ra lỗi khi gửi email',
      },
      { status: 500 }
    )
  }
}
