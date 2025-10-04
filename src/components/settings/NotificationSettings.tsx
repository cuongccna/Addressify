'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface NotificationSettings {
  quoteGenerated: boolean
  dailySummary: boolean
  weeklySummary: boolean
  priceAlerts: boolean
  failedQuotes: boolean
}

export default function NotificationSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings>({
    quoteGenerated: false,
    dailySummary: false,
    weeklySummary: true,
    priceAlerts: true,
    failedQuotes: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadSettings = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/notifications/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Đã lưu cài đặt thông báo!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: `❌ ${errorData.message || 'Không thể lưu cài đặt'}` })
      }
    } catch {
      setMessage({ type: 'error', text: '❌ Đã xảy ra lỗi khi lưu cài đặt' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (!user) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <p className="text-white/60">Vui lòng đăng nhập để cài đặt thông báo.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <p className="text-white/60">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">⚙️ Cài đặt thông báo Email</h2>

      <div className="space-y-4">
        {/* Quote Generated */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="text-white font-medium">📦 Báo giá mới</h3>
            <p className="text-white/60 text-sm">Nhận email mỗi khi tạo báo giá</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.quoteGenerated}
              onChange={() => handleToggle('quoteGenerated')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Daily Summary */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="text-white font-medium">📊 Báo cáo hàng ngày</h3>
            <p className="text-white/60 text-sm">Nhận tổng kết hoạt động mỗi ngày</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.dailySummary}
              onChange={() => handleToggle('dailySummary')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Weekly Summary */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="text-white font-medium">📈 Báo cáo hàng tuần</h3>
            <p className="text-white/60 text-sm">Nhận tổng kết hoạt động mỗi tuần (Khuyến nghị)</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.weeklySummary}
              onChange={() => handleToggle('weeklySummary')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Price Alerts */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="text-white font-medium">💰 Cảnh báo giá</h3>
            <p className="text-white/60 text-sm">Thông báo khi giá ship thay đổi đáng kể</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.priceAlerts}
              onChange={() => handleToggle('priceAlerts')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Failed Quotes */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="text-white font-medium">⚠️ Báo giá thất bại</h3>
            <p className="text-white/60 text-sm">Thông báo khi không lấy được giá từ nhà vận chuyển</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.failedQuotes}
              onChange={() => handleToggle('failedQuotes')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
        </button>

        {message && (
          <div
            className={`px-4 py-2 rounded-lg ${
              message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-300 text-sm">
          💡 <strong>Lưu ý:</strong> Email sẽ được gửi đến địa chỉ <strong>{user.email}</strong>. 
          Để thay đổi email, vui lòng cập nhật trong phần tài khoản.
        </p>
      </div>
    </div>
  )
}
