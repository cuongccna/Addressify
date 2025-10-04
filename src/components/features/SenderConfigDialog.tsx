'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface SenderConfig {
  pickProvince: string;
  pickDistrict: string;
  pickAddress: string;
  ghnProvinceId?: number;
  ghnDistrictId?: number;
  ghnWardCode?: string;
}

interface SenderConfigDialogProps {
  config: SenderConfig;
  onSave: (config: SenderConfig) => void;
  onClose: () => void;
}

export function SenderConfigDialog({ config, onSave, onClose }: SenderConfigDialogProps) {
  const [formData, setFormData] = useState<SenderConfig>(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card glass padding="lg" className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Cấu hình địa chỉ gửi hàng</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Địa chỉ</label>
              <input
                type="text"
                value={formData.pickAddress}
                onChange={(e) => setFormData({ ...formData, pickAddress: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                placeholder="19 Nguyễn Trãi"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-300">Quận/Huyện</label>
                <input
                  type="text"
                  value={formData.pickDistrict}
                  onChange={(e) => setFormData({ ...formData, pickDistrict: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  placeholder="Quận 1"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">Tỉnh/Thành phố</label>
                <input
                  type="text"
                  value={formData.pickProvince}
                  onChange={(e) => setFormData({ ...formData, pickProvince: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  placeholder="TP. Hồ Chí Minh"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
              <h4 className="mb-3 text-sm font-semibold text-white">GHN IDs (Tùy chọn)</h4>
              <p className="mb-3 text-xs text-slate-400">
                Nếu bạn biết GHN IDs, điền vào để tính phí chính xác hơn. Bỏ trống để dùng địa chỉ shop mặc định.
              </p>
              
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Province ID</label>
                  <input
                    type="number"
                    value={formData.ghnProvinceId || ''}
                    onChange={(e) => setFormData({ ...formData, ghnProvinceId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                    placeholder="202"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">District ID</label>
                  <input
                    type="number"
                    value={formData.ghnDistrictId || ''}
                    onChange={(e) => setFormData({ ...formData, ghnDistrictId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                    placeholder="1454"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Ward Code</label>
                  <input
                    type="text"
                    value={formData.ghnWardCode || ''}
                    onChange={(e) => setFormData({ ...formData, ghnWardCode: e.target.value || undefined })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                    placeholder="21001"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Lưu cấu hình
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
