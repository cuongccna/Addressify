"use client";

import React, { useMemo, useState, useEffect } from "react";

import { AddressProcessor } from "@/components/AddressProcessor";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/buttonVariants";
import { cn } from "@/utils/cn";
import type { AddressData } from "@/types/address";
import { SenderConfigDialog } from "./SenderConfigDialog";
import { exportAddressesToCSV, exportBulkQuotesToCSV, downloadCSV, type BulkQuoteResult } from "@/utils/csvExport";
import { useShop } from "@/contexts/ShopContext";

type ProviderQuote = {
  provider: string; // Can be "GHN", "GHTK", "VTP", or "GHN - Service Name"
  amount?: number;
  days?: number | null;
  service?: string;
  error?: string;
  weight?: number; // Weight in grams for this quote
};

// Standard weight tiers for shipping quotes (in grams)
const WEIGHT_TIERS = [500, 1000, 2000, 3000, 5000, 10000, 20000];

type AggResponse = {
  success: boolean;
  data?: {
    ghn?: { 
      quotes?: Array<Record<string, unknown>>; 
      quote?: { total: number; service_type_id?: number }; 
      leadtime?: { estimatedDays?: number | null }; 
      error?: string 
    };
    ghtk?: { quote?: Record<string, unknown>; leadtime?: { estimatedDays?: number | null }; error?: string };
    vtp?: { quote?: Record<string, unknown>; leadtime?: { estimatedDays?: number | null }; error?: string };
  };
  message?: string;
};

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function AddressNormalizeAndCompare() {
  const { selectedShop } = useShop();
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [selected, setSelected] = useState<AddressData | null>(null);
  const [sender, setSender] = useState<{
    pickProvince: string;
    pickDistrict: string;
    pickAddress: string;
    ghnProvinceId?: number;
    ghnDistrictId?: number;
    ghnWardCode?: string;
  }>({
    pickProvince: "TP. Hồ Chí Minh",
    pickDistrict: "Quận 1",
    pickAddress: "19 Nguyễn Trãi",
    // GHN IDs for sender (Quận 1, TPHCM)
    ghnProvinceId: 202,
    ghnDistrictId: 1454, // Example: Quận 1
    ghnWardCode: undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<ProviderQuote[]>([]);
  const [showSenderConfig, setShowSenderConfig] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [savingToDb, setSavingToDb] = useState(false);
  const defaultWeightForBulk = 1000; // Default 1kg for bulk export

  const validCount = useMemo(() => addresses.filter((a) => a.isValid).length, [addresses]);

  // Load sender config from selected shop
  useEffect(() => {
    if (selectedShop) {
      setSender({
        pickProvince: selectedShop.senderProvince,
        pickDistrict: selectedShop.senderDistrict,
        pickAddress: selectedShop.senderAddress,
        ghnProvinceId: selectedShop.ghnProvinceId ? Number(selectedShop.ghnProvinceId) : undefined,
        ghnDistrictId: selectedShop.ghnDistrictId ? Number(selectedShop.ghnDistrictId) : undefined,
        ghnWardCode: selectedShop.ghnWardCode || undefined
      });
    }
  }, [selectedShop]);

  // Save quote result to database
  const saveQuoteToDatabase = async (addr: AddressData, quotes: ProviderQuote[]) => {
    if (!selectedShop) {
      console.warn('No shop selected, skipping database save');
      return;
    }

    try {
      setSavingToDb(true);
      const response = await fetch('/api/quote-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: selectedShop.id,
          recipientName: 'Customer', // AddressData doesn't have name field
          recipientPhone: 'N/A', // AddressData doesn't have phone field
          recipientAddress: addr.original,
          normalizedAddress: addr.normalizedAddress || addr.original,
          province: addr.province || '',
          district: addr.district || '',
          ward: addr.ward || '',
          wardCode: addr.ghnWardCode,
          confidence: addr.matchConfidence?.ward || 0,
          quotes: quotes.map(q => ({
            provider: q.provider,
            service: q.service || '',
            amount: q.amount || 0,
            currency: 'VND',
            error: q.error
          })),
          weight: defaultWeightForBulk,
          value: 1000000, // Default insurance value
          note: `Auto-saved quote on ${new Date().toLocaleString('vi-VN')}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save quote to database');
      }

      console.log('Quote saved to database successfully');
    } catch (err) {
      console.error('Error saving quote to database:', err);
    } finally {
      setSavingToDb(false);
    }
  };

  // Export addresses to CSV
  const handleExportAddresses = () => {
    const csv = exportAddressesToCSV(addresses);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadCSV(csv, `addresses-${timestamp}.csv`);
  };

  // Bulk quote processing
  const handleBulkQuote = async () => {
    if (addresses.length === 0) return;

    setBulkProcessing(true);
    setBulkProgress({ current: 0, total: addresses.length });

    const results: BulkQuoteResult[] = [];

    for (let i = 0; i < addresses.length; i++) {
      const addr = addresses[i];
      setBulkProgress({ current: i + 1, total: addresses.length });

      // Skip invalid addresses
      if (!addr.isValid) {
        results.push({ address: addr, quotes: [] });
        continue;
      }

      try {
        // Call aggregator
        const payload: Record<string, unknown> = {
          weightInGrams: defaultWeightForBulk,
          pickProvince: sender.pickProvince,
          pickDistrict: sender.pickDistrict,
          pickAddress: sender.pickAddress,
          province: addr.province,
          district: addr.district,
          address: [addr.ward, addr.district, addr.province].filter(Boolean).join(", ")
        };

        if (addr.ghnProvinceId && addr.ghnDistrictId) {
          payload.fromDistrictId = sender.ghnDistrictId;
          payload.toDistrictId = addr.ghnDistrictId;
          if (addr.ghnWardCode) {
            payload.toWardCode = addr.ghnWardCode;
          }
          payload.senderDistrictId = sender.ghnDistrictId;
          payload.receiverDistrictId = addr.ghnDistrictId;
          if (addr.ghnWardCode) {
            payload.receiverWardCode = addr.ghnWardCode;
          }
        }

        const res = await fetch("/api/shipping/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data: AggResponse = await res.json();
        const quotes: ProviderQuote[] = [];

        // Parse quotes (reuse existing logic)
        if (data.data?.ghn?.quotes) {
          for (const quote of data.data.ghn.quotes as Array<Record<string, unknown>>) {
            const fee = quote.fee as Record<string, unknown> | undefined;
            const service = quote.service as Record<string, unknown> | undefined;
            quotes.push({
              provider: `GHN - ${(service?.shortName as string) || 'Unknown'}`,
              amount: (fee?.total as number) || 0,
              service: (service?.shortName as string) || ''
            });
          }
        }

        if (data.data?.ghtk?.quote) {
          const ghtkData = data.data.ghtk as Record<string, unknown>;
          const ghtkQuote = ghtkData.quote as Record<string, unknown>;
          quotes.push({
            provider: 'GHTK',
            amount: (ghtkQuote.shipFee as number) || 0
          });
        }

        if (data.data?.vtp?.quote) {
          const vtpQuote = data.data.vtp.quote as Record<string, unknown>;
          quotes.push({
            provider: 'VTP',
            amount: (vtpQuote.total as number) || 0
          });
        }

        results.push({ address: addr, quotes });

        // Save each quote to database
        if (quotes.length > 0) {
          await saveQuoteToDatabase(addr, quotes);
        }

      } catch (e) {
        console.error(`Bulk quote error for address ${i}:`, e);
        results.push({ 
          address: addr, 
          quotes: [{ provider: 'Error', error: e instanceof Error ? e.message : 'Unknown error' }] 
        });
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Export results to CSV
    const csv = exportBulkQuotesToCSV(results);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadCSV(csv, `bulk-quotes-${timestamp}.csv`);

    setBulkProcessing(false);
    setBulkProgress({ current: 0, total: 0 });
  };

  const requestQuote = async (addr: AddressData) => {
    setSelected(addr);
    setQuotes([]);
    setError(null);
    setLoading(true);
    
    try {
      const allQuotes: ProviderQuote[] = [];
      
      // Fetch quotes for all weight tiers in parallel
      const quotePromises = WEIGHT_TIERS.map(async (weightInGrams) => {
        // Build payload based on available GHN IDs
        const payload: Record<string, unknown> = {
          weightInGrams,
          // GHTK fields (text-based)
          pickProvince: sender.pickProvince,
          pickDistrict: sender.pickDistrict,
          pickAddress: sender.pickAddress,
          province: addr.province,
          district: addr.district,
          address: [addr.ward, addr.district, addr.province].filter(Boolean).join(", ")
        };

        // Add GHN/VTP IDs if available
        if (addr.ghnProvinceId && addr.ghnDistrictId) {
          // GHN fields
          payload.fromDistrictId = sender.ghnDistrictId;
          payload.toDistrictId = addr.ghnDistrictId;
          if (addr.ghnWardCode) {
            payload.toWardCode = addr.ghnWardCode;
          }
          
          // VTP fields (same structure as GHN)
          payload.senderDistrictId = sender.ghnDistrictId;
          payload.receiverDistrictId = addr.ghnDistrictId;
          if (addr.ghnWardCode) {
            payload.receiverWardCode = addr.ghnWardCode;
          }
        }

        try {
          const res = await fetch("/api/shipping/quotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          
          const data: AggResponse = await res.json();
          
          if (!res.ok || !data.success) {
            return { weight: weightInGrams, quotes: [] as ProviderQuote[] };
          }

          // Parse results from all providers
          const weightQuotes: ProviderQuote[] = [];

          // GHN
          if (data.data?.ghn) {
            const ghnData = data.data.ghn as Record<string, unknown>;
            
            if (!ghnData.error && ghnData.quotes && Array.isArray(ghnData.quotes)) {
              const ghnQuotes = ghnData.quotes as Array<Record<string, unknown>>;
              for (const quote of ghnQuotes) {
                const fee = quote.fee as Record<string, unknown> | undefined;
                const service = quote.service as Record<string, unknown> | undefined;
                weightQuotes.push({
                  provider: `GHN${service?.shortName ? ` - ${service.shortName}` : ''}`,
                  amount: (fee?.total as number) || 0,
                  days: (quote.leadtime as Record<string, unknown>)?.estimatedDays as number || null,
                  service: (service?.shortName as string) || '',
                  weight: weightInGrams
                });
              }
            }
          }

          // GHTK
          if (data.data?.ghtk) {
            const ghtkData = data.data.ghtk as Record<string, unknown>;
            if (!ghtkData.error && ghtkData.quote) {
              const ghtkQuote = ghtkData.quote as Record<string, unknown>;
              weightQuotes.push({
                provider: 'GHTK',
                amount: (ghtkQuote.shipFee as number) || (ghtkQuote.total as number) || 0,
                days: (ghtkData.leadtime as Record<string, unknown>)?.estimatedDays as number || null,
                weight: weightInGrams
              });
            }
          }

          // VTP
          if (data.data?.vtp) {
            const vtpData = data.data.vtp as Record<string, unknown>;
            if (!vtpData.error && vtpData.quote) {
              const vtpQuote = vtpData.quote as Record<string, unknown>;
              weightQuotes.push({
                provider: 'VTP',
                amount: (vtpQuote.total as number) || 0,
                days: (vtpData.leadtime as Record<string, unknown>)?.estimatedDays as number || null,
                weight: weightInGrams
              });
            }
          }

          return { weight: weightInGrams, quotes: weightQuotes };
        } catch (e) {
          console.error(`Error fetching quotes for ${weightInGrams}g:`, e);
          return { weight: weightInGrams, quotes: [] as ProviderQuote[] };
        }
      });

      const results = await Promise.all(quotePromises);
      
      // Flatten all quotes
      for (const result of results) {
        allQuotes.push(...result.quotes);
      }

      if (allQuotes.length === 0) {
        setError("Không lấy được báo giá từ nhà vận chuyển nào");
      } else {
        setQuotes(allQuotes);
        // Auto-save quote to database (use 1kg as default)
        const oneKgQuotes = allQuotes.filter(q => q.weight === 1000);
        if (oneKgQuotes.length > 0) {
          await saveQuoteToDatabase(addr, oneKgQuotes);
        }
      }
    } catch (e) {
      console.error("Quote error:", e);
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
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
              <button
                onClick={() => setShowSenderConfig(true)}
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "px-3 py-1.5 text-xs"
                )}
                title="Cấu hình địa chỉ gửi hàng"
              >
                ⚙️ Địa chỉ gửi
              </button>
              
              {addresses.length > 0 && (
                <>
                  <button
                    onClick={handleExportAddresses}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "px-3 py-1.5 text-xs"
                    )}
                    title="Export địa chỉ đã chuẩn hóa ra CSV"
                  >
                    📥 Export địa chỉ
                  </button>
                  
                  <button
                    onClick={handleBulkQuote}
                    disabled={bulkProcessing || validCount === 0}
                    className={cn(
                      buttonVariants({ variant: "primary" }),
                      "px-3 py-1.5 text-xs disabled:opacity-50"
                    )}
                    title={`Lấy báo giá hàng loạt cho ${validCount} địa chỉ hợp lệ và export CSV`}
                  >
                    {bulkProcessing 
                      ? `⏳ ${bulkProgress.current}/${bulkProgress.total}` 
                      : `🚀 Lấy ${validCount} báo giá`
                    }
                  </button>
                </>
              )}
              

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
          <h4 className="text-base font-semibold text-white">Bảng giá vận chuyển (tất cả khối lượng)</h4>
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
                {loading && <p className="text-sky-300">Đang truy vấn báo giá cho {WEIGHT_TIERS.length} mức cân nặng…</p>}
                {savingToDb && <p className="text-purple-300">💾 Đang lưu vào database…</p>}
                {error && <p className="text-red-300">{error}</p>}
                
                {quotes.length > 0 && (
                  <div className="space-y-4">
                    {/* Summary table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-700 text-left text-slate-400">
                            <th className="px-2 py-2">Dịch vụ</th>
                            {WEIGHT_TIERS.map(w => (
                              <th key={w} className="px-2 py-2 text-right">
                                {w >= 1000 ? `${w/1000}kg` : `${w}g`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Group by unique provider names */}
                          {Array.from(new Set(quotes.map(q => q.provider))).map(provider => (
                            <tr key={provider} className="border-b border-slate-800 hover:bg-slate-800/40">
                              <td className={cn(
                                "px-2 py-2 font-medium whitespace-nowrap",
                                provider.startsWith('GHN') ? "text-orange-300" :
                                provider.startsWith('GHTK') ? "text-blue-300" :
                                "text-green-300"
                              )}>
                                {provider}
                              </td>
                              {WEIGHT_TIERS.map(w => {
                                const q = quotes.find(q => q.provider === provider && q.weight === w);
                                return (
                                  <td key={w} className="px-2 py-2 text-right">
                                    {q?.error ? (
                                      <span className="text-red-400" title={q.error}>—</span>
                                    ) : q?.amount ? (
                                      <span className="text-emerald-300">{currency.format(q.amount)}</span>
                                    ) : (
                                      <span className="text-slate-500">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <p className="text-xs text-slate-400">
                      💡 Tổng cộng {quotes.filter(q => !q.error).length}/{quotes.length} dịch vụ có báo giá thành công
                    </p>
                    
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
      
      {showSenderConfig && (
        <SenderConfigDialog
          config={sender}
          onSave={(newConfig) => {
            setSender(newConfig);
            // Save to localStorage for persistence
            localStorage.setItem('sender-config', JSON.stringify(newConfig));
          }}
          onClose={() => setShowSenderConfig(false)}
        />
      )}
    </div>
  );
}
