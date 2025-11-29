'use client'

import Link from "next/link";
import { buttonVariants } from "@/components/ui/buttonVariants";
import { useAuth } from "@/contexts/AuthContext";

const footerLinks = [
  {
    title: "Giới thiệu",
    items: [
      { label: "Về Addressify", href: "/about" },
      { label: "Tầm nhìn & mục tiêu", href: "/about#vision" },
      { label: "Đội ngũ & văn hóa", href: "/about#team" },
    ],
  },
  {
    title: "Pháp lý",
    items: [
      { label: "Điều khoản sử dụng", href: "/legal/terms" },
      { label: "Chính sách bảo mật", href: "/legal/privacy" },
    ],
  },
  {
    title: "Hỗ trợ",
    items: [
      { label: "Liên hệ", href: "/contact" },
      { label: "Đặt lịch demo", href: "/demo" },
      { label: "Trung tâm trợ giúp", href: "#" },
    ],
  },
];

export function SiteFooter() {
  const { user, loading } = useAuth()

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 text-sm text-slate-300 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-4">
          <Link className="inline-flex items-center gap-3 text-white" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-lg font-semibold text-white shadow-lg shadow-sky-500/40">
              A
            </span>
            <span className="text-lg font-semibold">Addressify</span>
          </Link>
          <p className="text-sm text-slate-400">
            Nền tảng Address Intelligence giúp chủ shop Việt Nam chuẩn hóa địa chỉ, tối ưu phí vận chuyển và mở rộng vận hành đa kênh.
          </p>
          
          {/* Conditional Footer CTA */}
          <div className="flex gap-3">
            {!loading && (
              <>
                {user ? (
                  // Logged in - Quick links to main features
                  <>
                    <Link className={buttonVariants({ className: "px-4 py-2" })} href="/normalize">
                      Xử lý đơn hàng
                    </Link>
                    <Link className={buttonVariants({ variant: "secondary", className: "px-4 py-2" })} href="/history">
                      Lịch sử
                    </Link>
                  </>
                ) : (
                  // Not logged in - Signup/demo
                  <>
                    <Link className={buttonVariants({ className: "px-4 py-2" })} href="/auth/sign-up">
                      Dùng thử miễn phí
                    </Link>
                    <Link className={buttonVariants({ variant: "secondary", className: "px-4 py-2" })} href="/demo">
                      Xem demo
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {footerLinks.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link className="text-slate-300 transition hover:text-sky-300" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-800/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} Addressify. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link className="transition hover:text-slate-300" href="/legal/privacy">
              Chính sách bảo mật
            </Link>
            <Link className="transition hover:text-slate-300" href="/legal/terms">
              Điều khoản sử dụng
            </Link>
            <Link className="transition hover:text-slate-300" href="/contact">
              Hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
