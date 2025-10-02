'use client'

import { useState } from 'react'
import { AddressData } from '@/types/address'
import { 
  processAddressesFromText, 
  processAddressesFromCSV
} from '@/utils/addressNormalizer'

interface AddressProcessorProps {
  onAddressesProcessed: (addresses: AddressData[]) => void
  useMasterData?: boolean // New prop to enable master data matching
}

export function AddressProcessor({ onAddressesProcessed, useMasterData = true }: AddressProcessorProps) {
  const [inputText, setInputText] = useState('')
  const [inputType, setInputType] = useState<'text' | 'csv'>('text')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcess = async () => {
    if (!inputText.trim()) return

    setIsProcessing(true)
    
    try {
      let addresses: AddressData[]
      
      if (useMasterData && inputType === 'text') {
        // Call API for master data matching (server-side)
        const lines = inputText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
        
        const response = await fetch('/api/normalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: lines, useMasterData: true })
        })
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.message || 'Failed to normalize addresses')
        }
        
        addresses = result.data
      } else {
        // Fallback to regex-based extraction (client-side)
        addresses = inputType === 'csv' 
          ? processAddressesFromCSV(inputText)
          : processAddressesFromText(inputText)
      }
      
      onAddressesProcessed(addresses)
    } catch (error) {
      console.error('Error processing addresses:', error)
      alert(`Lỗi xử lý địa chỉ: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      <div className="flex gap-4 p-3 bg-gray-50 rounded-xl">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="inputType"
            value="text"
            checked={inputType === 'text'}
            onChange={(e) => setInputType(e.target.value as 'text' | 'csv')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Văn bản thô</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="inputType"
            value="csv"
            checked={inputType === 'csv'}
            onChange={(e) => setInputType(e.target.value as 'text' | 'csv')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Định dạng CSV</span>
        </label>
      </div>

      {/* Input Area */}
      <div className="relative">
        <label htmlFor="address-input" className="block text-sm font-semibold text-gray-700 mb-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {inputType === 'csv' ? 'Dán dữ liệu CSV:' : 'Dán danh sách địa chỉ:'}
          </div>
        </label>
        <div className="relative">
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 placeholder:text-gray-400"
          />
          {inputText && (
            <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded-md">
              {inputText.split('\n').filter(line => line.trim()).length} dòng
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleProcess}
          disabled={!inputText.trim() || isProcessing}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Xử lý địa chỉ
            </span>
          )}
        </button>
        
        <button
          onClick={loadSample}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:-translate-y-0.5"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Tải mẫu
          </span>
        </button>
        
        <button
          onClick={handleClear}
          className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 hover:border-red-400 transition-all duration-200 hover:-translate-y-0.5"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa
          </span>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4 mt-0.5">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-3">Hướng dẫn sử dụng:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Dán danh sách địa chỉ, mỗi địa chỉ một dòng
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Hệ thống sẽ tự động tách và chuẩn hóa thành Tỉnh/Quận/Phường
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Chuyển đổi địa chỉ 2 cấp về 3 cấp để tương thích với API vận chuyển
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Hỗ trợ định dạng CSV với địa chỉ ở cột đầu tiên
              </li>
            </ul>
            
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-700 font-medium">
                💡 <strong>Pro tip:</strong> Nhấn &ldquo;Tải mẫu&rdquo; để xem ví dụ địa chỉ Việt Nam được hỗ trợ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}