import Link from "next/link";
import { Metadata } from "next";
import { buttonVariants } from "@/components/ui/buttonVariants";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng Addressify",
  description:
    "Điều khoản sử dụng của Addressify – nền tảng Address Intelligence giúp chủ shop Việt Nam chuẩn hóa địa chỉ, tối ưu chi phí vận chuyển và mở rộng đa kênh.",
};

const sections = [
  {
    title: "1. Mục tiêu dịch vụ",
    content:
      "Addressify cam kết mang lại giải pháp quản trị địa chỉ và vận chuyển tối ưu cho chủ shop online Việt Nam. Chúng tôi sử dụng AI, dữ liệu vận chuyển real-time và các kết nối API chính thức để đảm bảo độ chính xác, tốc độ và khả năng mở rộng cho mọi quy mô cửa hàng.",
  },
  {
    title: "2. Phạm vi sử dụng",
    content:
      "Người dùng được phép truy cập Addressify để chuẩn hóa địa chỉ, quản lý đơn hàng, so sánh phí ship và khai thác các tiện ích kinh doanh đi kèm. Việc tích hợp các API bên thứ ba phải tuân thủ điều khoản của đối tác cùng với điều khoản của Addressify.",
  },
  {
    title: "3. Trách nhiệm người dùng",
    content:
      "Bạn có trách nhiệm cung cấp dữ liệu chính xác, bảo mật tài khoản và không lợi dụng nền tảng cho các hoạt động vi phạm pháp luật Việt Nam. Mọi hành vi gây tổn hại đến hệ thống hoặc dữ liệu bên thứ ba đều bị nghiêm cấm.",
  },
  {
    title: "4. Quyền sở hữu & bảo mật",
    content:
      "Mọi thuật toán, thiết kế, dữ liệu và nhãn hiệu liên quan đến Addressify thuộc quyền sở hữu của công ty. Chúng tôi áp dụng tiêu chuẩn bảo mật cao, mã hóa dữ liệu và tuân thủ các quy định bảo vệ dữ liệu tại Việt Nam và quốc tế.",
  },
  {
    title: "5. Cập nhật điều khoản",
    content:
      "Các điều khoản có thể được cập nhật để phản ánh sự thay đổi của sản phẩm hoặc quy định pháp lý. Chúng tôi sẽ thông báo trước tối thiểu 7 ngày làm việc. Việc tiếp tục sử dụng sau thời điểm cập nhật đồng nghĩa bạn chấp nhận điều khoản mới.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-20">
        <header className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Pháp lý</p>
          <h1 className="text-4xl font-semibold tracking-tight">Điều khoản sử dụng Addressify</h1>
          <p className="text-base text-slate-300">
            Vui lòng đọc kỹ trước khi sử dụng nền tảng Addressify. Điều khoản giúp bảo vệ quyền lợi của cả chủ shop lẫn nền tảng trong hành trình tối ưu vận hành.
          </p>
        </header>

        <SectionHeader
          centered={false}
          title="Cam kết phát triển bền vững"
          subtitle="Chúng tôi xây dựng Addressify với tầm nhìn dẫn đầu thị trường Address Intelligence Đông Nam Á. Điều khoản đảm bảo bạn nhận được dịch vụ ổn định, bảo mật và tuân thủ pháp luật."
        />

        <div className="space-y-8">
          {sections.map((section) => (
            <Card key={section.title} glass padding="lg" className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-100">{section.title}</h2>
              <p className="text-sm leading-7 text-slate-300">{section.content}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link className={buttonVariants({ variant: "secondary", className: "sm:w-auto" })} href="/">
            ← Quay lại trang chủ
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className={buttonVariants({ variant: "secondary", className: "sm:w-auto" })} href="/legal/privacy">
              Xem chính sách bảo mật →
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
