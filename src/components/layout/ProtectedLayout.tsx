'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useShop } from '@/contexts/ShopContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { ShopSelector } from '@/components/shops/ShopSelector'
import Link from 'next/link'

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { loading: shopLoading } = useShop()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [user, authLoading, router])

  if (authLoading || shopLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with Shop Selector */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-white">Addressify</h1>
            
            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <Link
                href="/normalize"
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/normalize'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                🎯 Báo giá
              </Link>
              <Link
                href="/history"
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/history'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                📊 Lịch sử
              </Link>
            </nav>
            
            <ShopSelector />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {user.email}
            </span>
            <button
              onClick={() => {
                // Logout logic will be added
                fetch('/api/auth/logout', { method: 'POST' })
                  .then(() => window.location.href = '/auth/sign-in')
              }}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </div>
    </div>
  )
}
