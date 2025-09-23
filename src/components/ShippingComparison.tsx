'use client'

import { useState, useEffect } from 'react'
import { AddressData, ShippingQuote, ShippingRate } from '@/types/address'

interface ShippingComparisonProps {
  addresses: AddressData[]
}

// Mock shipping providers data
const shippingProviders = [
  { id: 'ghn', name: 'Giao Hàng Nhanh (GHN)' },
  { id: 'ghtk', name: 'Giao Hàng Tiết Kiệm (GHTK)' },
  { id: 'vnpost', name: 'VNPost' },
  { id: 'jnt', name: 'J&T Express' },
]

// Mock function to calculate shipping rates
function calculateShippingRates(address: AddressData): ShippingRate[] {
  if (!address.isValid) {
    return []
  }

  // Base rates (mock data)
  const baseRates = {
    ghn: { base: 25000, perKm: 500 },
    ghtk: { base: 22000, perKm: 450 },
    vnpost: { base: 20000, perKm: 400 },
    jnt: { base: 23000, perKm: 480 },
  }

  // Calculate distance factor based on province (simplified)
  const distanceFactor = address.province.includes('Hồ Chí Minh') || address.province.includes('Hà Nội') ? 1 : 1.5

  return shippingProviders.map(provider => {
    const config = baseRates[provider.id as keyof typeof baseRates]
    const cost = Math.round((config.base + (config.perKm * 10 * distanceFactor)) / 1000) * 1000
    
    return {
      providerId: provider.id,
      providerName: provider.name,
      cost,
      estimatedDays: provider.id === 'ghn' ? '1-2 ngày' : provider.id === 'ghtk' ? '2-3 ngày' : '3-5 ngày',
      service: 'Giao hàng tiêu chuẩn'
    }
  })
}

export function ShippingComparison({ addresses }: ShippingComparisonProps) {
  const [quotes, setQuotes] = useState<ShippingQuote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAddresses, setSelectedAddresses] = useState<Set<number>>(new Set())

  useEffect(() => {
    const calculateQuotes = async () => {
      setIsLoading(true)
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const newQuotes: ShippingQuote[] = addresses.map((address, index) => ({
          addressId: index.toString(),
          rates: calculateShippingRates(address),
          error: !address.isValid ? 'Địa chỉ không hợp lệ' : undefined
        }))
        
        setQuotes(newQuotes)
      } catch (error) {
        console.error('Error calculating shipping quotes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (addresses.length > 0) {
      calculateQuotes()
    } else {
      setQuotes([])
    }
  }, [addresses])

  const toggleAddressSelection = (index: number) => {
    const newSelected = new Set(selectedAddresses)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedAddresses(newSelected)
  }

  const selectAll = () => {
    setSelectedAddresses(new Set(addresses.map((_, index) => index)))
  }

  const clearSelection = () => {
    setSelectedAddresses(new Set())
  }

  const exportToPDF = () => {
    alert('Tính năng in tem PDF đang được phát triển...')
  }

  const exportToCSV = () => {
    if (selectedAddresses.size === 0) {
      alert('Vui lòng chọn ít nhất một địa chỉ để xuất CSV')
      return
    }

    const csvData = []
    const headers = ['Địa chỉ gốc', 'Tỉnh/TP', 'Quận/Huyện', 'Phường/Xã', 'GHN', 'GHTK', 'VNPost', 'J&T']
    csvData.push(headers.join(','))

    selectedAddresses.forEach(index => {
      const address = addresses[index]
      const quote = quotes[index]
      
      if (quote && !quote.error) {
        const row = [
          `"${address.original}"`,
          `"${address.province}"`,
          `"${address.district}"`,
          `"${address.ward}"`,
          quote.rates.find(r => r.providerId === 'ghn')?.cost || '',
          quote.rates.find(r => r.providerId === 'ghtk')?.cost || '',
          quote.rates.find(r => r.providerId === 'vnpost')?.cost || '',
          quote.rates.find(r => r.providerId === 'jnt')?.cost || '',
        ]
        csvData.push(row.join(','))
      }
    })

    const csvContent = csvData.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'shipping_comparison.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Vui lòng nhập địa chỉ để so sánh phí ship</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tính phí ship...
          </div>
        </div>
      )}

      {/* Selection Controls */}
      {quotes.length > 0 && (
        <div className="flex gap-3 items-center">
          <span className="text-sm text-gray-600">
            Đã chọn: {selectedAddresses.size}/{addresses.length}
          </span>
          <button
            onClick={selectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Chọn tất cả
          </button>
          <button
            onClick={clearSelection}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {/* Quotes Table */}
      {quotes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAddresses.size === addresses.length}
                    onChange={selectedAddresses.size === addresses.length ? clearSelection : selectAll}
                  />
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Địa chỉ</th>
                {shippingProviders.map(provider => (
                  <th key={provider.id} className="px-3 py-2 text-center text-sm font-medium text-gray-700">
                    {provider.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedAddresses.has(index)}
                      onChange={() => toggleAddressSelection(index)}
                      disabled={!!quote.error}
                    />
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <div className="max-w-xs">
                      <p className="font-medium text-gray-900 truncate">{addresses[index].original}</p>
                      <p className="text-gray-500 text-xs truncate">
                        {addresses[index].province} • {addresses[index].district}
                      </p>
                    </div>
                  </td>
                  {quote.error ? (
                    <td colSpan={shippingProviders.length} className="px-3 py-2 text-center text-red-500 text-sm">
                      {quote.error}
                    </td>
                  ) : (
                    shippingProviders.map(provider => {
                      const rate = quote.rates.find(r => r.providerId === provider.id)
                      return (
                        <td key={provider.id} className="px-3 py-2 text-center">
                          {rate ? (
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">
                                {rate.cost.toLocaleString('vi-VN')}đ
                              </p>
                              <p className="text-xs text-gray-500">{rate.estimatedDays}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      )
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Export Actions */}
      {quotes.length > 0 && (
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={exportToPDF}
            disabled={selectedAddresses.size === 0}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            In tem PDF ({selectedAddresses.size})
          </button>
          <button
            onClick={exportToCSV}
            disabled={selectedAddresses.size === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Xuất CSV ({selectedAddresses.size})
          </button>
        </div>
      )}
    </div>
  )
}