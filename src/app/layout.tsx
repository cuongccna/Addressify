import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ShopProvider } from '@/contexts/ShopContext'

// Note: Scheduler is initialized separately in production
// Use /api/jobs/start endpoint or process manager to start scheduler

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Addressify - AI-Powered Address Intelligence Platform',
  description: 'Nền tảng AI giúp chủ shop online Việt Nam chuẩn hóa địa chỉ và tối ưu chi phí vận chuyển',
  keywords: ['address processing', 'vietnam', 'shipping', 'logistics', 'ai'],
  authors: [{ name: 'Addressify Team' }],
  creator: 'Addressify',
  publisher: 'Addressify',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://addressify.vn'),
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://addressify.vn',
    title: 'Addressify - AI-Powered Address Intelligence',
    description: 'Chuẩn hóa địa chỉ Việt Nam và tối ưu chi phí vận chuyển với AI',
    siteName: 'Addressify',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Addressify - AI Address Processing Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Addressify - AI-Powered Address Intelligence',
    description: 'Chuẩn hóa địa chỉ Việt Nam và tối ưu chi phí vận chuyển',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="relative min-h-screen bg-slate-950 text-slate-100 font-sans" suppressHydrationWarning>
        <AuthProvider>
          <ShopProvider>
            {/* Background Pattern */}
            <div className="pointer-events-none fixed inset-0 bg-hero-pattern opacity-10" />
            
            {/* Main Content */}
            <div className="relative z-10">
              {children}
            </div>
          </ShopProvider>
        </AuthProvider>
        
        {/* Global Loading Indicator */}
        <div id="global-loader" className="hidden fixed inset-0 z-50 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 spinner" />
              <p className="text-neutral-600 font-medium">Đang xử lý...</p>
            </div>
          </div>
        </div>
        
        {/* Global Toast Container */}
        <div id="toast-container" className="fixed bottom-6 right-6 z-50 space-y-2" />
        
        {/* Development Tools - Only in dev mode */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 z-50 opacity-30 hover:opacity-100 transition-opacity">
            <div className="bg-neutral-800 text-white px-3 py-2 rounded-lg text-xs font-mono">
              DEV: v2.0.0
            </div>
          </div>
        )}
      </body>
    </html>
  )
}