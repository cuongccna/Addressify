'use client'

import { useState, useEffect, useMemo } from 'react'
import type { QuoteHistory } from '@prisma/client'

interface QuoteHistoryDashboardProps {
  shopId: string
}

interface Quote {
  provider: string
  service?: string
  amount: number
  deliveryTime?: string
}

interface QuoteHistoryWithParsedQuotes extends Omit<QuoteHistory, 'quotes'> {
  quotes: Quote[]
}

export default function QuoteHistoryDashboard({ shopId }: QuoteHistoryDashboardProps) {
  const [histories, setHistories] = useState<QuoteHistoryWithParsedQuotes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [providerFilter, setProviderFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Fetch data
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

  // Filter and sort data
  const filteredHistories = useMemo(() => {
    let filtered = [...histories]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(h => 
        h.recipientName?.toLowerCase().includes(query) ||
        h.recipientPhone?.toLowerCase().includes(query) ||
        h.recipientAddress?.toLowerCase().includes(query) ||
        h.normalizedAddress?.toLowerCase().includes(query)
      )
    }

    // Provider filter
    if (providerFilter !== 'all') {
      filtered = filtered.filter(h => 
        h.quotes.some(q => q.provider === providerFilter)
      )
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(h => 
        new Date(h.createdAt) >= new Date(dateFrom)
      )
    }
    if (dateTo) {
      filtered = filtered.filter(h => 
        new Date(h.createdAt) <= new Date(dateTo + 'T23:59:59')
      )
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else {
        // Sort by minimum amount
        const minA = Math.min(...a.quotes.map(q => q.amount))
        const minB = Math.min(...b.quotes.map(q => q.amount))
        return sortOrder === 'desc' ? minB - minA : minA - minB
      }
    })

    return filtered
  }, [histories, searchQuery, providerFilter, dateFrom, dateTo, sortBy, sortOrder])

  // Statistics
  const stats = useMemo(() => {
    if (filteredHistories.length === 0) {
      return {
        totalQuotes: 0,
        avgAmount: 0,
        minAmount: 0,
        maxAmount: 0,
        providerCounts: {},
        totalSavings: 0
      }
    }

    const allQuotes = filteredHistories.flatMap(h => h.quotes)
    const amounts = allQuotes.map(q => q.amount)
    
    const providerCounts: Record<string, number> = {}
    allQuotes.forEach(q => {
      providerCounts[q.provider] = (providerCounts[q.provider] || 0) + 1
    })

    // Calculate potential savings (difference between max and min for each history)
    const totalSavings = filteredHistories.reduce((sum, h) => {
      if (h.quotes.length < 2) return sum
      const amounts = h.quotes.map(q => q.amount)
      const max = Math.max(...amounts)
      const min = Math.min(...amounts)
      return sum + (max - min)
    }, 0)

    return {
      totalQuotes: filteredHistories.length,
      avgAmount: amounts.reduce((a, b) => a + b, 0) / amounts.length,
      minAmount: Math.min(...amounts),
      maxAmount: Math.max(...amounts),
      providerCounts,
      totalSavings
    }
  }, [filteredHistories])

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Ngày giờ',
      'Người nhận',
      'SĐT',
      'Địa chỉ gốc',
      'Địa chỉ chuẩn hóa',
      'Tỉnh/TP',
      'Quận/Huyện',
      'Phường/Xã',
      'Độ tin cậy',
      'Cân nặng (g)',
      'Giá trị (VND)',
      'Nhà cung cấp',
      'Dịch vụ',
      'Phí ship (VND)',
      'Thời gian giao',
      'Ghi chú'
    ]

    const rows = filteredHistories.flatMap(h => 
      h.quotes.map(q => [
        new Date(h.createdAt).toLocaleString('vi-VN'),
        h.recipientName || '',
        h.recipientPhone || '',
        h.recipientAddress || '',
        h.normalizedAddress || '',
        h.province || '',
        h.district || '',
        h.ward || '',
        h.confidence || 0,
        h.weight || 0,
        h.value || 0,
        q.provider,
        q.service || '',
        q.amount,
        q.deliveryTime || '',
        h.note || ''
      ])
    )

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `quote-history-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
        <div className="text-white text-lg">⏳ Đang tải lịch sử...</div>
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

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-lg p-6 border border-purple-400/30">
          <div className="text-purple-200 text-sm mb-1">Tổng số báo giá</div>
          <div className="text-white text-3xl font-bold">{stats.totalQuotes}</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-lg p-6 border border-blue-400/30">
          <div className="text-blue-200 text-sm mb-1">Phí ship trung bình</div>
          <div className="text-white text-3xl font-bold">
            {stats.avgAmount.toLocaleString('vi-VN')}₫
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-lg p-6 border border-green-400/30">
          <div className="text-green-200 text-sm mb-1">Phí thấp nhất</div>
          <div className="text-white text-3xl font-bold">
            {stats.minAmount.toLocaleString('vi-VN')}₫
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-lg p-6 border border-orange-400/30">
          <div className="text-orange-200 text-sm mb-1">Tiết kiệm tiềm năng</div>
          <div className="text-white text-3xl font-bold">
            {stats.totalSavings.toLocaleString('vi-VN')}₫
          </div>
        </div>
      </div>

      {/* Provider Distribution */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-white text-lg font-semibold mb-4">📈 Phân bố nhà cung cấp</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.providerCounts).map(([provider, count]) => (
            <div key={provider} className="bg-white/5 rounded-lg p-4">
              <div className="text-white/70 text-sm">{provider}</div>
              <div className="text-white text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-white text-lg font-semibold mb-4">🔍 Bộ lọc & Tìm kiếm</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-white/80 text-sm block mb-2">Tìm kiếm</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tên, SĐT, địa chỉ..."
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-white/80 text-sm block mb-2">Nhà cung cấp</label>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả</option>
              <option value="GHN">GHN</option>
              <option value="GHTK">GHTK</option>
              <option value="VTP">VTP</option>
              <option value="GHN Express">GHN Express</option>
            </select>
          </div>

          <div>
            <label className="text-white/80 text-sm block mb-2">Từ ngày</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-white/80 text-sm block mb-2">Đến ngày</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-sm">Sắp xếp:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="date">Ngày</option>
              <option value="amount">Phí ship</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white/80 text-sm">Thứ tự:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchQuery('')
              setProviderFilter('all')
              setDateFrom('')
              setDateTo('')
              setSortBy('date')
              setSortOrder('desc')
            }}
            className="px-4 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white text-sm transition"
          >
            🔄 Reset
          </button>

          <button
            onClick={exportToCSV}
            disabled={filteredHistories.length === 0}
            className="px-4 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white text-sm transition"
          >
            📥 Export CSV ({filteredHistories.length})
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-white text-lg font-semibold">
            📋 Kết quả ({filteredHistories.length} báo giá)
          </h3>
        </div>

        {filteredHistories.length === 0 ? (
          <div className="p-8 text-center text-white/60">
            Không có dữ liệu phù hợp với bộ lọc
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Ngày giờ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Người nhận
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Báo giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Tốt nhất
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredHistories.map((history) => {
                  const bestQuote = history.quotes.reduce((best, current) => 
                    current.amount < best.amount ? current : best
                  , history.quotes[0])

                  return (
                    <tr key={history.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white/90">
                        {new Date(history.createdAt).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/90">
                        <div className="font-medium">{history.recipientName}</div>
                        <div className="text-white/60 text-xs">{history.recipientPhone}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80 max-w-xs">
                        <div className="truncate" title={history.normalizedAddress || history.recipientAddress}>
                          {history.normalizedAddress || history.recipientAddress}
                        </div>
                        <div className="text-white/60 text-xs">
                          {history.ward}, {history.district}, {history.province}
                        </div>
                        {history.confidence !== null && (
                          <div className="text-xs mt-1">
                            <span className={`px-2 py-0.5 rounded ${
                              history.confidence >= 80 ? 'bg-green-500/20 text-green-300' :
                              history.confidence >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {history.confidence}% tin cậy
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="space-y-1">
                          {history.quotes.map((quote, idx) => (
                            <div 
                              key={idx}
                              className={`flex items-center justify-between gap-2 px-2 py-1 rounded ${
                                quote.provider === bestQuote.provider && quote.amount === bestQuote.amount
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'text-white/80'
                              }`}
                            >
                              <span className="font-medium">{quote.provider}</span>
                              <span className="font-mono">{quote.amount.toLocaleString('vi-VN')}₫</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="text-green-300 font-bold">
                          {bestQuote.provider}
                        </div>
                        <div className="text-white/90 font-mono">
                          {bestQuote.amount.toLocaleString('vi-VN')}₫
                        </div>
                        {bestQuote.deliveryTime && (
                          <div className="text-white/60 text-xs">
                            ⏱️ {bestQuote.deliveryTime}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
