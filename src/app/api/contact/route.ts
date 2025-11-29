import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  orderVolume: z.string().optional(),
  message: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = contactSchema.parse(body)
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Addressify Contact <onboarding@resend.dev>', // Replace with your verified domain
      to: ['cuong.vhcc@gmail.com'],
      replyTo: validatedData.email,
      subject: `[Addressify] Yêu cầu tư vấn từ ${validatedData.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 10px 10px;
              }
              .field {
                margin-bottom: 20px;
                padding: 15px;
                background: white;
                border-radius: 8px;
                border-left: 4px solid #667eea;
              }
              .label {
                font-weight: 600;
                color: #667eea;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
              }
              .value {
                color: #1f2937;
                font-size: 16px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">📧 Yêu cầu tư vấn mới</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Từ trang liên hệ Addressify</p>
            </div>
            
            <div class="content">
              <div class="field">
                <div class="label">👤 Họ & Tên</div>
                <div class="value">${validatedData.name}</div>
              </div>
              
              <div class="field">
                <div class="label">📧 Email</div>
                <div class="value"><a href="mailto:${validatedData.email}" style="color: #667eea; text-decoration: none;">${validatedData.email}</a></div>
              </div>
              
              ${validatedData.orderVolume ? `
                <div class="field">
                  <div class="label">📦 Số lượng đơn/ngày</div>
                  <div class="value">${validatedData.orderVolume}</div>
                </div>
              ` : ''}
              
              <div class="field">
                <div class="label">💬 Nội dung cần hỗ trợ</div>
                <div class="value" style="white-space: pre-wrap;">${validatedData.message}</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Email này được gửi tự động từ form liên hệ <strong>Addressify</strong></p>
              <p style="margin-top: 10px;">
                <a href="mailto:${validatedData.email}?subject=Re: Yêu cầu tư vấn Addressify" 
                   style="color: #667eea; text-decoration: none; font-weight: 600;">
                  → Trả lời khách hàng
                </a>
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('[Contact API] Resend error:', error)
      return NextResponse.json(
        { success: false, error: 'Không thể gửi email. Vui lòng thử lại.' },
        { status: 500 }
      )
    }

    console.log('[Contact API] Email sent successfully:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Email đã được gửi thành công!',
      emailId: data?.id
    })

  } catch (error) {
    console.error('[Contact API] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dữ liệu không hợp lệ',
          errors: error.issues 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}
