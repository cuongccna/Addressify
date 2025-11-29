import { NextRequest, NextResponse } from 'next/server'
import { signUp, createSession, setSessionCookie } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email/send-emails'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    // Sign up user with Prisma
    const { user, error } = await signUp(email, password, name)

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Đăng ký thất bại' },
        { status: 400 }
      )
    }

    // Create session and set cookie
    const token = await createSession(user.id)
    await setSessionCookie(token)

    // Send welcome email asynchronously
    sendWelcomeEmail({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
    }).catch(err => {
      console.error('Failed to send welcome email:', err)
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'Đăng ký thành công!',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Đăng ký thất bại' },
      { status: 500 }
    )
  }
}
