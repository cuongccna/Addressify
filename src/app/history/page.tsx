'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useShop } from '@/contexts/ShopContext'
import QuoteHistoryDashboard from '@/components/features/QuoteHistoryDashboard'
import QuoteAnalyticsWrapper from '@/components/features/QuoteAnalyticsWrapper'

type ViewMode = 'table' | 'analytics'

export default function QuoteHistoryPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { selectedShop, loading: shopLoading } = useShop()
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [user, authLoading, router])

  if (authLoading || shopLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📊 Lịch Sử Báo Giá
              </h1>
              <p className="text-purple-200">
                {selectedShop 
                  ? `Shop: ${selectedShop.name}` 
                  : 'Vui lòng chọn shop để xem lịch sử'}
              </p>
            </div>
            
            {selectedShop && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-purple-600 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  📋 Bảng dữ liệu
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    viewMode === 'analytics'
                      ? 'bg-purple-600 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  📈 Phân tích
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedShop ? (
          viewMode === 'table' ? (
            <QuoteHistoryDashboard shopId={selectedShop.id} />
          ) : (
            <QuoteAnalyticsWrapper shopId={selectedShop.id} />
          )
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
            <p className="text-white text-lg">
              ⚠️ Vui lòng chọn shop từ menu trên để xem lịch sử báo giá
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
