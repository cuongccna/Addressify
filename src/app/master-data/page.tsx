"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/buttonVariants";
import { SectionHeader } from "@/components/ui/SectionHeader";

type SyncResult = { 
  provinces: { created: number; updated: number; total: number };
  districts: { created: number; updated: number; skipped: number; total: number };
  wards: { created: number; updated: number; skipped: number; total: number };
};
type DbStats = { provinces: number; districts: number; wards: number };
type MatchedItem = { id?: number; code?: string; name: string; confidence: number };
type TestResult = { province: MatchedItem | null; district: MatchedItem | null; ward: MatchedItem | null };

export default function MasterDataPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [testInput, setTestInput] = useState({
    province: "Hồ Chí Minh",
    district: "Bình Tân",
    ward: "An Lạc A"
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  // Load database stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("/api/master-data/sync");
        const data = await res.json();
        if (data.success && data.database) {
          setDbStats(data.database);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/master-data/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      setResult(data.data);
      
      // Reload stats after sync
      const statsRes = await fetch("/api/master-data/sync");
      const statsData = await statsRes.json();
      if (statsData.success && statsData.database) {
        setDbStats(statsData.database);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await fetch("/api/master-data/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testInput)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      setTestResult(data.data);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
      <SectionHeader
        title="Master Data Management"
        subtitle="Sync và quản lý dữ liệu tỉnh/quận/phường từ GHN API vào PostgreSQL"
      />

      {/* Database Stats */}
      <Card glass padding="lg" className="space-y-4">
        <h3 className="text-lg font-semibold text-white">📊 Thống kê Database PostgreSQL</h3>
        {loadingStats ? (
          <p className="text-slate-400">Đang tải...</p>
        ) : dbStats ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-4 text-center">
              <p className="text-3xl font-bold text-sky-300">{dbStats.provinces}</p>
              <p className="text-sm text-sky-200">Tỉnh/Thành phố</p>
            </div>
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
              <p className="text-3xl font-bold text-emerald-300">{dbStats.districts}</p>
              <p className="text-sm text-emerald-200">Quận/Huyện</p>
            </div>
            <div className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-4 text-center">
              <p className="text-3xl font-bold text-purple-300">{dbStats.wards.toLocaleString()}</p>
              <p className="text-sm text-purple-200">Phường/Xã</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Không thể tải thống kê</p>
        )}
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card glass padding="lg" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white">🔄 Sync Master Data</h3>
            <p className="mt-2 text-sm text-slate-300">
              Tải về danh sách tỉnh/quận/phường mới nhất từ GHN API và lưu vào PostgreSQL.
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className={buttonVariants({
              className: "w-full disabled:cursor-not-allowed disabled:opacity-50"
            })}
          >
            {syncing ? "Đang sync..." : "Sync Master Data từ GHN → PostgreSQL"}
          </button>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
              <p className="font-semibold text-emerald-200">✓ Sync thành công!</p>
              <div className="space-y-2 text-emerald-100">
                <p>📍 Provinces: {result.provinces.created} tạo mới, {result.provinces.updated} cập nhật</p>
                <p>🏢 Districts: {result.districts.created} tạo mới, {result.districts.updated} cập nhật</p>
                <p>🏠 Wards: {result.wards.created} tạo mới, {result.wards.updated} cập nhật</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-xs text-slate-300">
            <p className="font-semibold text-slate-200">Lưu ý:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Cần có GHN_API_TOKEN trong môi trường</li>
              <li>Dữ liệu được lưu vào PostgreSQL local</li>
              <li>Sync sẽ cập nhật records đã tồn tại</li>
              <li>Quá trình sync có thể mất vài phút</li>
            </ul>
          </div>
        </Card>

        <Card glass padding="lg" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Test Address Matching</h3>
            <p className="mt-2 text-sm text-slate-300">
              Kiểm tra khả năng matching địa chỉ với master data.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Tỉnh/Thành phố:</span>
              <input
                value={testInput.province}
                onChange={(e) => setTestInput({ ...testInput, province: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Quận/Huyện:</span>
              <input
                value={testInput.district}
                onChange={(e) => setTestInput({ ...testInput, district: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-200">Phường/Xã (tùy chọn):</span>
              <input
                value={testInput.ward}
                onChange={(e) => setTestInput({ ...testInput, ward: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
              />
            </label>

            <button
              onClick={handleTest}
              disabled={testing}
              className={buttonVariants({
                className: "w-full disabled:cursor-not-allowed disabled:opacity-50"
              })}
            >
              {testing ? "Đang test..." : "Test Matching"}
            </button>
          </div>

          {testError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {testError}
            </div>
          )}

          {testResult && (
            <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-xs">
              <div>
                <p className="font-semibold text-slate-200">Province:</p>
                {testResult.province ? (
                  <div className="mt-1 text-slate-300">
                    <p>ID: {testResult.province.id}</p>
                    <p>Name: {testResult.province.name}</p>
                    <p>Confidence: {(testResult.province.confidence * 100).toFixed(0)}%</p>
                  </div>
                ) : (
                  <p className="mt-1 text-red-300">Not found</p>
                )}
              </div>

              <div>
                <p className="font-semibold text-slate-200">District:</p>
                {testResult.district ? (
                  <div className="mt-1 text-slate-300">
                    <p>ID: {testResult.district.id}</p>
                    <p>Name: {testResult.district.name}</p>
                    <p>Confidence: {(testResult.district.confidence * 100).toFixed(0)}%</p>
                  </div>
                ) : (
                  <p className="mt-1 text-red-300">Not found</p>
                )}
              </div>

              <div>
                <p className="font-semibold text-slate-200">Ward:</p>
                {testResult.ward ? (
                  <div className="mt-1 text-slate-300">
                    <p>Code: {testResult.ward.code}</p>
                    <p>Name: {testResult.ward.name}</p>
                    <p>Confidence: {(testResult.ward.confidence * 100).toFixed(0)}%</p>
                  </div>
                ) : (
                  <p className="mt-1 text-slate-300">Not provided or not found</p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
