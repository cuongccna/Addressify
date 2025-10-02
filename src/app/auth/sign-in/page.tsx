import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/buttonVariants";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-20 text-slate-50">
      <Card className="w-full max-w-md space-y-6 bg-slate-900/70 text-center" glass padding="lg">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Sắp ra mắt</p>
          <h1 className="text-3xl font-semibold tracking-tight">Đăng nhập Addressify</h1>
          <p className="text-sm text-slate-300">
            Chúng tôi đang hoàn thiện trải nghiệm đăng nhập liền mạch cho chủ shop. Để thử ngay, vui lòng đăng ký vào danh sách trải nghiệm sớm.
          </p>
        </div>
        <div className="space-y-3">
          <Link className={buttonVariants({ className: "w-full" })} href="/auth/sign-up">
            Tham gia beta
          </Link>
          <Link className={buttonVariants({ variant: "secondary", className: "w-full" })} href="/">
            Về trang chủ
          </Link>
        </div>
      </Card>
    </div>
  );
}
