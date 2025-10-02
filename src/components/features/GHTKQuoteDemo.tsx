"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/buttonVariants";
import type { GHTKFeeQuotation, GHTKLeadtimeEstimate } from "@/lib/shipping-apis";
import type { GHTKQuoteWarning } from "@/lib/shipping-apis/ghtkQuoteService";
import { cn } from "@/utils/cn";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND"
});

const defaultFormState = {
  pickProvince: "TP. Hồ Chí Minh",
  pickDistrict: "Quận 1",
  pickWard: "Phường Bến Nghé",
  pickAddress: "19 Nguyễn Trãi",
  province: "Hà Nội",
  district: "Quận Hoàn Kiếm",
  ward: "Phường Hàng Bạc",
  address: "25 Lý Thái Tổ",
  weightInGrams: "800",
  insuranceValue: "500000",
  codAmount: "0",
  transport: "road",
  lengthInCm: "20",
  widthInCm: "15",
  heightInCm: "10"
};

type GhtkFormState = typeof defaultFormState;

interface QuoteResponse {
  success: boolean;
  quote: GHTKFeeQuotation;
  leadtime: GHTKLeadtimeEstimate | null;
  warnings: GHTKQuoteWarning[];
  message?: string;
}

export function GHTKQuoteDemo() {
  const [formState, setFormState] = useState<GhtkFormState>(defaultFormState);
  const [quote, setQuote] = useState<GHTKFeeQuotation | null>(null);
  const [leadtime, setLeadtime] = useState<GHTKLeadtimeEstimate | null>(null);
  const [warnings, setWarnings] = useState<GHTKQuoteWarning[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const isFormValid = useMemo(() => {
    const required = [
      formState.pickProvince,
      formState.pickDistrict,
      formState.pickAddress,
      formState.province,
      formState.district,
      formState.address,
      formState.weightInGrams
    ];

    if (required.some((value) => value.trim() === "")) {
      return false;
    }

    return Number(formState.weightInGrams) > 0;
  }, [
    formState.address,
    formState.district,
    formState.pickAddress,
    formState.pickDistrict,
    formState.pickProvince,
    formState.province,
    formState.weightInGrams
  ]);

  const handleChange = (field: keyof GhtkFormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value } = event.target;
    setFormState((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleReset = () => {
    setFormState(defaultFormState);
    setQuote(null);
    setLeadtime(null);
    setWarnings([]);
    setError(null);
    setIsDirty(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        pickProvince: formState.pickProvince.trim(),
        pickDistrict: formState.pickDistrict.trim(),
        pickWard: formState.pickWard.trim() ? formState.pickWard.trim() : undefined,
        pickAddress: formState.pickAddress.trim(),
        province: formState.province.trim(),
        district: formState.district.trim(),
        ward: formState.ward.trim() ? formState.ward.trim() : undefined,
        address: formState.address.trim(),
        weightInGrams: Number(formState.weightInGrams),
        insuranceValue: formState.insuranceValue.trim()
          ? Number(formState.insuranceValue)
          : undefined,
        codAmount: formState.codAmount.trim() ? Number(formState.codAmount) : undefined,
        transport: formState.transport.trim() ? formState.transport.trim() : undefined,
        lengthInCm: formState.lengthInCm.trim() ? Number(formState.lengthInCm) : undefined,
        widthInCm: formState.widthInCm.trim() ? Number(formState.widthInCm) : undefined,
        heightInCm: formState.heightInCm.trim() ? Number(formState.heightInCm) : undefined,
        includeLeadtime: true
      };

      const response = await fetch("/api/shipping/ghtk/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data: QuoteResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? `Yêu cầu thất bại với mã ${response.status}`);
      }

      setQuote(data.quote);
      setLeadtime(data.leadtime ?? null);
      setWarnings(data.warnings ?? []);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Không thể lấy dữ liệu từ GHTK";
      setError(message);
      setQuote(null);
      setLeadtime(null);
      setWarnings([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="space-y-8" padding="lg" glass>
      <div>
        <h3 className="text-xl font-semibold text-white">Demo báo giá GHTK realtime</h3>
        <p className="mt-2 text-sm text-slate-300">
          Nhập thông tin lấy hàng và giao hàng để truy vấn phí vận chuyển trực tiếp từ Giao Hàng Tiết Kiệm.
          Demo này sử dụng token thật trong `.env.local` để tính phí chính xác theo hợp đồng của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Thông tin lấy hàng
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Tỉnh/Thành gửi"
                value={formState.pickProvince}
                onChange={handleChange("pickProvince")}
                placeholder="VD: TP. Hồ Chí Minh"
                required
              />
              <InputField
                label="Quận/Huyện gửi"
                value={formState.pickDistrict}
                onChange={handleChange("pickDistrict")}
                placeholder="VD: Quận 1"
                required
              />
              <InputField
                label="Phường/Xã gửi"
                value={formState.pickWard}
                onChange={handleChange("pickWard")}
                placeholder="VD: Phường Bến Nghé"
              />
              <InputField
                label="Địa chỉ lấy hàng"
                value={formState.pickAddress}
                onChange={handleChange("pickAddress")}
                placeholder="VD: 19 Nguyễn Trãi"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Thông tin giao hàng
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Tỉnh/Thành nhận"
                value={formState.province}
                onChange={handleChange("province")}
                placeholder="VD: Hà Nội"
                required
              />
              <InputField
                label="Quận/Huyện nhận"
                value={formState.district}
                onChange={handleChange("district")}
                placeholder="VD: Quận Hoàn Kiếm"
                required
              />
              <InputField
                label="Phường/Xã nhận"
                value={formState.ward}
                onChange={handleChange("ward")}
                placeholder="VD: Phường Hàng Bạc"
              />
              <InputField
                label="Địa chỉ giao"
                value={formState.address}
                onChange={handleChange("address")}
                placeholder="VD: 25 Lý Thái Tổ"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Thông tin bưu kiện
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InputField
                label="Cân nặng (gram)"
                value={formState.weightInGrams}
                onChange={handleChange("weightInGrams")}
                placeholder="VD: 800"
                required
              />
              <InputField
                label="Dài (cm)"
                value={formState.lengthInCm}
                onChange={handleChange("lengthInCm")}
                placeholder="VD: 20"
              />
              <InputField
                label="Rộng (cm)"
                value={formState.widthInCm}
                onChange={handleChange("widthInCm")}
                placeholder="VD: 15"
              />
              <InputField
                label="Cao (cm)"
                value={formState.heightInCm}
                onChange={handleChange("heightInCm")}
                placeholder="VD: 10"
              />
              <InputField
                label="Khai giá (VND)"
                value={formState.insuranceValue}
                onChange={handleChange("insuranceValue")}
                placeholder="VD: 500000"
              />
              <InputField
                label="Thu hộ COD (VND)"
                value={formState.codAmount}
                onChange={handleChange("codAmount")}
                placeholder="VD: 250000"
              />
              <SelectField
                label="Hình thức vận chuyển"
                value={formState.transport}
                onChange={handleChange("transport")}
              >
                <option value="road">Road (Mặc định)</option>
                <option value="fly">Fly - Chuyển phát nhanh</option>
                <option value="inc">In-city</option>
              </SelectField>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={buttonVariants({
                className: cn(
                  "w-full text-center sm:w-auto",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )
              })}
            >
              {isLoading ? "Đang truy vấn..." : "Lấy báo giá GHTK"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading || (!isDirty && !quote && !leadtime)}
              className={buttonVariants({
                variant: "secondary",
                className: cn(
                  "w-full text-center sm:w-auto",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )
              })}
            >
              Đặt lại demo
            </button>
          </div>

          <p className="text-xs text-slate-400">
            * GHTK yêu cầu tên tỉnh/thành, quận/huyện và địa chỉ khớp với danh mục của họ. Hệ thống áp dụng rate limit {RATE_LIMIT_HINT} request/phút mỗi IP (có thể cấu hình bằng biến môi trường `GHTK_QUOTE_RATE_LIMIT`).
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {!error && !isLoading && !quote && !leadtime && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
              Nhập thông tin bưu kiện, nhấn &ldquo;Lấy báo giá&rdquo; để xem phí ship và thời gian giao dự kiến theo realtime API của GHTK.
              Bạn có thể dùng token sandbox để kiểm thử.
            </div>
          )}

          {isLoading && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-sm text-emerald-200">
              Đang truy vấn dữ liệu từ GHTK...
            </div>
          )}

          {quote && (
            <Card className="space-y-3 border-emerald-500/40 bg-emerald-500/10" padding="md">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                Phí vận chuyển
              </h4>
              <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/60 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Tổng phí</p>
                    {quote.deliveryType && (
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Hình thức: {quote.deliveryType}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-emerald-300">
                    {currencyFormatter.format(quote.total)}
                  </p>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
                  <span>Phí chính: {currencyFormatter.format(quote.shipFee)}</span>
                  <span>Phí bảo hiểm: {currencyFormatter.format(quote.insuranceFee)}</span>
                  <span>Phí COD: {currencyFormatter.format(quote.codFee)}</span>
                  <span>Phí vùng xa: {currencyFormatter.format(quote.remoteAreasFee)}</span>
                  <span>Phí hoàn: {currencyFormatter.format(quote.returnFee)}</span>
                  <span>VAT: {currencyFormatter.format(quote.vatFee)}</span>
                </div>
                {(quote.expectedPickupTime || quote.expectedDeliveryTime) && (
                  <p className="mt-3 text-xs text-slate-400">
                    {quote.expectedPickupTime && (
                      <span>
                        Lấy hàng dự kiến: {new Date(quote.expectedPickupTime).toLocaleString("vi-VN")}
                      </span>
                    )}
                    {quote.expectedPickupTime && quote.expectedDeliveryTime && <span className="mx-2">•</span>}
                    {quote.expectedDeliveryTime && (
                      <span>
                        Giao dự kiến: {new Date(quote.expectedDeliveryTime).toLocaleString("vi-VN")}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </Card>
          )}

          {leadtime && (
            <Card className="space-y-3 border-sky-500/40 bg-sky-500/10" padding="md">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-sky-200">
                Thời gian giao dự kiến
              </h4>
              <div className="space-y-2 text-xs text-slate-200">
                {leadtime.estimatedDays != null && (
                  <p>Thời gian dự kiến: {leadtime.estimatedDays} ngày</p>
                )}
                {leadtime.expectedPickupTime && (
                  <p>Lấy hàng: {new Date(leadtime.expectedPickupTime).toLocaleString("vi-VN")}</p>
                )}
                {leadtime.expectedDeliveryTime && (
                  <p>Giao hàng: {new Date(leadtime.expectedDeliveryTime).toLocaleString("vi-VN")}</p>
                )}
              </div>
            </Card>
          )}

          {warnings.length > 0 && (
            <Card className="space-y-3 border-amber-500/40 bg-amber-500/10" padding="md">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-200">
                Cảnh báo ({warnings.length})
              </h4>
              <ul className="space-y-2 text-xs text-amber-100">
                {warnings.map((warning, index) => (
                  <li key={`${warning.stage}-${index}`} className="rounded-2xl border border-amber-500/30 bg-slate-950/50 p-4">
                    <p className="font-semibold text-amber-100">{warning.stage.toUpperCase()}</p>
                    <p className="mt-1 text-amber-200">{warning.message}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </form>
    </Card>
  );
}

const parsedRateLimit = Number.parseInt(process.env.NEXT_PUBLIC_GHTK_QUOTE_RATE_LIMIT ?? "20", 10);
const RATE_LIMIT_HINT = Number.isNaN(parsedRateLimit) ? 20 : Math.max(1, parsedRateLimit);

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

function InputField({ label, value, onChange, placeholder, required }: InputFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
        {label}
        {required && <span className="text-red-400">*</span>}
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
      />
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}

function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
      >
        {children}
      </select>
    </label>
  );
}
