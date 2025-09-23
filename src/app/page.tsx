'use client'

import { useState } from 'react'
import { AddressProcessor } from '@/components/AddressProcessor'
import { ShippingComparison } from '@/components/ShippingComparison'
import { AddressData } from '@/types/address'

export default function Home() {
  const [processedAddresses, setProcessedAddresses] = useState<AddressData[]>([])

  const handleAddressesProcessed = (addresses: AddressData[]) => {
    setProcessedAddresses(addresses)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Addressify
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Biến địa chỉ lộn xộn thành đơn hàng hoàn hảo
          </p>
          <p className="text-sm text-gray-500">
            Chuẩn hóa địa chỉ Việt Nam • So sánh phí ship • In tem hàng loạt
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Address Processing Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Xử lý địa chỉ
            </h2>
            <AddressProcessor onAddressesProcessed={handleAddressesProcessed} />
          </div>

          {/* Shipping Comparison Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              So sánh phí ship
            </h2>
            <ShippingComparison addresses={processedAddresses} />
          </div>
        </div>

        {/* Results Section */}
        {processedAddresses.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Kết quả xử lý ({processedAddresses.length} địa chỉ)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Địa chỉ gốc</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tỉnh/TP</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quận/Huyện</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phường/Xã</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {processedAddresses.map((address, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 text-sm text-gray-900">{address.original}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{address.province}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{address.district}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{address.ward}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          address.isValid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {address.isValid ? 'Hợp lệ' : 'Cần kiểm tra'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}