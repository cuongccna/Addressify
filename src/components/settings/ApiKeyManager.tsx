'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ALL_PERMISSIONS, PERMISSION_DESCRIPTIONS } from '@/lib/api-keys/generate'

interface ApiKey {
  id: string
  name: string
  key: string
  keyPrefix: string
  permissions: string[]
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  rateLimit: number
  createdAt: string
}

export default function ApiKeyManager() {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKeyVisible, setNewKeyVisible] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'live' as 'live' | 'test',
    permissions: ['quotes:read', 'quotes:create', 'shops:read'],
    rateLimit: 100,
    expiresInDays: 0, // 0 = never expires
  })

  useEffect(() => {
    loadApiKeys()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadApiKeys = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error('Failed to load API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    setCreating(true)

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setNewKeyVisible(data.key) // Show the key once
        await loadApiKeys()
        setShowCreateForm(false)
        
        // Reset form
        setFormData({
          name: '',
          type: 'live',
          permissions: ['quotes:read', 'quotes:create', 'shops:read'],
          rateLimit: 100,
          expiresInDays: 0,
        })
      } else {
        const errorData = await response.json()
        alert(`Lỗi: ${errorData.message || 'Không thể tạo API key'}`)
      }
    } catch {
      alert('Đã xảy ra lỗi khi tạo API key')
    } finally {
      setCreating(false)
    }
  }

  const revokeApiKey = async (id: string) => {
    if (!confirm('Bạn có chắc muốn vô hiệu hóa API key này?')) return

    try {
      const response = await fetch(`/api/api-keys/${id}/revoke`, {
        method: 'POST',
      })

      if (response.ok) {
        await loadApiKeys()
      } else {
        alert('Không thể vô hiệu hóa API key')
      }
    } catch {
      alert('Đã xảy ra lỗi')
    }
  }

  const deleteApiKey = async (id: string) => {
    if (!confirm('Bạn có chắc muốn XÓA API key này? Hành động này không thể hoàn tác!')) return

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadApiKeys()
      } else {
        alert('Không thể xóa API key')
      }
    } catch {
      alert('Đã xảy ra lỗi')
    }
  }

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✅ Đã copy vào clipboard!')
  }

  if (!user) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <p className="text-white/60">Vui lòng đăng nhập để quản lý API keys.</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">🔑 API Keys</h2>
          <p className="text-white/60 mt-1">Quản lý API keys để tích hợp với hệ thống của bạn</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
        >
          ➕ Tạo API Key
        </button>
      </div>

      {/* New Key Display */}
      {newKeyVisible && (
        <div className="bg-green-500/10 border-2 border-green-500/20 rounded-lg p-6">
          <h3 className="text-green-300 font-bold mb-2">✅ API Key đã được tạo thành công!</h3>
          <p className="text-white/60 text-sm mb-4">
            ⚠️ <strong>LƯU Ý:</strong> Đây là lần duy nhất bạn thấy key đầy đủ. Hãy copy và lưu trữ an toàn!
          </p>
          <div className="flex items-center gap-2 bg-black/20 p-4 rounded">
            <code className="flex-1 text-green-300 font-mono text-sm break-all">{newKeyVisible}</code>
            <button
              onClick={() => copyToClipboard(newKeyVisible)}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-all"
            >
              📋 Copy
            </button>
          </div>
          <button
            onClick={() => setNewKeyVisible(null)}
            className="mt-4 text-white/60 hover:text-white text-sm"
          >
            Đã lưu, đóng thông báo này
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Tạo API Key mới</h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-white font-medium mb-2">Tên API Key:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Shopify Integration"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-white font-medium mb-2">Loại:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.type === 'live'}
                    onChange={() => setFormData({ ...formData, type: 'live' })}
                    className="w-4 h-4"
                  />
                  <span className="text-white">🟢 Live (Production)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.type === 'test'}
                    onChange={() => setFormData({ ...formData, type: 'test' })}
                    className="w-4 h-4"
                  />
                  <span className="text-white">🔵 Test (Development)</span>
                </label>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-white font-medium mb-2">Quyền hạn:</label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {ALL_PERMISSIONS.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-start gap-2 p-3 bg-white/5 rounded cursor-pointer hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{permission}</div>
                      <div className="text-white/60 text-xs">{PERMISSION_DESCRIPTIONS[permission]}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Rate Limit */}
            <div>
              <label className="block text-white font-medium mb-2">Rate Limit (requests/phút):</label>
              <input
                type="number"
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) || 100 })}
                min="1"
                max="1000"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-white font-medium mb-2">Hết hạn sau (ngày):</label>
              <input
                type="number"
                value={formData.expiresInDays}
                onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) || 0 })}
                min="0"
                placeholder="0 = không bao giờ hết hạn"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              <p className="text-white/60 text-sm mt-1">0 = Không bao giờ hết hạn</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={createApiKey}
                disabled={creating || !formData.name || formData.permissions.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? '⏳ Đang tạo...' : '✨ Tạo API Key'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="space-y-3">
        {apiKeys.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center">
            <p className="text-white/60">Chưa có API key nào. Hãy tạo API key đầu tiên!</p>
          </div>
        ) : (
          apiKeys.map((key) => (
            <div
              key={key.id}
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 border ${
                key.isActive ? 'border-white/20' : 'border-red-500/20 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-bold">{key.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      key.keyPrefix === 'addr_live' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {key.keyPrefix === 'addr_live' ? '🟢 Live' : '🔵 Test'}
                    </span>
                    {!key.isActive && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                        ⛔ Đã vô hiệu hóa
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="text-white/60">
                      Key: <code className="bg-black/20 px-2 py-1 rounded text-white/80">{key.key.substring(0, 20)}...****</code>
                    </div>
                    <div className="text-white/60">
                      Quyền: {key.permissions.length} permissions
                    </div>
                    <div className="text-white/60">
                      Rate Limit: {key.rateLimit} requests/phút
                    </div>
                    <div className="text-white/60">
                      Sử dụng lần cuối: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString('vi-VN') : 'Chưa dùng'}
                    </div>
                    {key.expiresAt && (
                      <div className="text-white/60">
                        Hết hạn: {new Date(key.expiresAt).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {key.isActive && (
                    <button
                      onClick={() => revokeApiKey(key.id)}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-all"
                    >
                      ⏸️ Vô hiệu
                    </button>
                  )}
                  <button
                    onClick={() => deleteApiKey(key.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          💡 <strong>Lưu ý:</strong> API keys cho phép truy cập tài khoản của bạn từ ứng dụng bên ngoài. 
          Hãy giữ chúng an toàn và không chia sẻ với người khác!
        </p>
      </div>
    </div>
  )
}
