'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/buttonVariants'

interface ComingSoonPageProps {
  title: string
  description: string
  icon: ReactNode
  features: string[]
  availableNow: Array<{ label: string; href: string }>
  timeline?: string
}

export function ComingSoonPage({
  title,
  description,
  icon,
  features,
  availableNow,
  timeline = 'Sẽ được ra mắt trong các phiên bản tiếp theo.'
}: ComingSoonPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-sky-400" />
          <p className="mt-4 text-slate-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Về trang chủ
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-slate-400">{description}</p>
        </div>

        {/* Coming Soon Message */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-500/20">
            {icon}
          </div>

          <h2 className="text-2xl font-semibold text-white">Tính năng đang được phát triển</h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            {title} đang được xây dựng để mang đến trải nghiệm tốt nhất cho bạn.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/normalize"
              className={buttonVariants({ className: 'w-full sm:w-auto' })}
            >
              Xử lý đơn hàng ngay
            </Link>
            <Link
              href="/history"
              className={buttonVariants({ variant: 'secondary', className: 'w-full sm:w-auto' })}
            >
              Xem lịch sử
            </Link>
          </div>

          <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <h3 className="text-sm font-semibold text-slate-300">Sẽ có gì?</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                {features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <h3 className="text-sm font-semibold text-slate-300">Hiện tại dùng gì?</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                {availableNow.map((item, index) => (
                  <li key={index}>
                    • <Link href={item.href} className="text-sky-400 hover:underline">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <h3 className="text-sm font-semibold text-slate-300">Timeline</h3>
              <p className="mt-3 text-sm text-slate-400">{timeline}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
