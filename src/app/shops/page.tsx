import { ShopManagementPage } from '@/components/shops/ShopManagementPage'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'

export const metadata = {
  title: 'Quản lý Shops | Addressify',
  description: 'Quản lý các shop và địa chỉ gửi hàng'
}

export default function ShopsPage() {
  return (
    <ProtectedLayout>
      <ShopManagementPage />
    </ProtectedLayout>
  )
}
