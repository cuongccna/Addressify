import Link from "next/link";
import { Metadata } from "next";
import { buttonVariants } from "@/components/ui/buttonVariants";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Chính sách bảo mật Addressify",
  description:
    "Chính sách bảo mật của Addressify cam kết bảo vệ dữ liệu khách hàng, tuân thủ các quy định pháp luật và tiêu chuẩn bảo mật hiện đại.",
};

const policies = [
  {
    title: "1. Dữ liệu thu thập",
    content:
      "Chúng tôi thu thập thông tin tài khoản, địa chỉ giao nhận, trạng thái đơn hàng và các cấu hình liên quan đến doanh nghiệp nhằm cung cấp dịch vụ chuẩn hóa địa chỉ và gợi ý vận chuyển.",
  },
  {
    title: "2. Mục đích sử dụng",
    content:
      "Dữ liệu được sử dụng để nâng cao độ chính xác của AI, tối ưu chi phí vận chuyển và cung cấp báo cáo phân tích cho chủ shop. Addressify không bán hoặc chia sẻ dữ liệu cho bên thứ ba không có thẩm quyền.",
  },
  {
    title: "3. Lưu trữ & bảo vệ",
    content:
      "Thông tin được lưu trữ trên hạ tầng đạt tiêu chuẩn bảo mật quốc tế, mã hóa ở cả trạng thái nghỉ và truyền tải. Chúng tôi áp dụng phân quyền truy cập nghiêm ngặt cùng hệ thống giám sát liên tục.",
  },
  {
    title: "4. Quyền của người dùng",
    content:
      "Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu cá nhân. Các yêu cầu được xử lý trong vòng 7 ngày làm việc qua kênh hỗ trợ chính thức của Addressify.",
  },
  {
    title: "5. Đối tác & tích hợp",
    content:
      "Khi kích hoạt kết nối với các hãng vận chuyển hoặc sàn TMĐT, Addressify chỉ chia sẻ dữ liệu cần thiết để thực hiện chức năng và luôn tuân thủ điều khoản của đối tác liên quan.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-20">
        <header className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Pháp lý</p>
          <h1 className="text-4xl font-semibold tracking-tight">Chính sách bảo mật Addressify</h1>
          <p className="text-base text-slate-300">
            Chúng tôi ưu tiên bảo vệ dữ liệu khách hàng, áp dụng tiêu chuẩn bảo mật cao và minh bạch trong mọi hoạt động xử lý dữ liệu.
          </p>
        </header>

        <SectionHeader
          centered={false}
          title="Bảo mật dữ liệu là trọng tâm"
          subtitle="Định hướng phát triển Addressify nhấn mạnh vào việc xây dựng niềm tin với chủ shop. Chính sách bảo mật phản ánh cam kết và quy trình chúng tôi đang triển khai."
        />

        <div className="space-y-8">
          {policies.map((section) => (
            <Card key={section.title} glass padding="lg" className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-100">{section.title}</h2>
              <p className="text-sm leading-7 text-slate-300">{section.content}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link className={buttonVariants({ variant: "secondary", className: "sm:w-auto" })} href="/legal/terms">
            ← Quay lại điều khoản
          </Link>
          <Link className={buttonVariants({ variant: "secondary", className: "sm:w-auto" })} href="/contact">
            Liên hệ bộ phận bảo mật →
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
