'use client'

import { useShop } from '@/contexts/ShopContext'
import Link from 'next/link'

export function ShopSelector() {
  const { shops, selectedShop, loading, selectShop } = useShop()

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Đang tải shops...</span>
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <Link
        href="/shops"
        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Tạo Shop đầu tiên
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedShop?.id || ''}
        onChange={(e) => selectShop(e.target.value)}
        className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        {shops.map((shop) => (
          <option key={shop.id} value={shop.id}>
            {shop.name}
          </option>
        ))}
      </select>

      <Link
        href="/shops"
        className="p-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-colors"
        title="Quản lý shops"
      >
        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </Link>
    </div>
  )
}
