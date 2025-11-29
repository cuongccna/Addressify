'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

interface Shop {
  id: string
  name: string
  userId: string
  senderAddress: string
  senderWard?: string | null
  senderDistrict: string
  senderProvince: string
  // GHN
  ghnProvinceId?: string | null
  ghnDistrictId?: string | null
  ghnWardCode?: string | null
  ghnShopId?: string | null
  // GHTK
  ghtkPickAddress?: string | null
  ghtkPickProvince?: string | null
  ghtkPickDistrict?: string | null
  ghtkPickWard?: string | null
  ghtkPartnerId?: string | null
  // VTP
  vtpProvinceId?: string | null
  vtpDistrictId?: string | null
  vtpWardId?: string | null
  vtpCustomerId?: string | null
  vtpGroupId?: string | null
  
  createdAt: string
  updatedAt: string
}

interface ShopContextType {
  shops: Shop[]
  selectedShop: Shop | null
  loading: boolean
  selectShop: (shopId: string) => void
  refreshShops: () => Promise<void>
  createShop: (data: Partial<Shop>) => Promise<{ shop: Shop | null; error: Error | null }>
  updateShop: (shopId: string, data: Partial<Shop>) => Promise<{ shop: Shop | null; error: Error | null }>
  deleteShop: (shopId: string) => Promise<{ error: Error | null }>
}

const ShopContext = createContext<ShopContextType | undefined>(undefined)

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshShops = useCallback(async () => {
    if (!user) {
      setShops([])
      setSelectedShop(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/shops')
      if (!response.ok) throw new Error('Failed to fetch shops')
      
      const data = await response.json()
      setShops(data.shops || [])
      
      // Auto-select first shop if none selected
      if (data.shops?.length > 0 && !selectedShop) {
        setSelectedShop(data.shops[0])
      }
    } catch (error) {
      console.error('Error fetching shops:', error)
      setShops([])
    } finally {
      setLoading(false)
    }
  }, [user, selectedShop])

  useEffect(() => {
    refreshShops()
  }, [user, refreshShops])

  const selectShop = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId)
    if (shop) {
      setSelectedShop(shop)
      localStorage.setItem('selectedShopId', shopId)
    }
  }

  const createShop = async (data: Partial<Shop>) => {
    try {
      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create shop')
      }

      const { shop } = await response.json()
      await refreshShops()
      
      return { shop, error: null }
    } catch (error) {
      return { shop: null, error: error as Error }
    }
  }

  const updateShop = async (shopId: string, data: Partial<Shop>) => {
    try {
      const response = await fetch(`/api/shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update shop')
      }

      const { shop } = await response.json()
      await refreshShops()
      
      return { shop, error: null }
    } catch (error) {
      return { shop: null, error: error as Error }
    }
  }

  const deleteShop = async (shopId: string) => {
    try {
      const response = await fetch(`/api/shops/${shopId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete shop')
      }

      await refreshShops()
      
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  return (
    <ShopContext.Provider
      value={{
        shops,
        selectedShop,
        loading,
        selectShop,
        refreshShops,
        createShop,
        updateShop,
        deleteShop,
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  const context = useContext(ShopContext)
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider')
  }
  return context
}
