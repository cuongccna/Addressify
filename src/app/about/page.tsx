import { Metadata } from "next";
import Script from "next/script";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Về Addressify | Nền tảng Address Intelligence cho chủ shop Việt Nam",
  description:
    "Tìm hiểu về Addressify – sứ mệnh, câu chuyện và đội ngũ xây dựng nền tảng AI giúp chủ shop chuẩn hóa địa chỉ, tối ưu vận chuyển và mở rộng kinh doanh.",
  keywords: [
    "Addressify",
    "Address Intelligence",
    "chuẩn hóa địa chỉ",
    "tối ưu vận chuyển",
    "AI logistics",
    "thương mại điện tử Việt Nam",
  ],
  alternates: {
    canonical: "https://addressify.cloud/about",
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Addressify',
  url: 'https://addressify.cloud',
  logo: 'https://addressify.cloud/logo.svg',
  description:
    'Addressify giúp chủ shop Việt Nam chuẩn hóa địa chỉ, tối ưu chi phí vận chuyển và quản lý đa kênh bằng trí tuệ nhân tạo.',
  foundingDate: '2024-01-01',
  founder: {
    '@type': 'Person',
    name: 'Addressify Team',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'cuong.vhcc@gmail.com',
    telephone: '+84-987-939-605',
    areaServed: 'VN',
  },
  sameAs: [
    'https://www.facebook.com/addressify',
    'https://www.linkedin.com/company/addressify',
  ],
};

const milestones = [
  {
    year: '2024',
    title: 'Khởi tạo Addressify',
    description:
      'Xây dựng hệ thống chuẩn hóa địa chỉ Việt Nam dựa trên dữ liệu hành chính và kinh nghiệm vận hành thực tế của các chủ shop lớn.',
  },
  {
    year: '2025',
    title: 'AI Shipping Intelligence',
    description:
      'Ra mắt thuật toán gợi ý hãng vận chuyển tối ưu với mục tiêu tiết kiệm 20% chi phí và tăng 30% độ chính xác giao hàng.',
  },
  {
    year: '2026',
    title: 'Mở rộng Đông Nam Á',
    description:
      'Kết nối các hãng vận chuyển khu vực và tích hợp nền tảng TMĐT quốc tế nhằm phục vụ các doanh nghiệp xuất khẩu.',
  },
];

const values = [
  {
    title: 'Tập trung vào chủ shop',
    description:
      'Mọi cập nhật sản phẩm đều xuất phát từ bài toán thực tế của các cửa hàng online tại Việt Nam.',
  },
  {
    title: 'Dữ liệu minh bạch',
    description:
      'Chúng tôi cam kết bảo mật, minh bạch trong lưu trữ và khai thác dữ liệu khách hàng.',
  },
  {
    title: 'Đổi mới liên tục',
    description:
      'Addressify đầu tư vào AI và học máy để nâng cấp sản phẩm mỗi tháng, đảm bảo lợi thế cạnh tranh cho khách hàng.',
  },
];

const team = [
  {
    name: 'Nguyễn Cường',
    role: 'Founder & Product Lead',
    bio: '10+ năm xây nền tảng quản trị vận hành cho các thương hiệu TMĐT Việt Nam.',
  },
  {
    name: 'Trần Linh',
    role: 'Head of Data Intelligence',
    bio: 'Chuyên gia dữ liệu với kinh nghiệm tối ưu logistics cho 1.000+ kho hàng.',
  },
  {
    name: 'Phạm Huy',
    role: 'Engineering Lead',
    bio: 'Từng lãnh đạo các dự án Next.js và hệ thống realtime ở quy mô triệu người dùng.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Script
        id="addressify-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-20">
        <header className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">About Addressify</p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Address Intelligence cho cửa hàng Việt Nam
          </h1>
          <p className="text-base text-slate-300">
            Addressify được xây dựng để giúp chủ shop xử lý hàng trăm đơn mỗi ngày với độ chính xác cao, chi phí tối ưu và trải nghiệm khách hàng vượt trội.
          </p>
        </header>

        <SectionHeader
          centered={false}
          title="Sứ mệnh & tầm nhìn"
          subtitle="Trở thành nền tảng Address Intelligence hàng đầu Đông Nam Á, giúp doanh nghiệp Việt Nam vận hành đa kênh hiệu quả và mở rộng ra thị trường quốc tế."
        />

        <Card glass padding="lg" className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-100">Những cột mốc quan trọng</h2>
          <div className="space-y-6">
            {milestones.map((item) => (
              <div key={item.year} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">{item.year}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-100">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card glass padding="lg" id="vision" className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-100">Giải pháp toàn diện cho chủ shop</h2>
          <ul className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <li className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
              Chuẩn hóa địa chỉ AI với độ chính xác mục tiêu 95%.
            </li>
            <li className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
              So sánh phí ship real-time giữa GHN, GHTK và VTP.
            </li>
            <li className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
              Báo cáo business intelligence theo khu vực, kênh bán hàng.
            </li>
            <li className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
              API mở cho nhà phát triển và tích hợp với các sàn TMĐT.
            </li>
          </ul>
        </Card>

        <Card glass padding="lg" id="team" className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-100">Giá trị cốt lõi</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold text-slate-100">{value.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{value.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card glass padding="lg" className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-100">Đội ngũ nòng cốt</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-sm font-semibold text-sky-300">{member.role}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-100">{member.name}</h3>
                <p className="mt-2 text-sm text-slate-300">{member.bio}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SiteFooter />
    </div>
  );
}
