'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function TestEmailPage() {
  const { user } = useAuth()
  const [template, setTemplate] = useState<'welcome' | 'quote' | 'weekly'>('welcome')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; messageId?: string } | null>(null)

  const handleSendEmail = async () => {
    if (!user) {
      setResult({ success: false, message: '❌ Vui lòng đăng nhập trước' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const params = new URLSearchParams({
        template,
        ...(email && { to: email }),
      })

      const response = await fetch(`/api/test-email?${params}`)
      const data = await response.json()

      setResult(data)
    } catch {
      setResult({
        success: false,
        message: '❌ Đã xảy ra lỗi khi gửi email',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">🔐 Yêu cầu đăng nhập</h1>
          <p className="text-white/60 mb-6">Vui lòng đăng nhập để test gửi email</p>
          <a
            href="/auth/sign-in"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📧 Test Email Service</h1>
          <p className="text-white/60">Kiểm tra gửi email với Resend</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 space-y-6">
          {/* User Info */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              📧 Email của bạn: <strong>{user.email}</strong>
            </p>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-white font-medium mb-2">📋 Chọn Email Template:</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTemplate('welcome')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  template === 'welcome'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-3xl mb-2">🎉</div>
                <div className="text-white font-medium">Welcome</div>
                <div className="text-white/60 text-sm">Chào mừng</div>
              </button>

              <button
                onClick={() => setTemplate('quote')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  template === 'quote'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-3xl mb-2">📦</div>
                <div className="text-white font-medium">Quote</div>
                <div className="text-white/60 text-sm">Báo giá</div>
              </button>

              <button
                onClick={() => setTemplate('weekly')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  template === 'weekly'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-3xl mb-2">📊</div>
                <div className="text-white font-medium">Weekly</div>
                <div className="text-white/60 text-sm">Báo cáo tuần</div>
              </button>
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-white font-medium mb-2">
              📧 Email người nhận (để trống = email của bạn):
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={user.email || 'email@example.com'}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendEmail}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <span>📨</span>
                <span>Gửi Email Test</span>
              </>
            )}
          </button>

          {/* Result */}
          {result && (
            <div
              className={`p-4 rounded-lg border-2 ${
                result.success
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              <p className={result.success ? 'text-green-300' : 'text-red-300'}>
                {result.message}
              </p>
              {result.messageId && (
                <p className="text-white/60 text-sm mt-2">
                  Message ID: <code className="bg-black/20 px-2 py-1 rounded">{result.messageId}</code>
                </p>
              )}
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-300 text-sm">
              💡 <strong>Lưu ý:</strong> Email sẽ được gửi từ <code>onboarding@resend.dev</code> (domain mặc định của Resend). 
              Kiểm tra cả thư mục Spam nếu không thấy email trong Inbox.
            </p>
          </div>

          {/* Template Descriptions */}
          <div className="space-y-3">
            <h3 className="text-white font-medium">📝 Mô tả các template:</h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-white/5 rounded">
                <span className="text-purple-300 font-medium">🎉 Welcome:</span>
                <span className="text-white/60"> Email chào mừng người dùng mới với danh sách tính năng</span>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <span className="text-purple-300 font-medium">📦 Quote:</span>
                <span className="text-white/60"> Thông báo báo giá mới với so sánh giá từ 3 nhà vận chuyển</span>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <span className="text-purple-300 font-medium">📊 Weekly:</span>
                <span className="text-white/60"> Báo cáo hoạt động hàng tuần với thống kê chi tiết</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <a
            href="/settings"
            className="text-purple-300 hover:text-purple-200 transition-colors"
          >
            ← Quay lại Settings
          </a>
        </div>
      </div>
    </div>
  )
}
