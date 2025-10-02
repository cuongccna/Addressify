"use client";

import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/buttonVariants";
// import { GHNQuoteDemo } from "@/components/features/GHNQuoteDemo";
// import { GHTKQuoteDemo } from "@/components/features/GHTKQuoteDemo";
import { Card } from "@/components/ui/Card";
// import { VTPQuoteDemo } from "@/components/features/VTPQuoteDemo";
import { LiveComparisonDemo } from "@/components/features/LiveComparisonDemo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const highlights = [
  {
    title: "60s Setup",
    description: "Import danh sách, xử lý địa chỉ và so sánh phí ship trong vòng một phút.",
  },
  {
    title: "+30% Độ chính xác",
    description: "Chuẩn hóa địa chỉ Việt Nam bằng AI và dữ liệu vận chuyển cập nhật từng ngày.",
  },
  {
    title: "Giảm 20% chi phí",
    description: "Tối ưu lựa chọn hãng vận chuyển với gợi ý tiết kiệm dựa trên lịch sử đơn hàng.",
  },
];

const steps = [
  {
    title: "1. Tải dữ liệu",
    description: "Import file Excel/CSV hoặc đồng bộ từ sàn TMĐT để sẵn sàng xử lý.",
  },
  {
    title: "2. Chuẩn hóa tự động",
    description: "AI của Addressify rà soát lỗi chính tả, chuẩn hóa quận/huyện và mã bưu cục.",
  },
  {
    title: "3. So sánh & Chọn",
    description: "Gợi ý hãng vận chuyển tối ưu về thời gian, chi phí và tỉ lệ giao thành công.",
  },
  {
    title: "4. Xuất nhãn & báo cáo",
    description: "In phiếu gửi, xuất báo cáo chi phí và theo dõi hiệu suất ship hàng theo thời gian.",
  },
];

const features = [
  {
    badge: "Realtime",
    title: "Đồng bộ đơn hàng tức thì",
    description:
      "Kết nối GHN, GHTK, VTP và các sàn TMĐT. Đồng bộ trạng thái và phí ship trong một bảng điều khiển.",
  },
  {
    badge: "AI Powered",
    title: "Chuẩn hóa địa chỉ thông minh",
    description:
      "Phân tích ngữ cảnh tiếng Việt, tự động sửa địa chỉ sai và đưa ra mức độ tự tin trước khi in nhãn.",
  },
  {
    badge: "Actionable",
    title: "Gợi ý tối ưu vận chuyển",
    description:
      "Nhìn tổng thể hiệu suất từng hãng, đề xuất phương án tiết kiệm theo khu vực và khung giờ cao điểm.",
  },
];

const testimonials = [
  {
    name: "Anh Huy – Chủ shop SneakerCity",
    quote:
      "Mỗi ngày xử lý hơn 300 đơn mà vẫn không chậm. Addressify giúp team tiết kiệm gần 25% chi phí vận chuyển.",
  },
  {
    name: "Chị Linh – Nhà phân phối mỹ phẩm",
    quote:
      "Báo cáo rõ ràng, dễ hiểu. Chỉ cần 2 click là biết hãng nào giao nhanh nhất theo khu vực.",
  },
];

const integrations = ["Shopee", "Lazada", "TikTok Shop", "Facebook Shop", "GHN", "GHTK", "Viettel Post"];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-[-10%] h-[400px] bg-gradient-to-b from-sky-500/40 via-sky-500/10 to-transparent blur-3xl" />
        <div className="absolute inset-x-0 bottom-[-40%] h-[400px] bg-gradient-to-t from-purple-500/30 via-purple-500/10 to-transparent blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-xl font-semibold text-white shadow-lg shadow-sky-500/40">
            A
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">Addressify</p>
            <p className="text-xs text-slate-300">Smart Address & Shipping Intelligence</p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-slate-200 md:flex">
          <Link className="transition hover:text-white" href="#features">
            Tính năng
          </Link>
          <Link className="transition hover:text-white" href="#workflow">
            Quy trình
          </Link>
          <Link className="transition hover:text-white" href="#integrations">
            Tích hợp
          </Link>
          <Link className="transition hover:text-white" href="#pricing">
            Bảng giá
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            className={buttonVariants({ variant: "secondary", className: "hidden px-4 py-2 md:inline-flex" })}
            href="/auth/sign-in"
          >
            Đăng nhập
          </Link>
          <Link className={buttonVariants({ className: "px-4 py-2" })} href="/auth/sign-up">
            Dùng thử miễn phí
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24">
        <section className="rounded-[32px] border border-slate-800 bg-slate-900/70 p-10 backdrop-blur-xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-sky-400" />
                Tăng tốc vận hành cho cửa hàng online của bạn
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Địa chỉ chuẩn, phí ship tối ưu, <span className="text-sky-400">mọi lúc mọi nơi</span>
              </h1>
              <p className="text-lg leading-relaxed text-slate-300">
                Addressify kết hợp AI và dữ liệu vận chuyển real-time giúp chủ shop xử lý hàng trăm đơn mỗi ngày mà vẫn chính xác, tiết kiệm và dễ quản lý.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link className={buttonVariants({ className: "w-full text-center sm:w-auto" })} href="/auth/sign-up">
                  Khởi tạo tài khoản ngay
                </Link>
                <Link
                  className={buttonVariants({ variant: "secondary", className: "w-full text-center sm:w-auto" })}
                  href="/demo"
                >
                  Xem demo 3 phút
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-3">
                {highlights.map((item) => (
                  <Card key={item.title} className="text-left" padding="sm" glass>
                    <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                  </Card>
                ))}
              </div>
            </div>
            <div className="relative mt-10 w-full max-w-md md:mt-0">
              <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-br from-sky-500/40 via-purple-500/30 to-transparent blur-2xl" />
              <div className="relative rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-sky-900/40">
                <h3 className="text-sm font-semibold text-slate-300">Dashboard trực quan</h3>
                <p className="mt-2 text-xs text-slate-500">Theo dõi trạng thái đơn hàng real-time</p>
                <div className="mt-6 space-y-4">
                  {["Đơn cần xử lý", "Đang giao", "Giao thành công", "Tối ưu phí"].map((label, index) => (
                    <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-300">{label}</p>
                        <span className="text-xs text-slate-500">+{(index + 1) * 12}%</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-800">
                        <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-purple-500" style={{ width: `${55 + index * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="space-y-12">
          <SectionHeader
            subtitle="Addressify giúp bạn tự động hóa toàn bộ luồng xử lý – từ import đơn hàng, chuẩn hóa địa chỉ đến tối ưu lựa chọn hãng ship."
            title="Quy trình 4 bước dành cho chủ shop bận rộn"
          />
          <div className="grid gap-6 md:grid-cols-2">
            {steps.map((step) => (
              <Card key={step.title} className="group relative overflow-hidden" glass>
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 via-sky-500/0 to-sky-500/10 opacity-0 transition group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 text-sm font-semibold text-sky-300">
                      {step.title.split(".")[0]}
                    </div>
                    <p className="text-sm font-semibold text-sky-200">{step.title}</p>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="features" className="space-y-10">
          <SectionHeader
            subtitle="Chọn Addressify để sở hữu công cụ quản lý vận hành hiện đại, phù hợp cho cả cửa hàng nhỏ lẫn hệ thống đa kênh."
            title="Tính năng giúp bạn kiểm soát mọi đơn hàng"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} glass>
                <span className="inline-flex rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300">
                  {feature.badge}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-100">{feature.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-10" id="live-quotes">
          <SectionHeader
            subtitle="So sánh tổng hợp từ GHN, GHTK và VTP trong một lần gửi – dễ nhìn, dễ chọn, realtime."
            title="So sánh phí ship live (Aggregator)"
          />
          <LiveComparisonDemo />
        </section>

        <section id="integrations" className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10">
          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Kết nối nền tảng bạn đang dùng</h2>
            <p className="text-sm text-slate-300">
              Addressify đồng bộ dữ liệu từ hệ thống bán hàng, sàn thương mại điện tử và hãng vận chuyển phổ biến tại Việt Nam.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-200 sm:grid-cols-4">
            {integrations.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-center shadow-inner shadow-slate-900/40">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
          <Card glass padding="lg">
            <h2 className="text-2xl font-semibold tracking-tight">Vì sao các chủ shop tin tưởng Addressify?</h2>
            <div className="mt-6 space-y-6">
              {testimonials.map((item) => (
                <Card key={item.name} padding="md">
                  <p className="text-sm leading-relaxed text-slate-300">“{item.quote}”</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-500">{item.name}</p>
                </Card>
              ))}
            </div>
          </Card>
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-sky-500/20 via-purple-500/20 to-slate-900 p-8">
            <h3 className="text-lg font-semibold text-white">Bảng giá linh hoạt</h3>
            <p className="mt-2 text-sm text-slate-100">
              Không phí ẩn, hủy gói bất kỳ lúc nào. Bắt đầu miễn phí và nâng cấp khi bạn cần thêm sức mạnh.
            </p>
            <ul className="mt-6 space-y-4 text-sm text-slate-100" id="pricing">
              <li className="rounded-2xl border border-white/20 bg-white/5 p-4">
                <p className="font-semibold text-white">Free</p>
                <p className="mt-1 text-xs text-slate-200">50 địa chỉ/tháng, chuẩn hóa cơ bản, xuất CSV.</p>
              </li>
              <li className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="font-semibold text-white">Pro – 19$/tháng</p>
                <p className="mt-1 text-xs text-slate-200">1.000 địa chỉ/tháng, AI, dashboard, hỗ trợ ưu tiên.</p>
              </li>
              <li className="rounded-2xl border border-white/20 bg-white/5 p-4">
                <p className="font-semibold text-white">Business – 49$/tháng</p>
                <p className="mt-1 text-xs text-slate-200">5.000 địa chỉ/tháng, multi-store, API, tích hợp tùy chỉnh.</p>
              </li>
            </ul>
            <Link className={buttonVariants({ variant: "white", className: "mt-8 block w-full text-center" })} href="/contact">
              Nhận tư vấn triển khai
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
          <div className="grid md:grid-cols-[1.2fr,1fr]">
            <div className="space-y-6 p-8 md:p-12">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Sẵn sàng tăng tốc đơn hàng ngay hôm nay?
              </h2>
              <p className="text-base text-slate-300">
                Hơn 1.200 shop đang dùng Addressify để xử lý đơn và tối ưu vận chuyển mỗi ngày. Gia nhập ngay để không bỏ lỡ.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link className={buttonVariants({ className: "w-full text-center sm:w-auto" })} href="/auth/sign-up">
                  Đăng ký dùng thử 14 ngày
                </Link>
                <Link
                  className={buttonVariants({ variant: "secondary", className: "w-full text-center sm:w-auto" })}
                  href="/demo"
                >
                  Đặt lịch demo 1-1
                </Link>
              </div>
            </div>
            <div className="relative flex items-center justify-center border-t border-slate-800 bg-gradient-to-br from-sky-500/10 via-purple-500/10 to-slate-900 md:border-l md:border-t-0">
              <div className="absolute h-40 w-40 rounded-full bg-sky-500/40 blur-3xl" />
              <div className="relative mx-auto max-w-sm rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-900/50">
                <h3 className="text-sm font-semibold text-slate-200">Checklist cho chủ shop</h3>
                <ul className="mt-4 space-y-3 text-xs text-slate-300">
                  <li>✔ Chuẩn hóa 100% địa chỉ trước khi ship</li>
                  <li>✔ Tự động gợi ý hãng ship tối ưu theo khu vực</li>
                  <li>✔ Nhắc nhở đơn chậm & cảnh báo phí phát sinh</li>
                  <li>✔ Báo cáo hiệu suất giao hàng theo kênh</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
