'use client'

import { useState, useEffect } from 'react'
import EnhancedAnalytics from './EnhancedAnalytics'
import type { QuoteHistory } from '@prisma/client'

interface Quote {
  provider: string
  service?: string
  amount: number
  deliveryTime?: string
}

interface QuoteHistoryWithParsedQuotes extends Omit<QuoteHistory, 'quotes'> {
  quotes: Quote[]
}

interface QuoteAnalyticsWrapperProps {
  shopId: string
}

export default function QuoteAnalyticsWrapper({ shopId }: QuoteAnalyticsWrapperProps) {
  const [histories, setHistories] = useState<QuoteHistoryWithParsedQuotes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId])

  const fetchHistories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/quote-history?shopId=${shopId}&limit=500`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote history')
      }
      
      const data = await response.json()
      setHistories(data.quoteHistories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
        <div className="text-white text-lg">⏳ Đang tải dữ liệu phân tích...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-6">
        <p className="text-red-200">❌ Lỗi: {error}</p>
        <button 
          onClick={fetchHistories}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return <EnhancedAnalytics histories={histories} />
}
