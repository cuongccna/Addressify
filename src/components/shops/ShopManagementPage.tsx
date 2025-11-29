'use client'

import { useState } from 'react'
import { useShop } from '@/contexts/ShopContext'
import { Card } from '@/components/ui/Card'

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

export function ShopManagementPage() {
  const { shops, createShop, updateShop, deleteShop, loading } = useShop()
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingShopId, setEditingShopId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
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
    setFormLoading(true)

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
      setFormLoading(false)
    }
  }

  const handleDelete = async (shopId: string) => {
    if (!confirm('Bạn có chắc muốn xóa shop này?')) return

    setFormLoading(true)
    try {
      const { error } = await deleteShop(shopId)
      if (error) throw error
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Không thể xóa shop')
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quản lý Shops</h1>
          <p className="text-slate-400 mt-2">Quản lý các shop và địa chỉ gửi hàng của bạn</p>
        </div>
        
        {mode === 'list' && (
          <button
            onClick={() => setMode('create')}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo Shop mới
          </button>
        )}
        
        {(mode === 'create' || mode === 'edit') && (
          <button
            onClick={() => {
              setMode('list')
              resetForm()
            }}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Shop List */}
      {mode === 'list' && (
        <div className="space-y-4">
          {shops.length === 0 ? (
            <Card padding="lg" className="text-center py-12">
              <div className="text-slate-400 space-y-4">
                <svg className="w-16 h-16 mx-auto text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-lg font-medium">Chưa có shop nào</p>
                <p className="text-sm">Tạo shop đầu tiên để bắt đầu quản lý địa chỉ gửi hàng</p>
                <button
                  onClick={() => setMode('create')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors mt-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tạo Shop đầu tiên
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shops.map((shop) => (
                <Card key={shop.id} padding="lg" className="hover:border-sky-500/50 transition-colors">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{shop.name}</h3>
                      <div className="text-sm text-slate-400 space-y-1">
                        <p>{shop.senderAddress}</p>
                        <p>{shop.senderDistrict}, {shop.senderProvince}</p>
                      </div>
                    </div>
                    
                    {shop.ghnShopId && (
                      <div className="pt-3 border-t border-slate-800">
                        <p className="text-xs text-slate-500">GHN Shop ID: {shop.ghnShopId}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleEdit(shop.id)}
                        className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDelete(shop.id)}
                        className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Form */}
      {(mode === 'create' || mode === 'edit') && (
        <Card padding="lg">
          <h2 className="text-2xl font-bold text-white mb-6">
            {mode === 'create' ? 'Tạo Shop mới' : 'Chỉnh sửa Shop'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên Shop */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tên Shop <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Shop của tôi"
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Địa chỉ gửi hàng <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.senderAddress}
                onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="123 Đường ABC"
              />
            </div>

            {/* Quận/Huyện và Tỉnh/Thành phố */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quận/Huyện <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.senderDistrict}
                  onChange={(e) => setFormData({ ...formData, senderDistrict: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="TP. Hồ Chí Minh"
                />
              </div>
            </div>

            {/* GHN Configuration */}
            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4">Cấu hình GHN (Tùy chọn)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">GHN Shop ID</label>
                  <input
                    type="text"
                    value={formData.ghnShopId}
                    onChange={(e) => setFormData({ ...formData, ghnShopId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="4978139"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">GHN Province ID</label>
                  <input
                    type="text"
                    value={formData.ghnProvinceId}
                    onChange={(e) => setFormData({ ...formData, ghnProvinceId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="202"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">GHN District ID</label>
                  <input
                    type="text"
                    value={formData.ghnDistrictId}
                    onChange={(e) => setFormData({ ...formData, ghnDistrictId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="1454"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">GHN Ward Code</label>
                  <input
                    type="text"
                    value={formData.ghnWardCode}
                    onChange={(e) => setFormData({ ...formData, ghnWardCode: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="21001"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setMode('list')
                  resetForm()
                }}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {formLoading ? 'Đang lưu...' : mode === 'create' ? 'Tạo Shop' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
