'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/buttonVariants'

export default function DashboardPage() {
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
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Tổng quan hoạt động và thống kê của bạn
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-500/20">
            <svg className="h-10 w-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-white">Dashboard đang được phát triển</h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Trang dashboard với biểu đồ thống kê, báo cáo chi tiết và phân tích hiệu suất đang được xây dựng.
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
                <li>• Thống kê đơn hàng</li>
                <li>• Biểu đồ chi phí vận chuyển</li>
                <li>• Top địa chỉ xử lý</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <h3 className="text-sm font-semibold text-slate-300">Hiện tại dùng gì?</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>• <Link href="/normalize" className="text-sky-400 hover:underline">Xử lý đơn hàng</Link></li>
                <li>• <Link href="/history" className="text-sky-400 hover:underline">Lịch sử báo giá</Link></li>
                <li>• <Link href="/settings" className="text-sky-400 hover:underline">Cài đặt</Link></li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
              <h3 className="text-sm font-semibold text-slate-300">Timeline</h3>
              <p className="mt-3 text-sm text-slate-400">
                Dashboard sẽ được ra mắt trong Phase 6 - Analytics & Reporting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
