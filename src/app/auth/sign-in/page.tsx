'use client'

import { useState, Suspense } from 'react'
import Link from "next/link"
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from "@/components/ui/Card"
import { buttonVariants } from "@/components/ui/buttonVariants"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại')
      }

      console.log('✅ Đăng nhập thành công:', data)
      
      // Redirect về trang chủ hoặc trang được request
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('❌ Lỗi đăng nhập:', err)
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-20 text-slate-50">
      <Card className="w-full max-w-md space-y-6 bg-slate-900/70 text-left" glass padding="lg">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Chào mừng trở lại</p>
          <h1 className="text-3xl font-semibold tracking-tight">Đăng nhập Addressify</h1>
          <p className="text-sm text-slate-300">
            Đăng nhập để tiếp tục sử dụng các tính năng của Addressify.
          </p>
        </div>

        {message && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

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
              autoComplete="email"
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
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
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
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="flex flex-col gap-3 text-xs text-slate-400 text-center">
          <Link 
            href="/auth/forgot-password" 
            className="text-sky-300 transition hover:text-sky-200"
          >
            Quên mật khẩu?
          </Link>
          
          <div className="flex items-center justify-center gap-2">
            <span>Chưa có tài khoản?</span>
            <Link className="text-sky-300 transition hover:text-sky-200" href="/auth/sign-up">
              Đăng ký ngay
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <Link 
            href="/"
            className={buttonVariants({ variant: "secondary", className: "w-full" })}
          >
            ← Về trang chủ
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
