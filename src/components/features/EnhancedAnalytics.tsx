'use client'

import { useState, useMemo } from 'react'
import QuoteAnalytics from './QuoteAnalytics'
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

interface EnhancedAnalyticsProps {
  histories: QuoteHistoryWithParsedQuotes[]
}

type DatePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom'

export default function EnhancedAnalytics({ histories }: EnhancedAnalyticsProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>('last7days')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [comparePeriod, setComparePeriod] = useState<'previous' | 'lastYear'>('previous')

  // Get unique providers
  const providers = useMemo(() => {
    const providerSet = new Set<string>()
    histories.forEach(h => {
      h.quotes.forEach(q => providerSet.add(q.provider))
    })
    return Array.from(providerSet).sort()
  }, [histories])

  // Calculate date range based on preset
  const dateRange = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    let from: Date
    let to: Date = new Date(today.getTime() + 86400000 - 1) // End of today

    switch (datePreset) {
      case 'today':
        from = today
        break
      case 'yesterday':
        from = new Date(today.getTime() - 86400000)
        to = new Date(today.getTime() - 1)
        break
      case 'last7days':
        from = new Date(today.getTime() - 7 * 86400000)
        break
      case 'last30days':
        from = new Date(today.getTime() - 30 * 86400000)
        break
      case 'thisMonth':
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'lastMonth':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        break
      case 'custom':
        from = customDateFrom ? new Date(customDateFrom) : new Date(today.getTime() - 30 * 86400000)
        to = customDateTo ? new Date(customDateTo + 'T23:59:59') : new Date(today.getTime() + 86400000 - 1)
        break
      default:
        from = new Date(today.getTime() - 7 * 86400000)
    }

    return { from, to }
  }, [datePreset, customDateFrom, customDateTo])

  // Filter histories by date range and provider
  const filteredHistories = useMemo(() => {
    return histories.filter(h => {
      const date = new Date(h.createdAt)
      const inDateRange = date >= dateRange.from && date <= dateRange.to
      
      if (!inDateRange) return false
      
      if (selectedProvider === 'all') return true
      
      return h.quotes.some(q => q.provider === selectedProvider)
    })
  }, [histories, dateRange, selectedProvider])

  // Calculate comparison period data
  const comparisonData = useMemo(() => {
    if (!compareEnabled) return null

    const periodLength = dateRange.to.getTime() - dateRange.from.getTime()
    let compareFrom: Date
    let compareTo: Date

    if (comparePeriod === 'previous') {
      compareTo = new Date(dateRange.from.getTime() - 1)
      compareFrom = new Date(compareTo.getTime() - periodLength)
    } else {
      // Last year
      compareFrom = new Date(dateRange.from)
      compareFrom.setFullYear(compareFrom.getFullYear() - 1)
      compareTo = new Date(dateRange.to)
      compareTo.setFullYear(compareTo.getFullYear() - 1)
    }

    const compareHistories = histories.filter(h => {
      const date = new Date(h.createdAt)
      const inDateRange = date >= compareFrom && date <= compareTo
      if (!inDateRange) return false
      if (selectedProvider === 'all') return true
      return h.quotes.some(q => q.provider === selectedProvider)
    })

    // Calculate metrics for both periods
    const currentMetrics = calculateMetrics(filteredHistories)
    const compareMetrics = calculateMetrics(compareHistories)

    return {
      current: currentMetrics,
      compare: compareMetrics,
      periodName: comparePeriod === 'previous' ? 'Kỳ trước' : 'Cùng kỳ năm ngoái'
    }
  }, [compareEnabled, comparePeriod, dateRange, histories, selectedProvider, filteredHistories])

  // Calculate metrics helper
  function calculateMetrics(data: QuoteHistoryWithParsedQuotes[]) {
    if (data.length === 0) {
      return {
        totalQuotes: 0,
        avgAmount: 0,
        minAmount: 0,
        maxAmount: 0,
        totalSavings: 0
      }
    }

    const allQuotes = data.flatMap(h => h.quotes)
    const amounts = allQuotes.map(q => q.amount)
    
    const totalSavings = data.reduce((sum, h) => {
      if (h.quotes.length < 2) return sum
      const amounts = h.quotes.map(q => q.amount)
      return sum + (Math.max(...amounts) - Math.min(...amounts))
    }, 0)

    return {
      totalQuotes: data.length,
      avgAmount: amounts.reduce((a, b) => a + b, 0) / amounts.length,
      minAmount: Math.min(...amounts),
      maxAmount: Math.max(...amounts),
      totalSavings
    }
  }

  // Calculate percentage change
  function percentageChange(current: number, previous: number): string {
    if (previous === 0) return '+∞'
    const change = ((current - previous) / previous) * 100
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-white text-lg font-semibold mb-4">🎛️ Bộ Lọc Nâng Cao</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Preset */}
          <div>
            <label className="text-white/80 text-sm block mb-2">Khoảng thời gian</label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DatePreset)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="last7days">7 ngày qua</option>
              <option value="last30days">30 ngày qua</option>
              <option value="thisMonth">Tháng này</option>
              <option value="lastMonth">Tháng trước</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
          </div>

          {/* Provider Filter */}
          <div>
            <label className="text-white/80 text-sm block mb-2">Nhà cung cấp</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả</option>
              {providers.map(provider => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
            </select>
          </div>

          {/* Compare Toggle */}
          <div>
            <label className="text-white/80 text-sm block mb-2">So sánh</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareEnabled(!compareEnabled)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  compareEnabled
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {compareEnabled ? '✓ Đang so sánh' : 'Bật so sánh'}
              </button>
              {compareEnabled && (
                <select
                  value={comparePeriod}
                  onChange={(e) => setComparePeriod(e.target.value as 'previous' | 'lastYear')}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="previous">Kỳ trước</option>
                  <option value="lastYear">Cùng kỳ năm trước</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Custom Date Range */}
        {datePreset === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-white/80 text-sm block mb-2">Từ ngày</label>
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-white/80 text-sm block mb-2">Đến ngày</label>
              <input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {/* Current Period Info */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-white/60 text-sm">
            Kỳ hiện tại: {dateRange.from.toLocaleDateString('vi-VN')} → {dateRange.to.toLocaleDateString('vi-VN')}
            {selectedProvider !== 'all' && ` • Chỉ ${selectedProvider}`}
          </div>
          <div className="text-white/80 font-semibold">
            {filteredHistories.length} báo giá
          </div>
        </div>
      </div>

      {/* Comparison Metrics */}
      {comparisonData && (
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg p-6 border border-purple-400/30">
          <h3 className="text-white text-lg font-semibold mb-4">📊 So Sánh Kỳ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Quotes Comparison */}
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white/70 text-xs mb-1">Tổng báo giá</div>
              <div className="flex items-end gap-2">
                <div className="text-white text-2xl font-bold">{comparisonData.current.totalQuotes}</div>
                <div className={`text-sm font-semibold ${
                  comparisonData.current.totalQuotes >= comparisonData.compare.totalQuotes
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {percentageChange(comparisonData.current.totalQuotes, comparisonData.compare.totalQuotes)}
                </div>
              </div>
              <div className="text-white/50 text-xs mt-1">
                {comparisonData.periodName}: {comparisonData.compare.totalQuotes}
              </div>
            </div>

            {/* Average Amount Comparison */}
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white/70 text-xs mb-1">Phí TB</div>
              <div className="flex items-end gap-2">
                <div className="text-white text-2xl font-bold">
                  {Math.round(comparisonData.current.avgAmount).toLocaleString('vi-VN')}₫
                </div>
                <div className={`text-sm font-semibold ${
                  comparisonData.current.avgAmount <= comparisonData.compare.avgAmount
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {percentageChange(comparisonData.current.avgAmount, comparisonData.compare.avgAmount)}
                </div>
              </div>
              <div className="text-white/50 text-xs mt-1">
                {comparisonData.periodName}: {Math.round(comparisonData.compare.avgAmount).toLocaleString('vi-VN')}₫
              </div>
            </div>

            {/* Min Amount Comparison */}
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white/70 text-xs mb-1">Phí thấp nhất</div>
              <div className="flex items-end gap-2">
                <div className="text-white text-2xl font-bold">
                  {comparisonData.current.minAmount.toLocaleString('vi-VN')}₫
                </div>
                <div className={`text-sm font-semibold ${
                  comparisonData.current.minAmount <= comparisonData.compare.minAmount
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {percentageChange(comparisonData.current.minAmount, comparisonData.compare.minAmount)}
                </div>
              </div>
              <div className="text-white/50 text-xs mt-1">
                {comparisonData.periodName}: {comparisonData.compare.minAmount.toLocaleString('vi-VN')}₫
              </div>
            </div>

            {/* Max Amount Comparison */}
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white/70 text-xs mb-1">Phí cao nhất</div>
              <div className="flex items-end gap-2">
                <div className="text-white text-2xl font-bold">
                  {comparisonData.current.maxAmount.toLocaleString('vi-VN')}₫
                </div>
                <div className={`text-sm font-semibold ${
                  comparisonData.current.maxAmount <= comparisonData.compare.maxAmount
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {percentageChange(comparisonData.current.maxAmount, comparisonData.compare.maxAmount)}
                </div>
              </div>
              <div className="text-white/50 text-xs mt-1">
                {comparisonData.periodName}: {comparisonData.compare.maxAmount.toLocaleString('vi-VN')}₫
              </div>
            </div>

            {/* Savings Comparison */}
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-white/70 text-xs mb-1">Tiết kiệm</div>
              <div className="flex items-end gap-2">
                <div className="text-white text-2xl font-bold">
                  {comparisonData.current.totalSavings.toLocaleString('vi-VN')}₫
                </div>
                <div className={`text-sm font-semibold ${
                  comparisonData.current.totalSavings >= comparisonData.compare.totalSavings
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {percentageChange(comparisonData.current.totalSavings, comparisonData.compare.totalSavings)}
                </div>
              </div>
              <div className="text-white/50 text-xs mt-1">
                {comparisonData.periodName}: {comparisonData.compare.totalSavings.toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-4 p-4 bg-white/5 rounded-lg">
            <div className="text-white/70 text-sm">
              <strong className="text-white">💡 Nhận xét:</strong>
              {' '}
              {comparisonData.current.totalQuotes > comparisonData.compare.totalQuotes 
                ? `Tăng ${comparisonData.current.totalQuotes - comparisonData.compare.totalQuotes} báo giá so với ${comparisonData.periodName.toLowerCase()}.`
                : comparisonData.current.totalQuotes < comparisonData.compare.totalQuotes
                ? `Giảm ${comparisonData.compare.totalQuotes - comparisonData.current.totalQuotes} báo giá so với ${comparisonData.periodName.toLowerCase()}.`
                : `Số lượng báo giá giữ ổn định so với ${comparisonData.periodName.toLowerCase()}.`
              }
              {' '}
              {comparisonData.current.avgAmount > comparisonData.compare.avgAmount
                ? `Phí ship trung bình tăng ${percentageChange(comparisonData.current.avgAmount, comparisonData.compare.avgAmount)}.`
                : comparisonData.current.avgAmount < comparisonData.compare.avgAmount
                ? `Phí ship trung bình giảm ${Math.abs(parseFloat(percentageChange(comparisonData.current.avgAmount, comparisonData.compare.avgAmount)))}%.`
                : `Phí ship ổn định.`
              }
              {' '}
              {comparisonData.current.totalSavings > comparisonData.compare.totalSavings
                ? `Tiết kiệm được nhiều hơn ${(comparisonData.current.totalSavings - comparisonData.compare.totalSavings).toLocaleString('vi-VN')}₫! 🎉`
                : comparisonData.current.totalSavings < comparisonData.compare.totalSavings
                ? `Tiết kiệm ít hơn ${(comparisonData.compare.totalSavings - comparisonData.current.totalSavings).toLocaleString('vi-VN')}₫.`
                : `Mức tiết kiệm tương đương.`
              }
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      {filteredHistories.length > 0 ? (
        <QuoteAnalytics histories={filteredHistories} />
      ) : (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center border border-white/20">
          <p className="text-white/60">
            Không có dữ liệu trong khoảng thời gian đã chọn.
            {selectedProvider !== 'all' && ` Thử chọn nhà cung cấp khác hoặc "Tất cả".`}
          </p>
        </div>
      )}
    </div>
  )
}
