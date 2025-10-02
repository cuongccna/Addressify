"use client";

import React, { useMemo, useState, type FormEvent, type ChangeEvent } from "react";

import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/buttonVariants";
import { cn } from "@/utils/cn";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

type AggregatorResponse = {
  success: boolean;
  data?: {
    ghn?: { quotes?: Array<{ fee: { total: number }; service: { shortName: string; name: string } }>; failures?: Array<{ error: string }> ; error?: string };
    ghtk?: { quote?: { total: number; vatFee?: number }; leadtime?: { estimatedDays?: number | null }; warnings?: Array<{ message: string }> ; error?: string };
    vtp?: { quote?: { total: number; expectedDeliveryDays?: number | null }; error?: string };
  };
  message?: string;
  cache?: "HIT" | "MISS";
};

const defaults = {
  // Common
  weightInGrams: "1000",
  lengthInCm: "20",
  widthInCm: "15",
  heightInCm: "10",
  insuranceValue: "1000000",
  codAmount: "0",
  // GHN
  fromDistrictId: "1451",
  fromWardCode: "20608",
  toDistrictId: "1447",
  toWardCode: "200101",
  // GHTK
  pickProvince: "TP. Hồ Chí Minh",
  pickDistrict: "Quận 1",
  pickAddress: "19 Nguyễn Trãi",
  province: "Hà Nội",
  district: "Quận Hoàn Kiếm",
  address: "25 Lý Thái Tổ",
  // VTP
  senderDistrictId: "1451",
  receiverDistrictId: "1447"
};

type FormState = typeof defaults;

export function LiveComparisonDemo() {
  const [form, setForm] = useState<FormState>(defaults);
  const [result, setResult] = useState<AggregatorResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = useMemo(() => Number(form.weightInGrams) > 0, [form.weightInGrams]);

  const onChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        // Common
        weightInGrams: Number(form.weightInGrams),
        lengthInCm: form.lengthInCm.trim() ? Number(form.lengthInCm) : undefined,
        widthInCm: form.widthInCm.trim() ? Number(form.widthInCm) : undefined,
        heightInCm: form.heightInCm.trim() ? Number(form.heightInCm) : undefined,
        insuranceValue: form.insuranceValue.trim() ? Number(form.insuranceValue) : undefined,
        codAmount: form.codAmount.trim() ? Number(form.codAmount) : undefined,
        // GHN
        fromDistrictId: Number(form.fromDistrictId),
        fromWardCode: form.fromWardCode.trim() || undefined,
        toDistrictId: Number(form.toDistrictId),
        toWardCode: form.toWardCode.trim() || undefined,
        // GHTK
        pickProvince: form.pickProvince.trim(),
        pickDistrict: form.pickDistrict.trim(),
        pickAddress: form.pickAddress.trim(),
        province: form.province.trim(),
        district: form.district.trim(),
        address: form.address.trim(),
        includeLeadtime: true,
        // VTP
        senderDistrictId: Number(form.senderDistrictId),
        receiverDistrictId: Number(form.receiverDistrictId)
      };

      const res = await fetch("/api/shipping/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data: AggregatorResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message ?? `Yêu cầu thất bại với mã ${res.status}`);
      }
      setResult(data.data ?? null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể truy vấn aggregator";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="space-y-8" padding="lg" glass>
      <div>
        <h3 className="text-xl font-semibold text-white">So sánh tổng hợp (GHN • GHTK • VTP)</h3>
        <p className="mt-2 text-sm text-slate-300">
          Gửi một lần, lấy kết quả từ 3 nhà vận chuyển. Bạn có thể chỉnh thông tin gợi ý sẵn bên dưới rồi nhấn
          &ldquo;Lấy báo giá tổng hợp&rdquo;.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Thông tin bưu kiện</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input label="Cân nặng (gram)" value={form.weightInGrams} onChange={onChange("weightInGrams")} required />
              <Input label="Dài (cm)" value={form.lengthInCm} onChange={onChange("lengthInCm")} />
              <Input label="Rộng (cm)" value={form.widthInCm} onChange={onChange("widthInCm")} />
              <Input label="Cao (cm)" value={form.heightInCm} onChange={onChange("heightInCm")} />
              <Input label="Khai giá (VND)" value={form.insuranceValue} onChange={onChange("insuranceValue")} />
              <Input label="COD (VND)" value={form.codAmount} onChange={onChange("codAmount")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="GHN From District ID" value={form.fromDistrictId} onChange={onChange("fromDistrictId")} />
            <Input label="GHN From Ward Code" value={form.fromWardCode} onChange={onChange("fromWardCode")} />
            <Input label="GHN To District ID" value={form.toDistrictId} onChange={onChange("toDistrictId")} />
            <Input label="GHN To Ward Code" value={form.toWardCode} onChange={onChange("toWardCode")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="GHTK Tỉnh/Thành gửi" value={form.pickProvince} onChange={onChange("pickProvince")} />
            <Input label="GHTK Quận/Huyện gửi" value={form.pickDistrict} onChange={onChange("pickDistrict")} />
            <Input label="GHTK Địa chỉ lấy" value={form.pickAddress} onChange={onChange("pickAddress")} />
            <Input label="GHTK Tỉnh/Thành nhận" value={form.province} onChange={onChange("province")} />
            <Input label="GHTK Quận/Huyện nhận" value={form.district} onChange={onChange("district")} />
            <Input label="GHTK Địa chỉ giao" value={form.address} onChange={onChange("address")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="VTP Sender District ID" value={form.senderDistrictId} onChange={onChange("senderDistrictId")} />
            <Input label="VTP Receiver District ID" value={form.receiverDistrictId} onChange={onChange("receiverDistrictId")} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className={buttonVariants({
                className: cn("w-full text-center sm:w-auto", "disabled:cursor-not-allowed disabled:opacity-50")
              })}
            >
              {isLoading ? "Đang truy vấn..." : "Lấy báo giá tổng hợp"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
          )}

          {!error && !isLoading && !result && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
              Nhập thông tin ở khối bên trái và nhấn &ldquo;Lấy báo giá tổng hợp&rdquo; để xem so sánh 3 nhà vận chuyển.
            </div>
          )}

          {isLoading && (
            <div className="rounded-2xl border border-sky-500/40 bg-sky-500/10 p-6 text-sm text-sky-200">Đang truy vấn dữ liệu aggregator...</div>
          )}

          {result && (
            <div className="grid gap-4 sm:grid-cols-3">
              <ProviderPanel
                title="GHN"
                color="sky"
                content={() => {
                  if (result.ghn?.error) return <p className="text-sm text-sky-100">{result.ghn.error}</p>;
                  const quotes = result.ghn?.quotes ?? [];
                  if (quotes.length === 0) return <p className="text-sm text-slate-300">Không có dữ liệu.</p>;
                  const best = quotes.reduce((min, q) => (q.fee.total < min.fee.total ? q : min), quotes[0]!);
                  return (
                    <div className="space-y-2 text-sm text-slate-200">
                      <p className="text-lg font-semibold text-sky-300">{currency.format(best.fee.total)}</p>
                      <p className="text-xs text-slate-400">Dịch vụ tốt nhất: {best.service.name}</p>
                      {quotes.length > 1 && <p className="text-xs text-slate-500">({quotes.length} lựa chọn)</p>}
                    </div>
                  );
                }}
              />

              <ProviderPanel
                title="GHTK"
                color="emerald"
                content={() => {
                  if (result.ghtk?.error) return <p className="text-sm text-emerald-100">{result.ghtk.error}</p>;
                  const q = result.ghtk?.quote;
                  if (!q) return <p className="text-sm text-slate-300">Không có dữ liệu.</p>;
                  const days = result.ghtk?.leadtime?.estimatedDays;
                  return (
                    <div className="space-y-2 text-sm text-slate-200">
                      <p className="text-lg font-semibold text-emerald-300">{currency.format(q.total)}</p>
                      {days != null && <p className="text-xs text-slate-400">Ước tính: {days} ngày</p>}
                    </div>
                  );
                }}
              />

              <ProviderPanel
                title="VTP"
                color="purple"
                content={() => {
                  if (result.vtp?.error) return <p className="text-sm text-purple-100">{result.vtp.error}</p>;
                  const q = result.vtp?.quote;
                  if (!q) return <p className="text-sm text-slate-300">Không có dữ liệu.</p>;
                  const days = q.expectedDeliveryDays;
                  return (
                    <div className="space-y-2 text-sm text-slate-200">
                      <p className="text-lg font-semibold text-purple-300">{currency.format(q.total)}</p>
                      {days != null && <p className="text-xs text-slate-400">Ước tính: {days} ngày</p>}
                    </div>
                  );
                }}
              />
            </div>
          )}
        </div>
      </form>
    </Card>
  );
}

function Input({ label, value, onChange, required }: { label: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; required?: boolean }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
        {label}
        {required && <span className="text-red-400">*</span>}
      </span>
      <input
        value={value}
        onChange={onChange}
        className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/50"
      />
    </label>
  );
}

function ProviderPanel({ title, color, content }: { title: string; color: "sky" | "emerald" | "purple"; content: () => React.ReactNode }) {
  const border = color === "sky" ? "border-sky-500/40" : color === "emerald" ? "border-emerald-500/40" : "border-purple-500/40";
  const bg = color === "sky" ? "bg-sky-500/10" : color === "emerald" ? "bg-emerald-500/10" : "bg-purple-500/10";
  const titleColor = color === "sky" ? "text-sky-200" : color === "emerald" ? "text-emerald-200" : "text-purple-200";
  return (
    <Card className={cn("space-y-3", border, bg)} padding="md">
      <h4 className={cn("text-sm font-semibold uppercase tracking-wide", titleColor)}>{title}</h4>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4">{content()}</div>
    </Card>
  );
}
