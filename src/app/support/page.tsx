import { ComingSoonPage } from '@/components/layout/ComingSoonPage'

export default function SupportPage() {
  return (
    <ComingSoonPage
      title="Trung tâm hỗ trợ"
      description="FAQ, tutorials, và liên hệ support team"
      icon={
        <svg className="h-10 w-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      }
      features={[
        'FAQ và hướng dẫn sử dụng',
        'Video tutorials',
        'Live chat support',
        'Ticket system',
        'Knowledge base'
      ]}
      availableNow={[
        { label: 'Liên hệ qua email', href: '/contact' },
        { label: 'Đặt lịch demo', href: '/demo' },
        { label: 'Xử lý đơn hàng', href: '/normalize' }
      ]}
      timeline="Support center đang được thiết kế. Hiện tại liên hệ qua trang Contact."
    />
  )
}
