"use client";

import React, { useMemo, useState } from "react";

import { AddressProcessor } from "@/components/AddressProcessor";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/buttonVariants";
import { cn } from "@/utils/cn";
import type { AddressData } from "@/types/address";

type ProviderQuote = {
  provider: 'GHN' | 'GHTK' | 'VTP';
  amount?: number;
  days?: number | null;
  service?: string;
  error?: string;
};

type AggResponse = {
  success: boolean;
  data?: {
    ghn?: { quote?: { total: number; service_type_id?: number }; leadtime?: { estimatedDays?: number | null }; error?: string };
    ghtk?: { quote?: { total: number }; leadtime?: { estimatedDays?: number | null }; error?: string };
    vtp?: { quote?: { total: number }; leadtime?: { estimatedDays?: number | null }; error?: string };
  };
  message?: string;
};

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function AddressNormalizeAndCompare() {
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [selected, setSelected] = useState<AddressData | null>(null);
  const [sender] = useState({
    pickProvince: "TP. Hồ Chí Minh",
    pickDistrict: "Quận 1",
    pickAddress: "19 Nguyễn Trãi",
    // GHN IDs for sender (Quận 1, TPHCM)
    ghnProvinceId: 202,
    ghnDistrictId: 1454 // Example: Quận 1
  });
  const [weight, setWeight] = useState("1000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<ProviderQuote[]>([]);

  const validCount = useMemo(() => addresses.filter((a) => a.isValid).length, [addresses]);

  const requestQuote = async (addr: AddressData) => {
    setSelected(addr);
    setQuotes([]);
    setError(null);
    setLoading(true);
    
    try {
      // Build payload based on available GHN IDs
      const payload: Record<string, unknown> = {
        weightInGrams: Number(weight) || 1000,
        // GHTK fields (text-based)
        pickProvince: sender.pickProvince,
        pickDistrict: sender.pickDistrict,
        pickAddress: sender.pickAddress,
        province: addr.province,
        district: addr.district,
        address: [addr.ward, addr.district, addr.province].filter(Boolean).join(", ")
      };

      // Debug: Log address data
      console.log('[AddressNormalize] Address GHN IDs:', {
        ghnProvinceId: addr.ghnProvinceId,
        ghnDistrictId: addr.ghnDistrictId,
        ghnWardCode: addr.ghnWardCode,
        ward: addr.ward
      });

      // Add GHN/VTP IDs if available
      if (addr.ghnProvinceId && addr.ghnDistrictId) {
        // GHN fields
        payload.fromDistrictId = sender.ghnDistrictId;
        payload.toDistrictId = addr.ghnDistrictId;
        if (addr.ghnWardCode) {
          payload.toWardCode = addr.ghnWardCode;
          console.log('[AddressNormalize] GHN ward code present:', addr.ghnWardCode);
        } else {
          console.warn('[AddressNormalize] ⚠️ Missing GHN ward code - GHN may not return quote');
        }
        
        // VTP fields (same structure as GHN)
        payload.senderDistrictId = sender.ghnDistrictId;
        payload.receiverDistrictId = addr.ghnDistrictId;
        if (addr.ghnWardCode) {
          payload.receiverWardCode = addr.ghnWardCode;
        }
      }
      
      console.log('[AddressNormalize] Final payload for aggregator:', payload);

      const res = await fetch("/api/shipping/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data: AggResponse = await res.json();
      
      // Debug logging
      console.log('[AddressNormalize] Aggregator response:', {
        success: data.success,
        providers: Object.keys(data.data || {}),
        ghn: data.data?.ghn ? 'present' : 'missing',
        ghtk: data.data?.ghtk ? 'present' : 'missing',
        vtp: data.data?.vtp ? 'present' : 'missing'
      });
      
      if (!res.ok || !data.success) {
        throw new Error(data.message ?? `Request failed (${res.status})`);
      }

      // Parse results from all providers
      const results: ProviderQuote[] = [];

      // GHN - Show ALL services
      if (data.data?.ghn) {
        console.log('[AddressNormalize] GHN data:', data.data.ghn);
        
        const ghnData = data.data.ghn as Record<string, unknown>;
        
        if (ghnData.error) {
          results.push({ provider: 'GHN', error: String(ghnData.error) });
        } else if (ghnData.quotes && Array.isArray(ghnData.quotes)) {
          // GHN returns array of quotes - show ALL
          const ghnQuotes = ghnData.quotes as Array<Record<string, unknown>>;
          if (ghnQuotes.length > 0) {
            for (const quote of ghnQuotes) {
              const fee = quote.fee as Record<string, unknown> | undefined;
              const service = quote.service as Record<string, unknown> | undefined;
              const serviceName = (service?.shortName as string) || (quote.service_name as string) || 'GHN';
              
              results.push({
                provider: `GHN - ${serviceName}`,
                amount: (fee?.total as number) || (quote.total as number),
                service: serviceName,
                days: null // GHN doesn't return leadtime in fee response
              });
            }
          } else {
            results.push({ provider: 'GHN', error: 'No services available' });
          }
        } else if (data.data.ghn.quote) {
          // Fallback to old structure
          results.push({
            provider: 'GHN',
            amount: data.data.ghn.quote.total,
            days: data.data.ghn.leadtime?.estimatedDays ?? null,
            service: data.data.ghn.quote.service_type_id ? `Service ${data.data.ghn.quote.service_type_id}` : undefined
          });
        }
      }

      // GHTK
      if (data.data?.ghtk) {
        console.log('[AddressNormalize] GHTK data:', data.data.ghtk);
        
        const ghtkData = data.data.ghtk as Record<string, unknown>;
        
        if (ghtkData.error) {
          results.push({ provider: 'GHTK', error: String(ghtkData.error) });
        } else if (ghtkData.quote) {
          const ghtkQuote = ghtkData.quote as Record<string, unknown>;
          const fee = ghtkQuote.fee as Record<string, unknown> | undefined;
          const leadtime = ghtkData.leadtime as Record<string, unknown> | undefined;
          
          results.push({
            provider: 'GHTK',
            amount: (fee?.total as number) || (ghtkQuote.total as number) || (ghtkQuote.shipFee as number) || (ghtkQuote.ship_fee_only as number),
            days: (leadtime?.estimatedDays as number) ?? null
          });
        }
      }

      // VTP
      if (data.data?.vtp) {
        if (data.data.vtp.error) {
          results.push({ provider: 'VTP', error: data.data.vtp.error });
        } else if (data.data.vtp.quote) {
          results.push({
            provider: 'VTP',
            amount: data.data.vtp.quote.total,
            days: data.data.vtp.leadtime?.estimatedDays ?? null
          });
        }
      }

      // Add placeholder for missing providers to show why they failed
      const expectedProviders = ['GHN', 'GHTK', 'VTP'] as const;
      const returnedProviders = new Set(results.map(r => r.provider));
      
      expectedProviders.forEach(provider => {
        if (!returnedProviders.has(provider)) {
          // Provider wasn't called or returned nothing
          if (provider === 'GHN' && !addr.ghnWardCode) {
            results.push({ 
              provider, 
              error: 'Thiếu mã phường/xã (ward code) - không thể gọi API GHN' 
            });
          } else if (provider === 'GHN' && !data.data?.ghn) {
            results.push({ 
              provider, 
              error: 'API không trả về dữ liệu - có thể thiếu thông tin bắt buộc' 
            });
          } else if (provider === 'VTP' && !process.env.NEXT_PUBLIC_VTP_TOKEN && !data.data?.vtp) {
            results.push({ 
              provider, 
              error: 'VTP_API_TOKEN chưa được cấu hình' 
            });
          }
        }
      });

      if (results.length === 0) {
        setError("Không lấy được báo giá từ nhà vận chuyển nào");
      } else {
        setQuotes(results);
      }

    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể gọi aggregator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
      <Card glass padding="lg" className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Chuẩn hóa địa chỉ hàng loạt</h3>
          <p className="mt-2 text-sm text-slate-300">
            Dán danh sách địa chỉ, hệ thống tự nhận diện Tỉnh/Quận/Phường và chuẩn hóa định dạng.
          </p>
        </div>
        <AddressProcessor onAddressesProcessed={setAddresses} />
      </Card>

      <div className="space-y-6">
        <Card glass padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-semibold text-white">Kết quả chuẩn hóa</h4>
              <p className="mt-1 text-xs text-slate-300">Hợp lệ: {validCount}/{addresses.length}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-300">
                Cân nặng (gram)
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="ml-2 w-28 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-1 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                />
              </label>
            </div>
          </div>

          {addresses.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
              Chưa có dữ liệu. Dán danh sách địa chỉ ở khối bên trái để bắt đầu.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900/60">
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Địa chỉ gốc</th>
                    <th className="px-4 py-3">Chuẩn hóa</th>
                    <th className="px-4 py-3">Số nhà</th>
                    <th className="px-4 py-3">Tên đường</th>
                    <th className="px-4 py-3">Tỉnh/TP</th>
                    <th className="px-4 py-3">Quận/Huyện</th>
                    <th className="px-4 py-3">Phường/Xã</th>
                    <th className="px-4 py-3">GHN IDs</th>
                    <th className="px-4 py-3">Độ chính xác</th>
                    <th className="px-4 py-3">Báo giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {addresses.map((a, idx) => (
                    <tr key={`${a.original}-${idx}`} className="text-sm text-slate-200">
                      <td className="px-4 py-3 align-top text-slate-300">{a.original}</td>
                      <td className="px-4 py-3 align-top text-slate-200">{a.normalizedAddress ?? "—"}</td>
                      <td className="px-4 py-3 align-top">{a.streetNumber || "—"}</td>
                      <td className="px-4 py-3 align-top">{a.streetName || "—"}</td>
                      <td className="px-4 py-3 align-top">
                        {a.province || "—"}
                        {a.ghnProvinceId && (
                          <span className="ml-1 text-xs text-slate-400">({a.ghnProvinceId})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {a.district || "—"}
                        {a.ghnDistrictId && (
                          <span className="ml-1 text-xs text-slate-400">({a.ghnDistrictId})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {a.ward || "—"}
                        {a.ghnWardCode && (
                          <span className="ml-1 text-xs text-slate-400">({a.ghnWardCode})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs">
                        {a.ghnProvinceId ? (
                          <div className="space-y-0.5">
                            <div>P: {a.ghnProvinceId}</div>
                            {a.ghnDistrictId && <div>D: {a.ghnDistrictId}</div>}
                            {a.ghnWardCode && <div>W: {a.ghnWardCode}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs">
                        {a.matchConfidence ? (
                          <div className="space-y-0.5">
                            <div className={a.matchConfidence.province === 1 ? "text-green-400" : "text-yellow-400"}>
                              P: {((a.matchConfidence.province || 0) * 100).toFixed(0)}%
                            </div>
                            {a.matchConfidence.district && (
                              <div className={a.matchConfidence.district === 1 ? "text-green-400" : "text-yellow-400"}>
                                D: {((a.matchConfidence.district || 0) * 100).toFixed(0)}%
                              </div>
                            )}
                            {a.matchConfidence.ward && (
                              <div className={a.matchConfidence.ward === 1 ? "text-green-400" : "text-yellow-400"}>
                                W: {((a.matchConfidence.ward || 0) * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <button
                          disabled={!a.isValid || loading}
                          onClick={() => requestQuote(a)}
                          className={buttonVariants({
                            className: cn(
                              "px-3 py-1 text-xs",
                              "disabled:cursor-not-allowed disabled:opacity-50"
                            )
                          })}
                          title={a.ghnProvinceId ? "Lấy báo giá từ GHN, GHTK, VTP" : "Chỉ lấy báo giá GHTK (thiếu GHN IDs)"}
                        >
                          {a.ghnProvinceId ? "Lấy tất cả báo giá" : "Lấy báo giá (GHTK)"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card glass padding="lg" className="space-y-4">
          <h4 className="text-base font-semibold text-white">Kết quả báo giá</h4>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm">
            {!selected && <p className="text-slate-300">Chọn một địa chỉ hợp lệ và nhấn “Lấy báo giá”.</p>}
            {selected && (
              <div className="space-y-3">
                <p className="text-slate-300">
                  Địa chỉ nhận: <span className="text-slate-100">{selected.normalizedAddress ?? selected.original}</span>
                </p>
                <p className="text-slate-300">
                  Địa chỉ gửi: <span className="text-slate-100">{sender.pickAddress}, {sender.pickDistrict}, {sender.pickProvince}</span>
                </p>
                {loading && <p className="text-sky-300">Đang truy vấn aggregator…</p>}
                {error && <p className="text-red-300">{error}</p>}
                
                {quotes.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-white">So sánh giá từ {quotes.length} nhà vận chuyển:</p>
                    
                    <div className="space-y-3">
                      {quotes.map((q, idx) => (
                        <div
                          key={`${q.provider}-${idx}`}
                          className={cn(
                            "rounded-xl border p-4",
                            q.error 
                              ? "border-red-500/30 bg-red-950/20" 
                              : "border-slate-700 bg-slate-900/40"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-white">{q.provider}</p>
                              {q.error ? (
                                <p className="text-xs text-red-300">{q.error}</p>
                              ) : (
                                <>
                                  <p className="text-lg font-bold text-emerald-300">
                                    {q.amount ? currency.format(q.amount) : 'N/A'}
                                  </p>
                                  {q.days != null && (
                                    <p className="text-xs text-slate-400">
                                      Thời gian: {q.days} ngày
                                    </p>
                                  )}
                                  {q.service && (
                                    <p className="text-xs text-slate-400">{q.service}</p>
                                  )}
                                </>
                              )}
                            </div>
                            
                            {!q.error && q.amount && (
                              <div className={cn(
                                "rounded-lg px-2 py-1 text-xs font-semibold",
                                q.provider === 'GHN' ? "bg-orange-500/20 text-orange-300" :
                                q.provider === 'GHTK' ? "bg-blue-500/20 text-blue-300" :
                                "bg-green-500/20 text-green-300"
                              )}>
                                {q.provider}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selected?.ghnProvinceId && (
                      <p className="text-xs text-slate-400">
                        ✅ Sử dụng GHN IDs: Province {selected.ghnProvinceId}, District {selected.ghnDistrictId}, Ward {selected.ghnWardCode}
                      </p>
                    )}
                    
                    {!selected?.ghnProvinceId && (
                      <p className="text-xs text-amber-400">
                        ⚠️ Thiếu GHN IDs - chỉ có thể lấy báo giá GHTK (text-based)
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
