import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/buttonVariants";
import { LiveComparisonDemo } from "@/components/features/LiveComparisonDemo";

const demoHighlights = [
  "Theo dõi trạng thái đơn hàng realtime",
  "So sánh phí ship giữa GHN, GHTK, VTP",
  "Chuẩn hóa địa chỉ tự động bằng AI"
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-20 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Product Demo</p>
          <h1 className="text-4xl font-semibold tracking-tight">Khám phá Addressify trong 3 phút</h1>
          <p className="text-base text-slate-300">
            Video demo đang được sản xuất. Trong lúc chờ, bạn có thể xem qua các tính năng nổi bật và đặt lịch demo 1-1 với đội ngũ của chúng tôi.
          </p>
        </div>

        <Card glass padding="lg" className="space-y-6">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
            <div className="flex h-full w-full items-center justify-center text-slate-500">
              Video demo sẽ xuất hiện tại đây
            </div>
          </div>
          <ul className="grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
            {demoHighlights.map((item) => (
              <li key={item} className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">{item}</li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className={buttonVariants({ className: "w-full text-center sm:w-auto" })} href="/auth/sign-up">
              Đăng ký dùng thử
            </Link>
            <Link className={buttonVariants({ variant: "secondary", className: "w-full text-center sm:w-auto" })} href="/contact">
              Đặt lịch demo 1-1
            </Link>
          </div>
        </Card>

  <LiveComparisonDemo />

        <Card padding="lg" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100">Cần demo cho team của bạn?</h2>
          <p className="text-sm text-slate-300">
            Chúng tôi sẽ liên hệ trong vòng 24h để tùy chỉnh demo dựa trên quy trình vận hành của cửa hàng.
          </p>
          <Link className={buttonVariants({ variant: "white", className: "w-full text-center sm:w-auto" })} href="/contact">
            Bắt đầu trao đổi
          </Link>
        </Card>
      </div>
    </div>
  );
}
