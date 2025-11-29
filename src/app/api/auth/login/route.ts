import { NextRequest, NextResponse } from 'next/server'
import { signIn, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    const { user, token, error } = await signIn(email, password)

    if (error || !user || !token) {
      return NextResponse.json(
        { error: error || 'Đăng nhập thất bại' },
        { status: 401 }
      )
    }

    // Set session cookie
    await setSessionCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Đăng nhập thất bại' },
      { status: 500 }
    )
  }
}
