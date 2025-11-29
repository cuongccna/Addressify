'use client'

import { useState } from 'react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Card } from "@/components/ui/Card"
import { buttonVariants } from "@/components/ui/buttonVariants"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!email || !password) {
      setError('Email và mật khẩu là bắt buộc')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: name || email.split('@')[0],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Đăng ký thất bại')
      }

      console.log('✅ Đăng ký thành công:', data)
      setSuccess(true)
      
      // Redirect sau 2 giây với message phù hợp
      const redirectMessage = data.needsConfirmation 
        ? 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.'
        : 'Đăng ký thành công! Vui lòng đăng nhập.'
      
      setTimeout(() => {
        router.push(`/auth/sign-in?message=${encodeURIComponent(redirectMessage)}`)
      }, 2000)
    } catch (err) {
      console.error('❌ Lỗi đăng ký:', err)
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-20 text-slate-50">
        <Card className="w-full max-w-xl space-y-6 bg-slate-900/70 text-center" glass padding="lg">
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-semibold tracking-tight">Đăng ký thành công!</h1>
          <p className="text-slate-300">
            Tài khoản của bạn đã được tạo.
          </p>
          <p className="text-sm text-slate-400">
            Đang chuyển hướng đến trang đăng nhập...
          </p>
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-sky-400" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-20 text-slate-50">
      <Card className="w-full max-w-xl space-y-6 bg-slate-900/70 text-left" glass padding="lg">
        <div className="space-y-3 text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Trải nghiệm sớm</p>
          <h1 className="text-3xl font-semibold tracking-tight">Đăng ký dùng thử Addressify</h1>
          <p className="text-sm text-slate-300">
            Tạo tài khoản miễn phí để bắt đầu sử dụng Addressify ngay hôm nay.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-slate-300">
              Tên của bạn (tùy chọn)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-slate-300">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              placeholder="you@shopname.vn"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-slate-300">
              Mật khẩu <span className="text-red-400">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              placeholder="Ít nhất 6 ký tự"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm text-slate-300">
              Xác nhận mật khẩu <span className="text-red-400">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={buttonVariants({ className: 'w-full disabled:opacity-50 disabled:cursor-not-allowed' })}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </span>
            ) : (
              'Đăng ký'
            )}
          </button>
        </form>

        <p className="text-xs text-sky-200">
          Ưu tiên các shop xử lý &gt; 100 đơn/ngày. Đăng ký miễn phí, không ràng buộc.
        </p>
        
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>Đã có tài khoản?</span>
          <Link className="text-sky-300 transition hover:text-sky-200" href="/auth/sign-in">
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  )
}
