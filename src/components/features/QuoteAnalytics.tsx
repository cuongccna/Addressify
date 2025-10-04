'use client'

import { useMemo, useRef } from 'react'
import html2canvas from 'html2canvas'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
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

interface QuoteAnalyticsProps {
  histories: QuoteHistoryWithParsedQuotes[]
}

// Colors for charts
const PROVIDER_COLORS = {
  'GHN': '#8b5cf6',
  'GHTK': '#3b82f6',
  'VTP': '#10b981',
  'GHN Express': '#f59e0b',
  'Other': '#6b7280'
}

export default function QuoteAnalytics({ histories }: QuoteAnalyticsProps) {
  const analyticsRef = useRef<HTMLDivElement>(null)

  // Export all charts as image
  const exportChartsAsImage = async () => {
    if (!analyticsRef.current) return

    try {
      const canvas = await html2canvas(analyticsRef.current, {
        backgroundColor: '#1e1b4b',
        scale: 2,
        logging: false,
      })

      const link = document.createElement('a')
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Không thể xuất biểu đồ. Vui lòng thử lại.')
    }
  }

  // 1. Cost Trends Over Time (Daily aggregation)
  const costTrendsData = useMemo(() => {
    if (histories.length === 0) return []

    // Group by date
    const dailyData: Record<string, { date: string; total: number; count: number; avg: number; min: number; max: number }> = {}
    
    histories.forEach(h => {
      const date = new Date(h.createdAt).toLocaleDateString('vi-VN', { 
        month: '2-digit', 
        day: '2-digit' 
      })
      
      const amounts = h.quotes.map(q => q.amount)
      const minAmount = Math.min(...amounts)
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
      const maxAmount = Math.max(...amounts)
      
      if (!dailyData[date]) {
        dailyData[date] = { date, total: 0, count: 0, avg: 0, min: Infinity, max: 0 }
      }
      
      dailyData[date].total += avgAmount
      dailyData[date].count += 1
      dailyData[date].min = Math.min(dailyData[date].min, minAmount)
      dailyData[date].max = Math.max(dailyData[date].max, maxAmount)
    })
    
    // Calculate averages
    return Object.values(dailyData)
      .map(d => ({
        date: d.date,
        'Trung bình': Math.round(d.total / d.count),
        'Thấp nhất': d.min,
        'Cao nhất': d.max
      }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('/')
        const [dayB, monthB] = b.date.split('/')
        return monthA === monthB 
          ? parseInt(dayA) - parseInt(dayB)
          : parseInt(monthA) - parseInt(monthB)
      })
  }, [histories])

  // 2. Provider Comparison (Average, Min, Max per provider)
  const providerComparisonData = useMemo(() => {
    if (histories.length === 0) return []

    const providerStats: Record<string, { amounts: number[]; count: number }> = {}
    
    histories.forEach(h => {
      h.quotes.forEach(q => {
        if (!providerStats[q.provider]) {
          providerStats[q.provider] = { amounts: [], count: 0 }
        }
        providerStats[q.provider].amounts.push(q.amount)
        providerStats[q.provider].count += 1
      })
    })
    
    return Object.entries(providerStats).map(([provider, stats]) => ({
      provider,
      'Trung bình': Math.round(stats.amounts.reduce((a, b) => a + b, 0) / stats.amounts.length),
      'Thấp nhất': Math.min(...stats.amounts),
      'Cao nhất': Math.max(...stats.amounts),
      'Số lượng': stats.count
    }))
  }, [histories])

  // 3. Provider Distribution (Pie chart)
  const providerDistributionData = useMemo(() => {
    if (histories.length === 0) return []

    const counts: Record<string, number> = {}
    
    histories.forEach(h => {
      h.quotes.forEach(q => {
        counts[q.provider] = (counts[q.provider] || 0) + 1
      })
    })
    
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      percentage: 0 // Will calculate below
    }))
    .sort((a, b) => b.value - a.value)
    .map((item, _, arr) => {
      const total = arr.reduce((sum, i) => sum + i.value, 0)
      return {
        ...item,
        percentage: Math.round((item.value / total) * 100)
      }
    })
  }, [histories])

  // 4. Savings Analysis (Daily savings)
  const savingsData = useMemo(() => {
    if (histories.length === 0) return []

    const dailySavings: Record<string, { date: string; savings: number; count: number }> = {}
    
    histories.forEach(h => {
      if (h.quotes.length < 2) return
      
      const date = new Date(h.createdAt).toLocaleDateString('vi-VN', { 
        month: '2-digit', 
        day: '2-digit' 
      })
      
      const amounts = h.quotes.map(q => q.amount)
      const savings = Math.max(...amounts) - Math.min(...amounts)
      
      if (!dailySavings[date]) {
        dailySavings[date] = { date, savings: 0, count: 0 }
      }
      
      dailySavings[date].savings += savings
      dailySavings[date].count += 1
    })
    
    return Object.values(dailySavings)
      .map(d => ({
        date: d.date,
        'Tiết kiệm': d.savings,
        'Số báo giá': d.count
      }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('/')
        const [dayB, monthB] = b.date.split('/')
        return monthA === monthB 
          ? parseInt(dayA) - parseInt(dayB)
          : parseInt(monthA) - parseInt(monthB)
      })
      .slice(-14) // Only show last 14 days to avoid clutter
  }, [histories])

  // 5. Delivery Time Analysis
  const deliveryTimeData = useMemo(() => {
    if (histories.length === 0) return []

    const timeRanges: Record<string, number> = {
      '1-2 ngày': 0,
      '2-3 ngày': 0,
      '3-4 ngày': 0,
      '4-5 ngày': 0,
      '5+ ngày': 0,
      'Không rõ': 0
    }
    
    histories.forEach(h => {
      h.quotes.forEach(q => {
        if (!q.deliveryTime) {
          timeRanges['Không rõ'] += 1
        } else if (q.deliveryTime.includes('1-2')) {
          timeRanges['1-2 ngày'] += 1
        } else if (q.deliveryTime.includes('2-3')) {
          timeRanges['2-3 ngày'] += 1
        } else if (q.deliveryTime.includes('3-4')) {
          timeRanges['3-4 ngày'] += 1
        } else if (q.deliveryTime.includes('4-5')) {
          timeRanges['4-5 ngày'] += 1
        } else {
          timeRanges['5+ ngày'] += 1
        }
      })
    })
    
    return Object.entries(timeRanges)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value }))
  }, [histories])

  // 6. Win Rate by Provider (How often each provider has the best quote)
  const winRateData = useMemo(() => {
    if (histories.length === 0) return []

    const wins: Record<string, number> = {}
    const total: Record<string, number> = {}
    
    histories.forEach(h => {
      if (h.quotes.length === 0) return
      
      const minAmount = Math.min(...h.quotes.map(q => q.amount))
      const winner = h.quotes.find(q => q.amount === minAmount)
      
      if (winner) {
        wins[winner.provider] = (wins[winner.provider] || 0) + 1
      }
      
      h.quotes.forEach(q => {
        total[q.provider] = (total[q.provider] || 0) + 1
      })
    })
    
    return Object.entries(wins)
      .map(([provider, winCount]) => ({
        provider,
        'Tỷ lệ thắng': Math.round((winCount / histories.length) * 100),
        'Số lần thắng': winCount,
        'Tổng báo giá': total[provider]
      }))
      .sort((a, b) => b['Tỷ lệ thắng'] - a['Tỷ lệ thắng'])
  }, [histories])

  if (histories.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center border border-white/20">
        <p className="text-white/60">Không có dữ liệu để phân tích. Vui lòng tạo báo giá trước.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportChartsAsImage}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all flex items-center gap-2"
        >
          <span>📸</span>
          <span>Xuất biểu đồ</span>
        </button>
      </div>

      {/* Analytics Container */}
      <div ref={analyticsRef} className="space-y-6">
        {/* Cost Trends Over Time */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-white text-lg font-semibold mb-4">📈 Xu Hướng Chi Phí Theo Thời Gian</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={costTrendsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#fff" style={{ fontSize: '12px' }} />
            <YAxis stroke="#fff" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => `${value.toLocaleString('vi-VN')}₫`}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Line type="monotone" dataKey="Trung bình" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Thấp nhất" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Cao nhất" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-white/60 text-sm mt-2">
          Biểu đồ hiển thị xu hướng phí ship theo ngày (trung bình, thấp nhất, cao nhất)
        </p>
      </div>

      {/* Provider Comparison */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-white text-lg font-semibold mb-4">📊 So Sánh Nhà Cung Cấp</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={providerComparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="provider" stroke="#fff" style={{ fontSize: '12px' }} />
            <YAxis stroke="#fff" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => `${value.toLocaleString('vi-VN')}₫`}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="Trung bình" fill="#8b5cf6" />
            <Bar dataKey="Thấp nhất" fill="#10b981" />
            <Bar dataKey="Cao nhất" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-white/60 text-sm mt-2">
          So sánh phí ship trung bình, thấp nhất và cao nhất giữa các nhà cung cấp
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Distribution */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-white text-lg font-semibold mb-4">🥧 Phân Bố Nhà Cung Cấp</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={providerDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {providerDistributionData.map((entry) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={PROVIDER_COLORS[entry.name as keyof typeof PROVIDER_COLORS] || PROVIDER_COLORS.Other} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => `${value} báo giá`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {providerDistributionData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: PROVIDER_COLORS[item.name as keyof typeof PROVIDER_COLORS] || PROVIDER_COLORS.Other }}
                  />
                  <span className="text-white/80">{item.name}</span>
                </div>
                <span className="text-white/60">{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Win Rate by Provider */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-white text-lg font-semibold mb-4">🏆 Tỷ Lệ Thắng Theo NCC</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={winRateData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#fff" style={{ fontSize: '12px' }} unit="%" />
              <YAxis dataKey="provider" type="category" stroke="#fff" style={{ fontSize: '12px' }} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number, name: string) => {
                  if (name === 'Tỷ lệ thắng') return `${value}%`
                  return value
                }}
              />
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Bar dataKey="Tỷ lệ thắng" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-white/60 text-sm mt-2">
            Tỷ lệ phần trăm mỗi nhà cung cấp có giá tốt nhất
          </p>
        </div>
      </div>

      {/* Savings Analysis */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-white text-lg font-semibold mb-4">💰 Phân Tích Tiết Kiệm Theo Ngày</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={savingsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#fff" style={{ fontSize: '12px' }} />
            <YAxis stroke="#fff" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number, name: string) => {
                if (name === 'Tiết kiệm') return `${value.toLocaleString('vi-VN')}₫`
                return value
              }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="Tiết kiệm" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-white/60 text-sm mt-2">
          Tổng tiền tiết kiệm được mỗi ngày bằng cách chọn nhà cung cấp rẻ nhất
        </p>
      </div>

      {/* Delivery Time Distribution */}
      {deliveryTimeData.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-white text-lg font-semibold mb-4">⏱️ Phân Bố Thời Gian Giao Hàng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deliveryTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#fff" style={{ fontSize: '12px' }} />
              <YAxis stroke="#fff" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => `${value} báo giá`}
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-white/60 text-sm mt-2">
            Phân bố số lượng báo giá theo thời gian giao hàng dự kiến
          </p>
        </div>
      )}
      </div>
    </div>
  )
}
