'use client'

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/buttonVariants";
import { useState, FormEvent } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderVolume: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setStatus({
          type: 'success',
          message: 'Cảm ơn bạn! Yêu cầu tư vấn đã được gửi thành công. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.',
        })
        // Reset form
        setFormData({
          name: '',
          email: '',
          orderVolume: '',
          message: '',
        })
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
        })
      }
    } catch (error) {
      console.error('Submit error:', error)
      setStatus({
        type: 'error',
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-20 text-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Hỗ trợ & Tư vấn</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Kết nối với đội Addressify</h1>
          <p className="mt-4 text-base text-slate-300">
            Chúng tôi đồng hành cùng chủ shop trong quá trình chuẩn hóa địa chỉ, tối ưu vận chuyển và mở rộng đa kênh.
          </p>
        </div>

        <Card glass padding="lg" className="space-y-6">
          {/* Status Messages */}
          {status.type && (
            <div className={`rounded-2xl p-4 text-sm ${
              status.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Họ & tên</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                  placeholder="Nguyễn Thị Hoa"
                  type="text"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                  placeholder="contact@shop.vn"
                  type="email"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Số lượng đơn/ngày</label>
              <input
                name="orderVolume"
                value={formData.orderVolume}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                placeholder="Ví dụ: 150"
                type="text"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Nội dung cần hỗ trợ</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-2 h-32 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                placeholder="Mô tả nhanh bài toán vận hành hoặc yêu cầu tích hợp của bạn..."
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button 
                type="submit"
                disabled={isLoading}
                className={buttonVariants({ className: isLoading ? 'opacity-50 cursor-not-allowed' : '' })}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Đang gửi...
                  </>
                ) : (
                  'Gửi yêu cầu tư vấn'
                )}
              </button>
              <Link className={buttonVariants({ variant: "secondary", className: "sm:w-auto" })} href="/demo">
                Xem demo ngay
              </Link>
            </div>
          </form>
        </Card>

        <Card padding="lg" className="grid gap-6 bg-slate-950/60 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Hotline</h2>
            <p className="mt-2 text-sm text-slate-100">0987 939 605</p>
            <p className="text-xs text-slate-400">Hỗ trợ 8:00 - 21:00 mỗi ngày</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Email</h2>
            <p className="mt-2 text-sm text-slate-100">cuong.vhcc@gmail.com</p>
            <p className="text-xs text-slate-400">Phản hồi trong vòng 12h</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Văn phòng</h2>
            <p className="mt-2 text-sm text-slate-100">Hồ Chí Minh, Việt Nam</p>
            <p className="text-xs text-slate-400">Vui lòng hẹn lịch trước khi ghé</p>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Bằng việc gửi thông tin, bạn đồng ý với <Link className="text-sky-300 hover:text-sky-200" href="#">điều khoản sử dụng</Link> và <Link className="text-sky-300 hover:text-sky-200" href="#">chính sách bảo mật</Link> của Addressify.
        </p>
      </div>
    </div>
  );
}
