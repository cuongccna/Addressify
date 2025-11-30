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
    pickProvince: "TP. Há»“ ChÃ­ Minh",
    pickDistrict: "Quáº­n 1",
    pickAddress: "19 Nguyá»…n TrÃ£i",
    // GHN IDs for sender (Quáº­n 1, TPHCM)
    ghnProvinceId: 202,
    ghnDistrictId: 1454, // Example: Quáº­n 1
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const validCount = useMemo(() => addresses.filter((a) => a.isValid).length, [addresses]);
  const totalPages = Math.ceil(addresses.length / itemsPerPage);
  const paginatedAddresses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return addresses.slice(start, start + itemsPerPage);
  }, [addresses, currentPage, itemsPerPage]);

  // Reset page when addresses change
  useEffect(() => { setCurrentPage(1); }, [addresses.length]);

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
        setError("KhÃ´ng láº¥y Ä‘Æ°á»£c bÃ¡o giÃ¡ tá»« nhÃ  váº­n chuyá»ƒn nÃ o");
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
      setError(e instanceof Error ? e.message : "Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
      <Card glass padding="lg" className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Chuáº©n hÃ³a Ä‘á»‹a chá»‰ hÃ ng loáº¡t</h3>
          <p className="mt-2 text-sm text-slate-300">
            DÃ¡n danh sÃ¡ch Ä‘á»‹a chá»‰, há»‡ thá»‘ng tá»± nháº­n diá»‡n Tá»‰nh/Quáº­n/PhÆ°á»ng vÃ  chuáº©n hÃ³a Ä‘á»‹nh dáº¡ng.
          </p>
        </div>
        <AddressProcessor onAddressesProcessed={setAddresses} />
      </Card>

      <div className="space-y-6">
        {/* Báº£ng giÃ¡ váº­n chuyá»ƒn - Äáº¶T LÃŠN TRÃŠN */}
        <Card glass padding="lg" className="space-y-4">
          <h4 className="text-base font-semibold text-white">Báº£ng giÃ¡ váº­n chuyá»ƒn (táº¥t cáº£ khá»‘i lÆ°á»£ng)</h4>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm">
            {!selected && <p className="text-slate-300">Chá»n má»™t Ä‘á»‹a chá»‰ há»£p lá»‡ vÃ  nháº¥n &quot;Láº¥y bÃ¡o giÃ¡&quot;.</p>}
            {selected && (
              <div className="space-y-3">
                <p className="text-slate-300">Äá»‹a chá»‰ nháº­n: <span className="text-slate-100">{selected.normalizedAddress ?? selected.original}</span></p>
                <p className="text-slate-300">Äá»‹a chá»‰ gá»­i: <span className="text-slate-100">{sender.pickAddress}, {sender.pickDistrict}, {sender.pickProvince}</span></p>
                {loading && <p className="text-sky-300">Äang truy váº¥n bÃ¡o giÃ¡ cho {WEIGHT_TIERS.length} má»©c cÃ¢n náº·ngâ€¦</p>}
                {savingToDb && <p className="text-purple-300">ðŸ’¾ Äang lÆ°u vÃ o databaseâ€¦</p>}
                {error && <p className="text-red-300">{error}</p>}
                {quotes.length > 0 && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-700 text-left text-slate-400">
                            <th className="px-2 py-2">Dá»‹ch vá»¥</th>
                            {WEIGHT_TIERS.map(w => (<th key={w} className="px-2 py-2 text-right">{w >= 1000 ? `${w/1000}kg` : `${w}g`}</th>))}
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(new Set(quotes.map(q => q.provider))).map(provider => (
                            <tr key={provider} className="border-b border-slate-800 hover:bg-slate-800/40">
                              <td className={cn("px-2 py-2 font-medium whitespace-nowrap", provider.startsWith('GHN') ? "text-orange-300" : provider.startsWith('GHTK') ? "text-blue-300" : "text-green-300")}>{provider}</td>
                              {WEIGHT_TIERS.map(w => {
                                const q = quotes.find(q => q.provider === provider && q.weight === w);
                                return (<td key={w} className="px-2 py-2 text-right">{q?.error ? <span className="text-red-400" title={q.error}>â€”</span> : q?.amount ? <span className="text-emerald-300">{currency.format(q.amount)}</span> : <span className="text-slate-500">â€”</span>}</td>);
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-slate-400">ðŸ’¡ Tá»•ng cá»™ng {quotes.filter(q => !q.error).length}/{quotes.length} dá»‹ch vá»¥ cÃ³ bÃ¡o giÃ¡ thÃ nh cÃ´ng</p>
                    {selected?.ghnProvinceId && <p className="text-xs text-slate-400">âœ… Sá»­ dá»¥ng GHN IDs: Province {selected.ghnProvinceId}, District {selected.ghnDistrictId}, Ward {selected.ghnWardCode || 'N/A'}</p>}
                    {!selected?.ghnProvinceId && <p className="text-xs text-amber-400">âš ï¸ Thiáº¿u GHN IDs - chá»‰ cÃ³ thá»ƒ láº¥y bÃ¡o giÃ¡ GHTK (text-based)</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Káº¿t quáº£ chuáº©n hÃ³a */}
        <Card glass padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-semibold text-white">Káº¿t quáº£ chuáº©n hÃ³a</h4>
              <p className="mt-1 text-xs text-slate-300">Há»£p lá»‡: {validCount}/{addresses.length}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSenderConfig(true)}
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "px-3 py-1.5 text-xs"
                )}
                title="Cáº¥u hÃ¬nh Ä‘á»‹a chá»‰ gá»­i hÃ ng"
              >
                âš™ï¸ Äá»‹a chá»‰ gá»­i
              </button>
              
              {addresses.length > 0 && (
                <>
                  <button
                    onClick={handleExportAddresses}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "px-3 py-1.5 text-xs"
                    )}
                    title="Export Ä‘á»‹a chá»‰ Ä‘Ã£ chuáº©n hÃ³a ra CSV"
                  >
                    ðŸ“¥ Export Ä‘á»‹a chá»‰
                  </button>
                  
                  <button
                    onClick={handleBulkQuote}
                    disabled={bulkProcessing || validCount === 0}
                    className={cn(
                      buttonVariants({ variant: "primary" }),
                      "px-3 py-1.5 text-xs disabled:opacity-50"
                    )}
                    title={`Láº¥y bÃ¡o giÃ¡ hÃ ng loáº¡t cho ${validCount} Ä‘á»‹a chá»‰ há»£p lá»‡ vÃ  export CSV`}
                  >
                    {bulkProcessing 
                      ? `â³ ${bulkProgress.current}/${bulkProgress.total}` 
                      : `ðŸš€ Láº¥y ${validCount} bÃ¡o giÃ¡`
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
            <>
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900/60">
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Äá»‹a chá»‰ gá»‘c</th>
                    <th className="px-4 py-3">Chuáº©n hÃ³a</th>
                    <th className="px-4 py-3">Sá»‘ nhÃ </th>
                    <th className="px-4 py-3">TÃªn Ä‘Æ°á»ng</th>
                    <th className="px-4 py-3">Tá»‰nh/TP</th>
                    <th className="px-4 py-3">Quáº­n/Huyá»‡n</th>
                    <th className="px-4 py-3">PhÆ°á»ng/XÃ£</th>
                    <th className="px-4 py-3">GHN IDs</th>
                    <th className="px-4 py-3">Äá»™ chÃ­nh xÃ¡c</th>
                    <th className="px-4 py-3">BÃ¡o giÃ¡</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedAddresses.map((a, idx) => (
                    <tr key={`${a.original}-${(currentPage-1)*itemsPerPage+idx}`} className="text-sm text-slate-200">
                      <td className="px-4 py-3 align-top text-slate-300">{a.original}</td>
                      <td className="px-4 py-3 align-top text-slate-200">{a.normalizedAddress ?? "â€”"}</td>
                      <td className="px-4 py-3 align-top">{a.streetNumber || "â€”"}</td>
                      <td className="px-4 py-3 align-top">{a.streetName || "â€”"}</td>
                      <td className="px-4 py-3 align-top">
                        {a.province || "â€”"}
                        {a.ghnProvinceId && (
                          <span className="ml-1 text-xs text-slate-400">({a.ghnProvinceId})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {a.district || "â€”"}
                        {a.ghnDistrictId && (
                          <span className="ml-1 text-xs text-slate-400">({a.ghnDistrictId})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {a.ward || "â€”"}
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
                          <span className="text-slate-500">â€”</span>
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
                          title={a.ghnProvinceId ? "Láº¥y bÃ¡o giÃ¡ tá»« GHN, GHTK, VTP" : "Chá»‰ láº¥y bÃ¡o giÃ¡ GHTK (thiáº¿u GHN IDs)"}
                        >
                          {a.ghnProvinceId ? "Láº¥y táº¥t cáº£ bÃ¡o giÃ¡" : "Láº¥y bÃ¡o giÃ¡ (GHTK)"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-400">Hiá»ƒn thá»‹ {(currentPage-1)*itemsPerPage+1}-{Math.min(currentPage*itemsPerPage, addresses.length)} / {addresses.length} Ä‘á»‹a chá»‰</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className={cn("px-2 py-1 text-xs rounded", currentPage === 1 ? "text-slate-600" : "text-slate-300 hover:bg-slate-800")}>Â«Â«</button>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className={cn("px-2 py-1 text-xs rounded", currentPage === 1 ? "text-slate-600" : "text-slate-300 hover:bg-slate-800")}>Â«</button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pn = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) pn = i + 1;
                      else if (currentPage >= totalPages - 2) pn = totalPages - 4 + i;
                      else pn = currentPage - 2 + i;
                    }
                    return (<button key={pn} onClick={() => setCurrentPage(pn)} className={cn("px-3 py-1 text-xs rounded", currentPage === pn ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-800")}>{pn}</button>);
                  })}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className={cn("px-2 py-1 text-xs rounded", currentPage === totalPages ? "text-slate-600" : "text-slate-300 hover:bg-slate-800")}>Â»</button>
                  <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className={cn("px-2 py-1 text-xs rounded", currentPage === totalPages ? "text-slate-600" : "text-slate-300 hover:bg-slate-800")}>Â»Â»</button>
                </div>
              </div>
            )}
            </>
          )}
        </Card>
      </div>
      
      {showSenderConfig && (
        <SenderConfigDialog
          config={sender}
          onSave={(newConfig) => { setSender(newConfig); localStorage.setItem('sender-config', JSON.stringify(newConfig)); }}
          onClose={() => setShowSenderConfig(false)}
        />
      )}
    </div>
  );
}
