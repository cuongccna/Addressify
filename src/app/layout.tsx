import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Addressify - Biến địa chỉ lộn xộn thành đơn hàng hoàn hảo',
  description: 'Ứng dụng chuẩn hóa địa chỉ Việt Nam và so sánh phí ship cho người bán hàng online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="font-sans">{children}</body>
    </html>
  )
}