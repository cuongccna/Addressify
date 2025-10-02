import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/buttonVariants";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-20 text-slate-50">
      <Card className="w-full max-w-xl space-y-6 bg-slate-900/70 text-left" glass padding="lg">
        <div className="space-y-3 text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Trải nghiệm sớm</p>
          <h1 className="text-3xl font-semibold tracking-tight">Đăng ký dùng thử Addressify</h1>
          <p className="text-sm text-slate-300">
            Nhập email của bạn, chúng tôi sẽ liên hệ trong vòng 24h để kích hoạt tài khoản và hướng dẫn onboard chi tiết.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr,auto]">
          <input
            aria-label="Email"
            className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            placeholder="you@shopname.vn"
            type="email"
          />
          <button className={buttonVariants({})}>Gửi yêu cầu</button>
        </div>
        <p className="text-xs text-sky-200">
          Ưu tiên các shop xử lý &gt; 100 đơn/ngày. Đăng ký miễn phí, không ràng buộc.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>Đã có tài khoản?</span>
          <Link className="text-sky-300 transition hover:text-sky-200" href="/auth/sign-in">
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  );
}
