import { ComingSoonPage } from '@/components/layout/ComingSoonPage'

export default function WebhooksPage() {
  return (
    <ComingSoonPage
      title="Webhook Integrations"
      description="Tích hợp webhooks để nhận thông báo realtime"
      icon={
        <svg className="h-10 w-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }
      features={[
        'Nhận events realtime từ hệ thống',
        'HMAC signature verification',
        'Retry logic cho failed webhooks',
        'Webhook logs và debugging'
      ]}
      availableNow={[
        { label: 'Xử lý đơn hàng', href: '/normalize' },
        { label: 'Lịch sử báo giá', href: '/history' },
        { label: 'Cài đặt', href: '/settings' }
      ]}
      timeline="Webhooks đã implement (Phase 5C). UI management dashboard đang được xây dựng."
    />
  )
}
