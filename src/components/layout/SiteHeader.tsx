'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserMenu } from './UserMenu'

interface NavItem {
  href: string
  label: string
  icon: string
}

const publicNavItems: NavItem[] = [
  { href: '/', label: 'Trang chủ', icon: '🏠' },
  { href: '/about', label: 'Giới thiệu', icon: '📖' },
  { href: '/docs', label: 'Tài liệu', icon: '📚' },
  { href: '/contact', label: 'Liên hệ', icon: '📧' },
]

const protectedNavItems: NavItem[] = [
  { href: '/normalize', label: 'Báo giá', icon: '🎯' },
  { href: '/shops', label: 'Shops', icon: '🏪' },
  { href: '/history', label: 'Lịch sử', icon: '📊' },
  { href: '/master-data', label: 'Master Data', icon: '🗄️' },
  { href: '/settings', label: 'Cài đặt', icon: '⚙️' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  // Don't show header on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null
  }

  const navItems = user ? [...publicNavItems.slice(0, 1), ...protectedNavItems] : publicNavItems

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-purple-600 text-lg font-bold text-white shadow-lg shadow-sky-500/30">
              A
            </span>
            <span className="text-xl font-bold text-white hidden sm:block">Addressify</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  pathname === item.href
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-slate-700 animate-pulse" />
            ) : user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/sign-in"
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-4 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                pathname === item.href
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-800/50'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
