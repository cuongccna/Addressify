"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/buttonVariants";
import type { GHNFeeQuotation, GHNServiceDescription } from "@/lib/shipping-apis";
import { cn } from "@/utils/cn";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND"
});

const defaultFormState = {
  fromDistrictId: "1451", // Quận 1, TP.HCM
  fromWardCode: "20608",
  toDistrictId: "1447", // Quận Ba Đình, Hà Nội
  toWardCode: "200101",
  weightInGrams: "1000",
  lengthInCm: "20",
  widthInCm: "15",
  heightInCm: "10",
  insuranceValue: "1000000",
  couponCode: ""
};

type QuoteFormState = typeof defaultFormState;

interface QuoteResponse {
  success: boolean;
  quotes: Array<{
    service: GHNServiceDescription;
    fee: GHNFeeQuotation;
  }>;
  failures: Array<{
    service: GHNServiceDescription;
    error: string;
  }>;
  message?: string;
}

export function GHNQuoteDemo() {
  const [formState, setFormState] = useState<QuoteFormState>(defaultFormState);
  const [quotes, setQuotes] = useState<QuoteResponse["quotes"]>([]);
  const [failures, setFailures] = useState<QuoteResponse["failures"]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const isFormValid = useMemo(() => {
    const requiredNumeric = [
      formState.fromDistrictId,
      formState.toDistrictId,
      formState.toWardCode,
      formState.weightInGrams
    ];

    const anyEmpty = requiredNumeric.some((value) => value.trim() === "");
    if (anyEmpty) {
      return false;
    }

    const mustBePositive = [
      Number(formState.fromDistrictId),
      Number(formState.toDistrictId),
      Number(formState.weightInGrams)
    ];

    return mustBePositive.every((value) => Number.isFinite(value) && value > 0);
  }, [formState.fromDistrictId, formState.toDistrictId, formState.weightInGrams, formState.toWardCode]);

  const handleChange = (field: keyof QuoteFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleReset = () => {
    setFormState(defaultFormState);
    setQuotes([]);
    setFailures([]);
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
        fromDistrictId: Number(formState.fromDistrictId),
        fromWardCode: formState.fromWardCode.trim() || undefined,
        toDistrictId: Number(formState.toDistrictId),
        toWardCode: formState.toWardCode.trim(),
        weightInGrams: Number(formState.weightInGrams),
        lengthInCm: formState.lengthInCm.trim() ? Number(formState.lengthInCm) : undefined,
        widthInCm: formState.widthInCm.trim() ? Number(formState.widthInCm) : undefined,
        heightInCm: formState.heightInCm.trim() ? Number(formState.heightInCm) : undefined,
        insuranceValue: formState.insuranceValue.trim() ? Number(formState.insuranceValue) : undefined,
        couponCode: formState.couponCode.trim() || undefined
      };

      const response = await fetch("/api/shipping/ghn/quote", {
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

      setQuotes(data.quotes);
      setFailures(data.failures);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Không thể lấy dữ liệu từ GHN";
      setError(message);
      setQuotes([]);
      setFailures([]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasResults = quotes.length > 0 || failures.length > 0;

  return (
    <Card className="space-y-8" padding="lg" glass>
      <div>
        <h3 className="text-xl font-semibold text-white">Demo báo giá GHN realtime</h3>
        <p className="mt-2 text-sm text-slate-300">
          Nhập mã quận/huyện, phường/xã và khối lượng bưu kiện để truy vấn trực tiếp phí giao hàng từ GHN.
          Sử dụng token thật trong `.env.local` để nhận dữ liệu chính xác theo tài khoản của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="From District ID"
              value={formState.fromDistrictId}
              onChange={handleChange("fromDistrictId")}
              placeholder="VD: 1451"
              helper="Mã quận/huyện lấy từ GHN"
              required
            />
            <InputField
              label="From Ward Code"
              value={formState.fromWardCode}
              onChange={handleChange("fromWardCode")}
              placeholder="VD: 20608"
              helper="Tùy chọn: mã phường gửi hàng"
            />
            <InputField
              label="To District ID"
              value={formState.toDistrictId}
              onChange={handleChange("toDistrictId")}
              placeholder="VD: 1447"
              helper="Quận/huyện nhận"
              required
            />
            <InputField
              label="To Ward Code"
              value={formState.toWardCode}
              onChange={handleChange("toWardCode")}
              placeholder="VD: 200101"
              helper="Phường/xã nhận"
              required
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
              placeholder="VD: 1000000"
            />
            <InputField
              label="Coupon"
              value={formState.couponCode}
              onChange={handleChange("couponCode")}
              placeholder="Mã giảm giá nếu có"
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
              {isLoading ? "Đang truy vấn..." : "Lấy báo giá GHN"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading || (!isDirty && !hasResults)}
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
            * Các mã địa phương cần khớp với danh mục của GHN. Hệ thống đã áp dụng rate limit 20 request/phút mỗi IP.
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {!error && !isLoading && !hasResults && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
              Nhập thông tin bưu kiện và nhấn &ldquo;Lấy báo giá&rdquo; để xem bảng phí. Nếu chưa có token thật, bạn vẫn có thể gửi request để kiểm tra thông báo lỗi từ GHN.
            </div>
          )}

          {isLoading && (
            <div className="rounded-2xl border border-sky-500/40 bg-sky-500/10 p-6 text-sm text-sky-200">
              Đang truy vấn dữ liệu từ GHN...
            </div>
          )}

          {quotes.length > 0 && (
            <Card className="space-y-3 border-sky-500/40 bg-sky-500/10" padding="md">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-sky-200">
                Kết quả báo giá ({quotes.length})
              </h4>
              <div className="space-y-3">
                {quotes.map(({ service, fee }) => (
                  <div key={`${service.serviceId}-${service.serviceTypeId}`} className="rounded-2xl border border-sky-500/40 bg-slate-950/60 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{service.name}</p>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          {service.shortName} • ID: {service.serviceId}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-sky-300">
                        {currencyFormatter.format(fee.total)}
                      </p>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
                      <span>Phí dịch vụ: {currencyFormatter.format(fee.serviceFee)}</span>
                      <span>Phí COD: {currencyFormatter.format(fee.codFee)}</span>
                      <span>Phí bảo hiểm: {currencyFormatter.format(fee.insuranceFee)}</span>
                      <span>Giảm giá: {currencyFormatter.format(fee.discount)}</span>
                    </div>
                    {fee.expectedDeliveryTime && (
                      <p className="mt-3 text-xs text-slate-400">
                        Dự kiến giao: {new Date(fee.expectedDeliveryTime).toLocaleString("vi-VN")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {failures.length > 0 && (
            <Card className="space-y-3 border-amber-500/40 bg-amber-500/10" padding="md">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-200">
                Không thể báo giá ({failures.length})
              </h4>
              <div className="space-y-3 text-xs text-amber-100">
                {failures.map(({ service, error: failureMessage }) => (
                  <div key={`${service.serviceId}-${service.serviceTypeId}`} className="rounded-2xl border border-amber-500/30 bg-slate-950/50 p-4">
                    <p className="font-semibold text-amber-100">{service.name}</p>
                    <p className="mt-1 text-amber-200">{failureMessage}</p>
                  </div>
                ))}
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
        className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/50"
      />
      {helper && <span className="text-xs text-slate-500">{helper}</span>}
    </label>
  );
}
