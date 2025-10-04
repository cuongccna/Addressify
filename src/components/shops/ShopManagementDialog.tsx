'use client'

import { useState, useEffect } from 'react'
import { useShop } from '@/contexts/ShopContext'

interface ShopManagementDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface ShopFormData {
  name: string
  senderAddress: string
  senderDistrict: string
  senderProvince: string
  ghnProvinceId: string
  ghnDistrictId: string
  ghnWardCode: string
  ghnShopId: string
}

export function ShopManagementDialog({ isOpen, onClose }: ShopManagementDialogProps) {
  const { shops, createShop, updateShop, deleteShop } = useShop()
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingShopId, setEditingShopId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    senderAddress: '',
    senderDistrict: '',
    senderProvince: '',
    ghnProvinceId: '',
    ghnDistrictId: '',
    ghnWardCode: '',
    ghnShopId: '',
  })

  useEffect(() => {
    if (!isOpen) {
      setMode('list')
      setEditingShopId(null)
      setError('')
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setFormData({
      name: '',
      senderAddress: '',
      senderDistrict: '',
      senderProvince: '',
      ghnProvinceId: '',
      ghnDistrictId: '',
      ghnWardCode: '',
      ghnShopId: '',
    })
  }

  const handleEdit = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId)
    if (!shop) return

    setFormData({
      name: shop.name,
      senderAddress: shop.senderAddress,
      senderDistrict: shop.senderDistrict,
      senderProvince: shop.senderProvince,
      ghnProvinceId: shop.ghnProvinceId || '',
      ghnDistrictId: shop.ghnDistrictId || '',
      ghnWardCode: shop.ghnWardCode || '',
      ghnShopId: shop.ghnShopId || '',
    })
    setEditingShopId(shopId)
    setMode('edit')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'create') {
        const { error } = await createShop(formData)
        if (error) throw error
      } else if (mode === 'edit' && editingShopId) {
        const { error } = await updateShop(editingShopId, formData)
        if (error) throw error
      }
      
      setMode('list')
      resetForm()
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Đã có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (shopId: string) => {
    if (!confirm('Bạn có chắc muốn xóa shop này?')) return

    setLoading(true)
    try {
      const { error } = await deleteShop(shopId)
      if (error) throw error
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Không thể xóa shop')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'list' ? 'Quản lý Shops' : mode === 'create' ? 'Tạo Shop mới' : 'Chỉnh sửa Shop'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {mode === 'list' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tạo Shop mới
              </button>

              {shops.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p>Chưa có shop nào</p>
                  <p className="text-sm mt-2">Tạo shop đầu tiên để bắt đầu!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shops.map((shop) => (
                    <div
                      key={shop.id}
                      className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{shop.name}</h3>
                          <p className="text-sm text-slate-400">
                            {shop.senderAddress}, {shop.senderDistrict}, {shop.senderProvince}
                          </p>
                          {shop.ghnShopId && (
                            <p className="text-xs text-slate-500 mt-1">GHN Shop ID: {shop.ghnShopId}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(shop.id)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(shop.id)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tên Shop <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Shop của tôi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Địa chỉ gửi hàng <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.senderAddress}
                  onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Đường ABC"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Quận/Huyện <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.senderDistrict}
                    onChange={(e) => setFormData({ ...formData, senderDistrict: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Quận 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tỉnh/Thành phố <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.senderProvince}
                    onChange={(e) => setFormData({ ...formData, senderProvince: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="TP. Hồ Chí Minh"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Cấu hình GHN (Tùy chọn)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">GHN Shop ID</label>
                    <input
                      type="text"
                      value={formData.ghnShopId}
                      onChange={(e) => setFormData({ ...formData, ghnShopId: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4978139"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">GHN Province ID</label>
                    <input
                      type="text"
                      value={formData.ghnProvinceId}
                      onChange={(e) => setFormData({ ...formData, ghnProvinceId: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="202"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">GHN District ID</label>
                    <input
                      type="text"
                      value={formData.ghnDistrictId}
                      onChange={(e) => setFormData({ ...formData, ghnDistrictId: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1442"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">GHN Ward Code</label>
                    <input
                      type="text"
                      value={formData.ghnWardCode}
                      onChange={(e) => setFormData({ ...formData, ghnWardCode: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="21211"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('list')
                    resetForm()
                  }}
                  className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? 'Đang lưu...' : mode === 'create' ? 'Tạo Shop' : 'Cập nhật'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
