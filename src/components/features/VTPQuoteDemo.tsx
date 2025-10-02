"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/buttonVariants";
import type { VTPFeeQuotation } from "@/lib/shipping-apis";
import { cn } from "@/utils/cn";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND"
});

const defaultFormState = {
  senderDistrictId: "1451", // Quận 1, TP.HCM
  senderWardCode: "20608",
  receiverDistrictId: "1447", // Quận Ba Đình, Hà Nội
  receiverWardCode: "200101",
  weightInGrams: "1000",
  lengthInCm: "20",
  widthInCm: "15",
  heightInCm: "10",
  insuranceValue: "500000",
  codAmount: "0",
  serviceCode: ""
};

type FormState = typeof defaultFormState;

interface QuoteResponse {
  success: boolean;
  quote: VTPFeeQuotation;
  message?: string;
}

export function VTPQuoteDemo() {
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [quote, setQuote] = useState<VTPFeeQuotation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const isFormValid = useMemo(() => {
    const required = [
      formState.senderDistrictId,
      formState.receiverDistrictId,
      formState.weightInGrams
    ];
    if (required.some((v) => v.trim() === "")) return false;
    const mustPositive = [
      Number(formState.senderDistrictId),
      Number(formState.receiverDistrictId),
      Number(formState.weightInGrams)
    ];
    return mustPositive.every((n) => Number.isFinite(n) && n > 0);
  }, [
    formState.senderDistrictId,
    formState.receiverDistrictId,
    formState.weightInGrams
  ]);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormState((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleReset = () => {
    setFormState(defaultFormState);
    setQuote(null);
    setError(null);
    setIsDirty(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        senderDistrictId: Number(formState.senderDistrictId),
        senderWardCode: formState.senderWardCode.trim() || undefined,
        receiverDistrictId: Number(formState.receiverDistrictId),
        receiverWardCode: formState.receiverWardCode.trim() || undefined,
        weightInGrams: Number(formState.weightInGrams),
        lengthInCm: formState.lengthInCm.trim() ? Number(formState.lengthInCm) : undefined,
        widthInCm: formState.widthInCm.trim() ? Number(formState.widthInCm) : undefined,
        heightInCm: formState.heightInCm.trim() ? Number(formState.heightInCm) : undefined,
        codAmount: formState.codAmount.trim() ? Number(formState.codAmount) : undefined,
        insuranceValue: formState.insuranceValue.trim()
          ? Number(formState.insuranceValue)
          : undefined,
        serviceCode: formState.serviceCode.trim() || undefined
      };

      const response = await fetch("/api/shipping/vtp/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data: QuoteResponse = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message ?? `Yêu cầu thất bại với mã ${response.status}`);
      }

      setQuote(data.quote);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Không thể lấy dữ liệu từ VTP";
      setError(message);
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="space-y-8" padding="lg" glass>
      <div>
        <h3 className="text-xl font-semibold text-white">Demo báo giá VTP (Viettel Post) realtime</h3>
        <p className="mt-2 text-sm text-slate-300">
          Nhập mã quận/huyện, phường/xã và thông tin bưu kiện để truy vấn phí từ Viettel Post. Cần thiết lập
          token thật trong `.env.local`.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Sender District ID"
              value={formState.senderDistrictId}
              onChange={handleChange("senderDistrictId")}
              placeholder="VD: 1451"
              required
            />
            <InputField
              label="Sender Ward Code"
              value={formState.senderWardCode}
              onChange={handleChange("senderWardCode")}
              placeholder="VD: 20608"
            />
            <InputField
              label="Receiver District ID"
              value={formState.receiverDistrictId}
              onChange={handleChange("receiverDistrictId")}
              placeholder="VD: 1447"
              required
            />
            <InputField
              label="Receiver Ward Code"
              value={formState.receiverWardCode}
              onChange={handleChange("receiverWardCode")}
              placeholder="VD: 200101"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InputField
              label="Cân nặng (gram)"
              value={formState.weightInGrams}
              onChange={handleChange("weightInGrams")}
              placeholder="VD: 1000"
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
              placeholder="VD: 0"
            />
            <InputField
              label="Service Code"
              value={formState.serviceCode}
              onChange={handleChange("serviceCode")}
              placeholder="VD: VTK_ECO"
            />
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
              {isLoading ? "Đang truy vấn..." : "Lấy báo giá VTP"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading || (!isDirty && !quote)}
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
            * Hệ thống áp dụng rate limit 20 request/phút mỗi IP (có thể cấu hình bằng biến môi trường `VTP_QUOTE_RATE_LIMIT`).
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {!error && !isLoading && !quote && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
              Nhập thông tin bưu kiện và nhấn &ldquo;Lấy báo giá&rdquo; để xem bảng phí từ Viettel Post.
            </div>
          )}

          {isLoading && (
            <div className="rounded-2xl border border-purple-500/40 bg-purple-500/10 p-6 text-sm text-purple-200">
              Đang truy vấn dữ liệu từ VTP...
            </div>
          )}

          {quote && (
            <Card className="space-y-3 border-purple-500/40 bg-purple-500/10" padding="md">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-200">
                Phí vận chuyển
              </h4>
              <div className="rounded-2xl border border-purple-500/30 bg-slate-950/60 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Tổng phí</p>
                    {quote.serviceCode && (
                      <p className="text-xs uppercase tracking-wide text-slate-400">Mã dịch vụ: {quote.serviceCode}</p>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-purple-300">
                    {currencyFormatter.format(quote.total)}
                  </p>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
                  <span>Phí chính: {currencyFormatter.format(quote.mainFee)}</span>
                  <span>Phí COD: {currencyFormatter.format(quote.codFee)}</span>
                  <span>Phí bảo hiểm: {currencyFormatter.format(quote.insuranceFee)}</span>
                  <span>Phụ phí nhiên liệu: {currencyFormatter.format(quote.fuelSurcharge)}</span>
                  <span>Phí vùng xa: {currencyFormatter.format(quote.remoteAreasFee)}</span>
                  <span>VAT: {currencyFormatter.format(quote.vatFee)}</span>
                </div>
                {quote.expectedDeliveryDays != null && (
                  <p className="mt-3 text-xs text-slate-400">
                    Dự kiến giao trong: {quote.expectedDeliveryDays} ngày
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </form>
    </Card>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  helper?: string;
  required?: boolean;
}

function InputField({ label, value, onChange, placeholder, helper, required }: InputFieldProps) {
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
        className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
      />
      {helper && <span className="text-xs text-slate-500">{helper}</span>}
    </label>
  );
}
