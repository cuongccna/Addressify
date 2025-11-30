'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useShop } from '@/contexts/ShopContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ShopSelector } from '@/components/shops/ShopSelector'

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { loading: shopLoading } = useShop()
  const router = useRouter()

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
      {/* Shop Selector Bar */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Shop đang chọn:</span>
            <ShopSelector />
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
