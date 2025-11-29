import { ComingSoonPage } from '@/components/layout/ComingSoonPage'

export default function ApiKeysPage() {
  return (
    <ComingSoonPage
      title="API Keys Management"
      description="Quản lý API keys để tích hợp với ứng dụng của bạn"
      icon={
        <svg className="h-10 w-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      }
      features={[
        'Tạo và quản lý API keys',
        'Rate limiting cho từng key',
        'Theo dõi usage statistics',
        'Revoke keys khi cần thiết'
      ]}
      availableNow={[
        { label: 'Xử lý đơn hàng', href: '/normalize' },
        { label: 'Lịch sử báo giá', href: '/history' },
        { label: 'Cài đặt', href: '/settings' }
      ]}
      timeline="API Keys đã implement (Phase 5B). UI dashboard đang được hoàn thiện."
    />
  )
}
