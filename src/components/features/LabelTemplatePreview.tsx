'use client';

import type { AddressData } from '@/types/address'
import type { LabelTemplateConfig } from '@/types/label'
import type { SenderConfig } from './SenderConfigDialog'

interface LabelTemplatePreviewProps {
  template: LabelTemplateConfig
  sender?: SenderConfig
  address?: AddressData
  compact?: boolean
}

const SAMPLE_ADDRESS: AddressData = {
  original: 'Nguyễn Văn A, 123 Nguyễn Huệ, Quận 1, TP.HCM',
  normalizedAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
  province: 'TP.HCM',
  district: 'Quận 1',
  ward: 'Bến Nghé',
  streetName: 'Nguyễn Huệ',
  streetNumber: '123',
  isValid: true,
  ghnProvinceId: 202,
  ghnDistrictId: 1454,
  ghnWardCode: '21001'
}

const SAMPLE_SENDER: SenderConfig = {
  pickProvince: 'TP.HCM',
  pickDistrict: 'Quận 1',
  pickAddress: '19 Nguyễn Trãi',
  ghnProvinceId: 202,
  ghnDistrictId: 1454,
  ghnWardCode: '21001'
}

export function LabelTemplatePreview({ template, sender, address, compact }: LabelTemplatePreviewProps) {
  const previewAddress = address ?? SAMPLE_ADDRESS
  const previewSender = sender ?? SAMPLE_SENDER

  return (
    <div
      className="rounded-2xl border border-slate-800 bg-white text-slate-900 shadow-xl"
      style={{
        fontFamily: template.fontFamily,
        width: compact ? '260px' : '320px',
        minHeight: compact ? '340px' : '380px'
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3" style={{ backgroundColor: `${template.accentColor}10` }}>
        <div className="text-base font-semibold text-slate-800">
          {template.showLogo ? template.logoText ?? 'Addressify' : 'Tem vận đơn'}
        </div>
        <div className="text-xs font-medium text-slate-500">#{previewAddress.ghnWardCode ?? '21001'}</div>
      </div>

      <div className="space-y-3 px-4 py-4 text-sm">
        {template.showSenderInfo && (
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Người gửi</p>
            <p className="text-sm font-semibold text-slate-800">Shop Addressify</p>
            <p className="text-xs text-slate-600">
              {previewSender.pickAddress}, {previewSender.pickDistrict}, {previewSender.pickProvince}
            </p>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Người nhận</p>
          <p className="text-sm font-semibold text-slate-900">Khách hàng demo</p>
          <p className="text-xs text-slate-600">{previewAddress.normalizedAddress ?? previewAddress.original}</p>
          {template.showRecipientPhone && (
            <p className="mt-1 text-xs font-medium text-slate-700">📞 09xx xxx xxx</p>
          )}
        </div>

        {template.showGhIds && (
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-600">
            <div className="rounded border border-dashed border-slate-300 p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-slate-400">Province</p>
              <p className="text-sm font-semibold text-slate-800">{previewAddress.ghnProvinceId ?? '--'}</p>
            </div>
            <div className="rounded border border-dashed border-slate-300 p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-slate-400">District</p>
              <p className="text-sm font-semibold text-slate-800">{previewAddress.ghnDistrictId ?? '--'}</p>
            </div>
            <div className="rounded border border-dashed border-slate-300 p-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-slate-400">Ward</p>
              <p className="text-sm font-semibold text-slate-800">{previewAddress.ghnWardCode ?? '--'}</p>
            </div>
          </div>
        )}

        {template.showCodAmount && (
          <div className="rounded-lg bg-slate-900 text-white p-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-300">Thu hộ (COD)</p>
            <p className="text-2xl font-bold">₫ 250.000</p>
          </div>
        )}

        {template.showNotes && (
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Ghi chú</p>
            <p className="text-xs text-slate-700">{template.notePlaceholder}</p>
          </div>
        )}

        {template.showBarcode && (
          <div className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 py-3">
            <div className="h-10 w-40 bg-gradient-to-r from-black via-white to-black opacity-70" />
            <p className="text-[10px] font-mono tracking-[0.3em] text-slate-500">AA123456789VN</p>
          </div>
        )}

        {template.showQr && (
          <div className="flex items-center justify-center rounded-lg border border-slate-200 py-3">
            <div className="h-20 w-20 rounded bg-gradient-to-br from-slate-800 to-slate-600 opacity-80" />
          </div>
        )}
      </div>
    </div>
  )
}
