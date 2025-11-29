'use client'

import { useState } from 'react'
import { useShop } from '@/contexts/ShopContext'
import { Card } from '@/components/ui/Card'

interface ShopFormData {
  name: string
  // Địa chỉ gửi hàng (linh hoạt cho cả địa chỉ cũ và mới)
  senderAddress: string
  senderWard: string      // Phường/Xã (có thể để trống với địa chỉ mới)
  senderDistrict: string  // Quận/Huyện
  senderProvince: string  // Tỉnh/Thành phố
  // GHN config
  ghnProvinceId: string
  ghnDistrictId: string
  ghnWardCode: string
  ghnShopId: string
  // GHTK config
  ghtkPickAddress: string
  ghtkPickProvince: string
  ghtkPickDistrict: string
  ghtkPickWard: string
  ghtkPartnerId: string
  // VTP config
  vtpProvinceId: string
  vtpDistrictId: string
  vtpWardId: string
  vtpCustomerId: string
  vtpGroupId: string
}

// Help tooltip component
function HelpTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  
  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        className="w-4 h-4 rounded-full bg-slate-600 text-white text-xs font-bold hover:bg-sky-500 transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        ?
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-xl text-xs text-slate-200 whitespace-normal">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
        </div>
      )}
    </span>
  )
}

// Provider tab component
function ProviderTabs({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: 'ghn' | 'ghtk' | 'vtp'
  onTabChange: (tab: 'ghn' | 'ghtk' | 'vtp') => void 
}) {
  const tabs = [
    { id: 'ghn' as const, name: 'GHN', fullName: 'Giao Hàng Nhanh', color: 'orange' },
    { id: 'ghtk' as const, name: 'GHTK', fullName: 'Giao Hàng Tiết Kiệm', color: 'green' },
    { id: 'vtp' as const, name: 'Viettel Post', fullName: 'Viettel Post', color: 'red' },
  ]

  return (
    <div className="flex border-b border-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'text-sky-400 border-b-2 border-sky-400 bg-slate-800/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <span className="block font-semibold">{tab.name}</span>
          <span className="block text-xs opacity-70">{tab.fullName}</span>
        </button>
      ))}
    </div>
  )
}

export function ShopManagementPage() {
  const { shops, createShop, updateShop, deleteShop, loading } = useShop()
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingShopId, setEditingShopId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeProviderTab, setActiveProviderTab] = useState<'ghn' | 'ghtk' | 'vtp'>('ghn')
  const [useNewAddressFormat, setUseNewAddressFormat] = useState(false)
  
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    senderAddress: '',
    senderWard: '',
    senderDistrict: '',
    senderProvince: '',
    // GHN
    ghnProvinceId: '',
    ghnDistrictId: '',
    ghnWardCode: '',
    ghnShopId: '',
    // GHTK
    ghtkPickAddress: '',
    ghtkPickProvince: '',
    ghtkPickDistrict: '',
    ghtkPickWard: '',
    ghtkPartnerId: '',
    // VTP
    vtpProvinceId: '',
    vtpDistrictId: '',
    vtpWardId: '',
    vtpCustomerId: '',
    vtpGroupId: '',
  })

  const resetForm = () => {
    setFormData({
      name: '',
      senderAddress: '',
      senderWard: '',
      senderDistrict: '',
      senderProvince: '',
      ghnProvinceId: '',
      ghnDistrictId: '',
      ghnWardCode: '',
      ghnShopId: '',
      ghtkPickAddress: '',
      ghtkPickProvince: '',
      ghtkPickDistrict: '',
      ghtkPickWard: '',
      ghtkPartnerId: '',
      vtpProvinceId: '',
      vtpDistrictId: '',
      vtpWardId: '',
      vtpCustomerId: '',
      vtpGroupId: '',
    })
    setUseNewAddressFormat(false)
  }

  const handleEdit = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId)
    if (!shop) return

    setFormData({
      name: shop.name,
      senderAddress: shop.senderAddress,
      senderWard: shop.senderWard || '',
      senderDistrict: shop.senderDistrict,
      senderProvince: shop.senderProvince,
      ghnProvinceId: shop.ghnProvinceId || '',
      ghnDistrictId: shop.ghnDistrictId || '',
      ghnWardCode: shop.ghnWardCode || '',
      ghnShopId: shop.ghnShopId || '',
      ghtkPickAddress: shop.ghtkPickAddress || '',
      ghtkPickProvince: shop.ghtkPickProvince || '',
      ghtkPickDistrict: shop.ghtkPickDistrict || '',
      ghtkPickWard: shop.ghtkPickWard || '',
      ghtkPartnerId: shop.ghtkPartnerId || '',
      vtpProvinceId: shop.vtpProvinceId || '',
      vtpDistrictId: shop.vtpDistrictId || '',
      vtpWardId: shop.vtpWardId || '',
      vtpCustomerId: shop.vtpCustomerId || '',
      vtpGroupId: shop.vtpGroupId || '',
    })
    setUseNewAddressFormat(!shop.senderWard)
    setEditingShopId(shopId)
    setMode('edit')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFormLoading(true)

    try {
      const submitData = {
        ...formData,
        senderWard: useNewAddressFormat ? null : formData.senderWard,
      }
      
      if (mode === 'create') {
        const { error } = await createShop(submitData)
        if (error) throw error
      } else if (mode === 'edit' && editingShopId) {
        const { error } = await updateShop(editingShopId, submitData)
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

  // Helper to count configured providers for a shop
  const getConfiguredProviders = (shop: typeof shops[0]) => {
    const providers: string[] = []
    if (shop.ghnShopId) providers.push('GHN')
    if (shop.ghtkPartnerId || shop.ghtkPickProvince) providers.push('GHTK')
    if (shop.vtpCustomerId || shop.vtpProvinceId) providers.push('VTP')
    return providers
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
              {shops.map((shop) => {
                const providers = getConfiguredProviders(shop)
                return (
                  <Card key={shop.id} padding="lg" className="hover:border-sky-500/50 transition-colors">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{shop.name}</h3>
                        <div className="text-sm text-slate-400 space-y-1">
                          <p>{shop.senderAddress}</p>
                          <p>
                            {shop.senderWard && `${shop.senderWard}, `}
                            {shop.senderDistrict}, {shop.senderProvince}
                          </p>
                        </div>
                      </div>
                      
                      {/* Provider badges */}
                      <div className="flex flex-wrap gap-2">
                        {providers.length > 0 ? (
                          providers.map(p => (
                            <span key={p} className={`px-2 py-1 text-xs rounded-full ${
                              p === 'GHN' ? 'bg-orange-500/20 text-orange-400' :
                              p === 'GHTK' ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-400">
                            Chưa cấu hình nhà vận chuyển
                          </span>
                        )}
                      </div>
                      
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
                )
              })}
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

            {/* Address Format Toggle */}
            <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-white">Định dạng địa chỉ</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Chọn định dạng phù hợp với địa chỉ của bạn
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setUseNewAddressFormat(false)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      !useNewAddressFormat 
                        ? 'bg-sky-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Địa chỉ cũ (4 cấp)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseNewAddressFormat(true)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      useNewAddressFormat 
                        ? 'bg-sky-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Địa chỉ mới (2-3 cấp)
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {useNewAddressFormat 
                  ? '📍 Địa chỉ mới: Số nhà + Tên đường → Phường/Xã → Tỉnh/Thành phố' 
                  : '📍 Địa chỉ cũ: Số nhà + Tên đường → Phường/Xã → Quận/Huyện → Tỉnh/Thành phố'}
              </p>
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Số nhà, tên đường <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.senderAddress}
                onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="123 Nguyễn Văn Linh"
              />
            </div>

            {/* Address Fields - Dynamic based on format */}
            <div className={`grid gap-4 ${useNewAddressFormat ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
              {!useNewAddressFormat && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phường/Xã <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.senderWard}
                    onChange={(e) => setFormData({ ...formData, senderWard: e.target.value })}
                    required={!useNewAddressFormat}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Phường Tân Thuận Đông"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {useNewAddressFormat ? 'Phường/Xã' : 'Quận/Huyện'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.senderDistrict}
                  onChange={(e) => setFormData({ ...formData, senderDistrict: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder={useNewAddressFormat ? "Xã Bình Lợi" : "Quận 7"}
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

            {/* Provider Configuration */}
            <div className="pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-white">Cấu hình nhà vận chuyển</h3>
                <HelpTooltip text="Cấu hình thông tin tài khoản cho từng nhà vận chuyển. Bạn có thể cấu hình một hoặc nhiều nhà vận chuyển tùy ý." />
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Thiết lập thông tin tài khoản để tự động lấy báo giá từ các nhà vận chuyển
              </p>
              
              <ProviderTabs activeTab={activeProviderTab} onTabChange={setActiveProviderTab} />
              
              <div className="p-4 bg-slate-800/30 rounded-b-lg border border-t-0 border-slate-700">
                {/* GHN Configuration */}
                {activeProviderTab === 'ghn' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <h4 className="text-sm font-medium text-orange-400 mb-2">📦 Giao Hàng Nhanh (GHN)</h4>
                      <p className="text-xs text-slate-400">
                        Đăng nhập vào <a href="https://khachhang.ghn.vn" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">khachhang.ghn.vn</a> → 
                        Vào mục &quot;Quản lý Shop&quot; để lấy Shop ID. Các ID khác có thể lấy từ API GHN.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Mã Shop (Shop ID)
                          <HelpTooltip text="Mã Shop trong hệ thống GHN. Vào trang quản lý shop tại khachhang.ghn.vn để lấy mã này. Ví dụ: 4978139" />
                        </label>
                        <input
                          type="text"
                          value={formData.ghnShopId}
                          onChange={(e) => setFormData({ ...formData, ghnShopId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="4978139"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Mã Tỉnh/Thành (Province ID)
                          <HelpTooltip text="Mã tỉnh/thành phố theo GHN. TP.HCM = 202, Hà Nội = 201. Xem danh sách đầy đủ tại API GHN." />
                        </label>
                        <input
                          type="text"
                          value={formData.ghnProvinceId}
                          onChange={(e) => setFormData({ ...formData, ghnProvinceId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="202 (TP.HCM)"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Mã Quận/Huyện (District ID)
                          <HelpTooltip text="Mã quận/huyện theo GHN. Ví dụ: Quận 1 HCM = 1454. Lấy từ API GetDistrict của GHN." />
                        </label>
                        <input
                          type="text"
                          value={formData.ghnDistrictId}
                          onChange={(e) => setFormData({ ...formData, ghnDistrictId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="1454"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Mã Phường/Xã (Ward Code)
                          <HelpTooltip text="Mã phường/xã theo GHN. Ví dụ: 21001. Lấy từ API GetWard của GHN." />
                        </label>
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
                )}

                {/* GHTK Configuration */}
                {activeProviderTab === 'ghtk' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="text-sm font-medium text-green-400 mb-2">🚚 Giao Hàng Tiết Kiệm (GHTK)</h4>
                      <p className="text-xs text-slate-400">
                        Đăng nhập vào <a href="https://khachhang.giaohangtietkiem.vn" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">khachhang.giaohangtietkiem.vn</a> → 
                        Vào &quot;Tài khoản&quot; → &quot;API Token&quot; để lấy thông tin. GHTK sử dụng tên địa chỉ thay vì mã số.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Mã đối tác (Partner ID)
                          <HelpTooltip text="Mã đối tác/Shop ID của GHTK. Có thể lấy từ trang quản lý tài khoản GHTK hoặc liên hệ CSKH." />
                        </label>
                        <input
                          type="text"
                          value={formData.ghtkPartnerId}
                          onChange={(e) => setFormData({ ...formData, ghtkPartnerId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="S23008189"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Địa chỉ lấy hàng
                          <HelpTooltip text="Địa chỉ chi tiết nơi lấy hàng (số nhà, tên đường). GHTK dùng text thay vì mã." />
                        </label>
                        <input
                          type="text"
                          value={formData.ghtkPickAddress}
                          onChange={(e) => setFormData({ ...formData, ghtkPickAddress: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="123 Nguyễn Văn Linh"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Tỉnh/Thành lấy hàng
                          <HelpTooltip text="Tên tỉnh/thành phố đúng theo chuẩn GHTK. Ví dụ: 'TP. Hồ Chí Minh', 'Hà Nội'" />
                        </label>
                        <input
                          type="text"
                          value={formData.ghtkPickProvince}
                          onChange={(e) => setFormData({ ...formData, ghtkPickProvince: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="TP. Hồ Chí Minh"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Quận/Huyện lấy hàng
                          <HelpTooltip text="Tên quận/huyện đúng theo chuẩn GHTK. Ví dụ: 'Quận 1', 'Quận Gò Vấp'" />
                        </label>
                        <input
                          type="text"
                          value={formData.ghtkPickDistrict}
                          onChange={(e) => setFormData({ ...formData, ghtkPickDistrict: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Quận 7"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Phường/Xã lấy hàng
                          <HelpTooltip text="Tên phường/xã đúng theo chuẩn GHTK. Ví dụ: 'Phường Tân Thuận Đông'" />
                        </label>
                        <input
                          type="text"
                          value={formData.ghtkPickWard}
                          onChange={(e) => setFormData({ ...formData, ghtkPickWard: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Phường Tân Thuận Đông"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* VTP Configuration */}
                {activeProviderTab === 'vtp' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <h4 className="text-sm font-medium text-red-400 mb-2">📮 Viettel Post</h4>
                      <p className="text-xs text-slate-400">
                        Đăng nhập vào <a href="https://viettelpost.vn" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">viettelpost.vn</a> → 
                        Vào &quot;Quản lý tài khoản&quot; để lấy Mã khách hàng. Các mã địa chỉ lấy từ API Viettel Post.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Mã khách hàng (Customer ID)
                          <HelpTooltip text="Mã khách hàng trong hệ thống Viettel Post. Lấy từ trang quản lý tài khoản sau khi đăng nhập." />
                        </label>
                        <input
                          type="text"
                          value={formData.vtpCustomerId}
                          onChange={(e) => setFormData({ ...formData, vtpCustomerId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="VTP123456"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Mã nhóm địa chỉ (Group ID)
                          <HelpTooltip text="Mã nhóm địa chỉ gửi hàng (nếu có). Dùng để quản lý nhiều điểm gửi hàng." />
                        </label>
                        <input
                          type="text"
                          value={formData.vtpGroupId}
                          onChange={(e) => setFormData({ ...formData, vtpGroupId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="G001"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Mã Tỉnh/Thành (Province ID)
                          <HelpTooltip text="Mã tỉnh/thành theo Viettel Post. Lấy từ API getProvince của VTP." />
                        </label>
                        <input
                          type="text"
                          value={formData.vtpProvinceId}
                          onChange={(e) => setFormData({ ...formData, vtpProvinceId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="2"
                        />
                      </div>

                      <div>
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Mã Quận/Huyện (District ID)
                          <HelpTooltip text="Mã quận/huyện theo Viettel Post. Lấy từ API getDistrict của VTP." />
                        </label>
                        <input
                          type="text"
                          value={formData.vtpDistrictId}
                          onChange={(e) => setFormData({ ...formData, vtpDistrictId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="35"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center text-sm text-slate-400 mb-2">
                          Mã Phường/Xã (Ward ID)
                          <HelpTooltip text="Mã phường/xã theo Viettel Post. Lấy từ API getWard của VTP." />
                        </label>
                        <input
                          type="text"
                          value={formData.vtpWardId}
                          onChange={(e) => setFormData({ ...formData, vtpWardId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="454"
                        />
                      </div>
                    </div>
                  </div>
                )}
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
