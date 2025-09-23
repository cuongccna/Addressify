'use client'

import { useState } from 'react'
import { AddressData } from '@/types/address'
import { processAddressesFromText, processAddressesFromCSV } from '@/utils/addressProcessor'

interface AddressProcessorProps {
  onAddressesProcessed: (addresses: AddressData[]) => void
}

export function AddressProcessor({ onAddressesProcessed }: AddressProcessorProps) {
  const [inputText, setInputText] = useState('')
  const [inputType, setInputType] = useState<'text' | 'csv'>('text')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcess = async () => {
    if (!inputText.trim()) return

    setIsProcessing(true)
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const addresses = inputType === 'csv' 
        ? processAddressesFromCSV(inputText)
        : processAddressesFromText(inputText)
      
      onAddressesProcessed(addresses)
    } catch (error) {
      console.error('Error processing addresses:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setInputText('')
    onAddressesProcessed([])
  }

  const sampleAddresses = [
    '123 Nguyễn Văn Linh, Phường Tân Thuận Đông, Quận 7, TP.HCM',
    '456 Lê Duẩn, P. Bến Nghé, Q.1, Hồ Chí Minh',
    '789 Hoàng Hoa Thám, Ba Đình, Hà Nội',
    '321 Trần Hưng Đạo, Quận 1, TPHCM',
    '654 Nguyễn Huệ, Hoàn Kiếm, HN'
  ]

  const loadSample = () => {
    setInputText(sampleAddresses.join('\n'))
    setInputType('text')
  }

  return (
    <div className="space-y-6">
      {/* Input Type Selection */}
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="inputType"
            value="text"
            checked={inputType === 'text'}
            onChange={(e) => setInputType(e.target.value as 'text' | 'csv')}
            className="mr-2"
          />
          Văn bản thô
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="inputType"
            value="csv"
            checked={inputType === 'csv'}
            onChange={(e) => setInputType(e.target.value as 'text' | 'csv')}
            className="mr-2"
          />
          Định dạng CSV
        </label>
      </div>

      {/* Input Area */}
      <div>
        <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 mb-2">
          {inputType === 'csv' ? 'Dán dữ liệu CSV:' : 'Dán danh sách địa chỉ:'}
        </label>
        <textarea
          id="address-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            inputType === 'csv'
              ? 'Địa chỉ,Tên khách hàng,SĐT\n"123 Nguyễn Văn Linh, Q7, HCM",Nguyễn Văn A,0901234567\n"456 Lê Duẩn, Q1, HCM",Trần Thị B,0902345678'
              : 'Mỗi địa chỉ một dòng:\n123 Nguyễn Văn Linh, Q7, HCM\n456 Lê Duẩn, Q1, HCM\n789 Hoàng Hoa Thám, Ba Đình, HN'
          }
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleProcess}
          disabled={!inputText.trim() || isProcessing}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Xử lý địa chỉ'
          )}
        </button>
        
        <button
          onClick={loadSample}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Tải mẫu
        </button>
        
        <button
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Xóa
        </button>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium mb-2">Hướng dẫn:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Dán danh sách địa chỉ, mỗi địa chỉ một dòng</li>
          <li>Hệ thống sẽ tự động tách và chuẩn hóa thành Tỉnh/Quận/Phường</li>
          <li>Chuyển đổi địa chỉ 2 cấp về 3 cấp để tương thích với API vận chuyển</li>
          <li>Hỗ trợ định dạng CSV với địa chỉ ở cột đầu tiên</li>
        </ul>
      </div>
    </div>
  )
}