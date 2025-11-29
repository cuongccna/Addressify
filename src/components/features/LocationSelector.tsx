"use client";

import { useState, useEffect, useMemo } from "react";

// API response types
interface Province {
  id: number;
  name: string;
  code?: string;
}

interface District {
  id: number;
  provinceId: number;
  name: string;
  code?: string;
  supportType?: number;
}

interface Ward {
  code: string;
  districtId: number;
  name: string;
  supportType?: number;
}

// GHTK fallback mapping (used when district name available)
const GHTK_ADDRESS_FALLBACK: Record<string, string> = {
  "Quận Hoàn Kiếm": "25 Lý Thái Tổ",
  "Quận Ba Đình": "1 Điện Biên Phủ",
  "Quận Đống Đa": "100 Xã Đàn",
  "Quận Hai Bà Trưng": "50 Bà Triệu",
  "Quận 1": "19 Nguyễn Trãi",
  "Quận 2": "10 Đỗ Xuân Hợp",
  "Quận 3": "100 Nam Kỳ Khởi Nghĩa",
  "Quận 4": "50 Khánh Hội",
  "Quận Hải Châu": "100 Hùng Vương",
  "Quận Thanh Khê": "50 Nguyễn Văn Linh",
};

interface LocationSelectorProps {
  type: "from" | "to";
  onGhnChange: (districtId: number, wardCode: string) => void;
  onGhtkChange: (province: string, district: string, address: string) => void;
  onVtpChange: (districtId: number) => void;
  initialProvinceId?: number;
  initialDistrictId?: number;
}

export function LocationSelector({
  type,
  onGhnChange,
  onGhtkChange,
  onVtpChange,
  initialProvinceId = 201, // HCM
  initialDistrictId = 1451, // Quận 1
}: LocationSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  const [selectedProvinceId, setSelectedProvinceId] = useState(initialProvinceId);
  const [selectedDistrictId, setSelectedDistrictId] = useState(initialDistrictId);
  const [selectedWardCode, setSelectedWardCode] = useState("");

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.id === selectedProvinceId),
    [provinces, selectedProvinceId]
  );

  const selectedDistrict = useMemo(
    () => districts.find((d) => d.id === selectedDistrictId),
    [districts, selectedDistrictId]
  );

  // Track mounted state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvinceId) {
      loadDistricts(selectedProvinceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceId]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrictId) {
      loadWards(selectedDistrictId);
    }
  }, [selectedDistrictId]);

  // Notify parent when selection is complete
  useEffect(() => {
    if (selectedDistrictId && selectedWardCode && selectedProvince && selectedDistrict) {
      // Verify district belongs to selected province (prevent stale data)
      const districtBelongsToProvince = districts.some(
        (d) => d.id === selectedDistrictId && d.provinceId === selectedProvinceId
      );
      
      // Verify ward belongs to selected district (prevent stale data)
      const wardBelongsToDistrict = wards.some(
        (w) => w.code === selectedWardCode && w.districtId === selectedDistrictId
      );

      if (!districtBelongsToProvince || !wardBelongsToDistrict) {
        console.warn("[LocationSelector] Stale data detected, skipping callback", {
          districtBelongsToProvince,
          wardBelongsToDistrict,
          selectedProvinceId,
          selectedDistrictId,
          selectedWardCode
        });
        return;
      }

      // GHN
      onGhnChange(selectedDistrictId, selectedWardCode);

      // VTP
      onVtpChange(selectedDistrictId);

      // GHTK
      const ghtkAddress = GHTK_ADDRESS_FALLBACK[selectedDistrict.name] || "Số 1 Đường chính";
      onGhtkChange(selectedProvince.name, selectedDistrict.name, ghtkAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrictId, selectedWardCode, districts, wards]);

  const loadProvinces = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/locations/provinces");
      const data = await res.json();
      if (data.success) {
        setProvinces(data.data);
      }
    } catch (error) {
      console.error("Failed to load provinces:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async (provinceId: number) => {
    try {
      setLoadingDistricts(true);
      const res = await fetch(`/api/locations/districts?provinceId=${provinceId}`);
      const data = await res.json();
      if (data.success) {
        setDistricts(data.data);
        
        // Auto-select appropriate district
        const firstDistrict = data.data[0];
        if (firstDistrict) {
          // If current district doesn't belong to new province, switch to first district
          const currentDistrictInNewProvince = data.data.find((d: District) => d.id === selectedDistrictId);
          
          if (!currentDistrictInNewProvince) {
            // Current district not in new province, select first or initial
            const districtToSelect = data.data.find((d: District) => d.id === initialDistrictId) || firstDistrict;
            setSelectedDistrictId(districtToSelect.id);
            setSelectedWardCode(""); // Reset ward when district changes
          }
          // Otherwise keep current district (handles initial load)
        }
      }
    } catch (error) {
      console.error("Failed to load districts:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (districtId: number) => {
    try {
      setLoadingWards(true);
      const res = await fetch(`/api/locations/wards?districtId=${districtId}`);
      const data = await res.json();
      if (data.success) {
        setWards(data.data);
        // Auto-select first ward
        if (data.data[0]) {
          setSelectedWardCode(data.data[0].code);
        }
      }
    } catch (error) {
      console.error("Failed to load wards:", error);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvinceId = Number(e.target.value);
    setSelectedProvinceId(newProvinceId);
    setSelectedDistrictId(0);
    setSelectedWardCode("");
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrictId = Number(e.target.value);
    setSelectedDistrictId(newDistrictId);
    setSelectedWardCode("");
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWardCode(e.target.value);
  };

  // SSR/Hydration: show consistent loading state
  if (!mounted || loading) {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-slate-300">
          {type === "from" ? "📤 Địa chỉ gửi" : "📥 Địa chỉ nhận"}
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
          <span className="ml-3 text-sm text-slate-400">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-slate-300">
        {type === "from" ? "📤 Địa chỉ gửi" : "📥 Địa chỉ nhận"}
      </div>

      {/* Province Selector */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Tỉnh/Thành phố</label>
        <select
          value={selectedProvinceId}
          onChange={handleProvinceChange}
          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          suppressHydrationWarning
        >
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {/* District Selector */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Quận/Huyện</label>
        <select
          value={selectedDistrictId}
          onChange={handleDistrictChange}
          disabled={loadingDistricts || districts.length === 0}
          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          suppressHydrationWarning
        >
          {loadingDistricts ? (
            <option>Đang tải...</option>
          ) : (
            districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Ward Selector */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Phường/Xã</label>
        <select
          value={selectedWardCode}
          onChange={handleWardChange}
          disabled={loadingWards || wards.length === 0}
          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          suppressHydrationWarning
        >
          {loadingWards ? (
            <option>Đang tải...</option>
          ) : (
            wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Preview - Technical IDs */}
      <div className="text-xs text-slate-500 space-y-1 p-2 bg-slate-900/30 rounded border border-slate-700">
        <div className="flex justify-between">
          <span>GHN District ID:</span>
          <span className="font-mono text-slate-400">{selectedDistrictId || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span>GHN Ward Code:</span>
          <span className="font-mono text-slate-400">{selectedWardCode || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span>GHTK:</span>
          <span className="text-slate-400">{selectedProvince?.name} • {selectedDistrict?.name}</span>
        </div>
        <div className="flex justify-between">
          <span>VTP District ID:</span>
          <span className="font-mono text-slate-400">{selectedDistrictId || "-"}</span>
        </div>
      </div>
    </div>
  );
}
