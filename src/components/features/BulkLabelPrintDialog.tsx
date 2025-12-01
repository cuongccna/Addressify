'use client';

import { useEffect, useMemo, useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import type { AddressData } from '@/types/address'
import type { LabelTemplateConfig, LabelTemplateState } from '@/types/label'
import type { SenderConfig } from './SenderConfigDialog'
import { getActiveLabelTemplate } from '@/utils/labelTemplates'
import { LabelTemplatePreview } from './LabelTemplatePreview'
import { cn } from '@/utils/cn'

interface BulkLabelPrintDialogProps {
  addresses: AddressData[]
  templateState: LabelTemplateState
  sender?: SenderConfig
  shopName?: string | null
  onClose: () => void
}

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

const DEFAULT_SENDER: SenderConfig = {
  pickAddress: '19 Nguyễn Trãi',
  pickDistrict: 'Quận 1',
  pickProvince: 'TP.HCM',
  ghnProvinceId: 202,
  ghnDistrictId: 1454,
  ghnWardCode: '21001'
}

export function BulkLabelPrintDialog({ addresses, templateState, sender, shopName, onClose }: BulkLabelPrintDialogProps) {
  const template = useMemo(() => getActiveLabelTemplate(templateState), [templateState])
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(() => {
    const initial = new Set<number>()
    addresses.forEach((addr, idx) => {
      if (addr.isValid) {
        initial.add(idx)
      }
    })
    return initial
  })
  const firstValidIndex = useMemo(() => {
    const idx = addresses.findIndex((addr) => addr.isValid)
    return idx === -1 ? 0 : idx
  }, [addresses])
  const [highlightIndex, setHighlightIndex] = useState(firstValidIndex)

  useEffect(() => {
    setHighlightIndex(firstValidIndex)
  }, [firstValidIndex])

  const headline = `${selectedIndexes.size} / ${addresses.length} địa chỉ`
  const printableAddresses = useMemo(() => {
    return addresses.filter((addr, idx) => addr.isValid && selectedIndexes.has(idx))
  }, [addresses, selectedIndexes])

  const handleToggle = (index: number) => {
    setSelectedIndexes((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else if (addresses[index]?.isValid) next.add(index)
      return next
    })
  }

  const handleSelectAll = () => {
    const allSelected = printableAddresses.length === addresses.filter((a) => a.isValid).length
    if (allSelected) {
      setSelectedIndexes(new Set())
    } else {
      const next = new Set<number>()
      addresses.forEach((addr, idx) => {
        if (addr.isValid) {
          next.add(idx)
        }
      })
      setSelectedIndexes(next)
    }
  }

  const handlePrint = () => {
    if (printableAddresses.length === 0) {
      alert('Chưa chọn địa chỉ hợp lệ để in tem.')
      return
    }

    const html = buildPrintDocument({
      addresses: printableAddresses,
      template,
      sender: sender ?? DEFAULT_SENDER,
      shopName: shopName ?? 'Shop Addressify'
    })

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      alert('Không thể mở cửa sổ in. Vui lòng kiểm tra pop-up blocker.')
      return
    }

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const previewAddress = addresses[highlightIndex] && addresses[highlightIndex].isValid
    ? addresses[highlightIndex]
    : printableAddresses[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card glass padding="lg" className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">In tem vận đơn hàng loạt</h3>
              <p className="text-sm text-slate-400">{headline}</p>
            </div>
            <button className="text-slate-400 hover:text-white" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Danh sách địa chỉ</p>
                  <p className="text-xs text-slate-400">Chọn địa chỉ hợp lệ để in</p>
                </div>
                <button
                  onClick={handleSelectAll}
                  className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-slate-500"
                >
                  {selectedIndexes.size === addresses.filter((a) => a.isValid).length ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-2">In</th>
                      <th className="px-4 py-2">Khách hàng</th>
                      <th className="px-4 py-2">Địa chỉ chuẩn hóa</th>
                      <th className="px-4 py-2">GHN IDs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {addresses.map((addr, idx) => (
                      <tr
                        key={`${addr.original}-${idx}`}
                        className={cn(
                          'text-slate-200 transition hover:bg-slate-900/40',
                          highlightIndex === idx && 'bg-slate-900/60'
                        )}
                        onClick={() => {
                          setHighlightIndex(idx)
                          if (!addr.isValid) return
                        }}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            disabled={!addr.isValid}
                            checked={selectedIndexes.has(idx)}
                            onChange={() => handleToggle(idx)}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-xs">
                          <p className="font-semibold text-white">Địa chỉ #{idx + 1}</p>
                          <p className="text-slate-400">{addr.original.slice(0, 50)}{addr.original.length > 50 ? '…' : ''}</p>
                          {!addr.isValid && <span className="text-[10px] font-medium text-amber-400">Không hợp lệ</span>}
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-300">
                          {addr.normalizedAddress ?? '—'}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-400">
                          {addr.ghnProvinceId ? (
                            <div className="space-y-0.5">
                              <div>P: {addr.ghnProvinceId}</div>
                              {addr.ghnDistrictId && <div>D: {addr.ghnDistrictId}</div>}
                              {addr.ghnWardCode && <div>W: {addr.ghnWardCode}</div>}
                            </div>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Template đang dùng</p>
                    <p className="text-xs text-slate-400">{template.name}</p>
                  </div>
                  <div className="text-xs text-slate-400">
                    {template.paperSize} · {template.orientation} · {template.columns} cột
                  </div>
                </div>

                {previewAddress ? (
                  <LabelTemplatePreview template={template} address={previewAddress} sender={sender} />
                ) : (
                  <p className="text-xs text-slate-400">Chưa có địa chỉ hợp lệ để xem trước.</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-widest text-slate-500">Thông tin hiển thị</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Người gửi: {shopName ?? 'Shop Addressify'} ({(sender ?? DEFAULT_SENDER).pickDistrict})</li>
                  <li>Hiển thị GHN IDs khi có dữ liệu</li>
                  <li>Placeholder barcode/QR để in nhanh</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <p className="text-xs text-slate-400">{printableAddresses.length} tem sẽ được in</p>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={onClose}>Đóng</Button>
                  <Button variant="primary" onClick={handlePrint} disabled={printableAddresses.length === 0}>
                    In {printableAddresses.length || ''} tem
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function buildPrintDocument({
  addresses,
  template,
  sender,
  shopName
}: {
  addresses: AddressData[]
  template: LabelTemplateConfig
  sender: SenderConfig
  shopName: string
}) {
  const labelWidth = template.paperSize === 'LABEL_100x150' ? '100mm' : template.paperSize === 'A5' ? '148mm' : template.paperSize === 'LETTER' ? '120mm' : '105mm'
  const columnCount = template.columns ?? 1
  const accent = template.accentColor ?? '#0ea5e9'

  const labels = addresses
    .map((address, index) => renderLabel({ address, sender, shopName, template, accent, index: index + 1 }))
    .join('')

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charSet="utf-8" />
      <title>In tem vận đơn - ${shopName}</title>
      <style>
        @page { margin: 10mm; }
        body { font-family: ${template.fontFamily}; background: #f8fafc; margin: 0; }
        .grid { display: grid; grid-template-columns: repeat(${columnCount}, minmax(0, 1fr)); gap: 8mm; padding: 10mm; }
        .label {
          border: 1px solid #0f172a;
          border-radius: 16px;
          background: #fff;
          padding: 10px 12px;
          min-height: 140mm;
          width: ${labelWidth};
        }
        .label-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5f5; padding-bottom: 6px; margin-bottom: 8px; }
        .label-section { margin-bottom: 8px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 8px; }
        .label-section h4 { margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #475569; }
        .label-section p { margin: 2px 0; font-size: 13px; }
        .ids { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; font-family: 'Space Mono', monospace; font-size: 11px; }
        .ids div { border: 1px dashed #94a3b8; border-radius: 8px; padding: 4px; text-align: center; }
        .barcode { text-align: center; padding: 10px 0 4px; border: 1px dashed #cbd5f5; border-radius: 12px; }
        .barcode div { height: 34px; background: repeating-linear-gradient(90deg, #0f172a 0, #0f172a 3px, transparent 3px, transparent 6px); margin-bottom: 6px; }
        .footnote { font-size: 10px; color: #475569; text-align: center; margin-top: 4px; }
      </style>
    </head>
    <body>
      <div class="grid">
        ${labels}
      </div>
    </body>
  </html>`
}

function renderLabel({
  address,
  sender,
  shopName,
  template,
  accent,
  index
}: {
  address: AddressData
  sender: SenderConfig
  shopName: string
  template: LabelTemplateConfig
  accent: string
  index: number
}) {
  const safeAddress = escapeHtml(address.normalizedAddress ?? address.original)
  const ghIds = [
    { label: 'Province', value: address.ghnProvinceId ?? '—' },
    { label: 'District', value: address.ghnDistrictId ?? '—' },
    { label: 'Ward', value: address.ghnWardCode ?? '—' }
  ]

  const sections: string[] = []

  if (template.showSenderInfo) {
    sections.push(`
      <div class="label-section">
        <h4>Người gửi</h4>
        <p><strong>${escapeHtml(shopName)}</strong></p>
        <p>${escapeHtml(sender.pickAddress)}, ${escapeHtml(sender.pickDistrict)}, ${escapeHtml(sender.pickProvince)}</p>
      </div>
    `)
  }

  sections.push(`
    <div class="label-section">
      <h4>Người nhận</h4>
      <p><strong>Đơn hàng #${index}</strong></p>
      <p>${safeAddress}</p>
      ${template.showRecipientPhone ? '<p>📞 09xx xxx xxx</p>' : ''}
    </div>
  `)

  if (template.showGhIds) {
    sections.push(`
      <div class="label-section">
        <h4>GHN IDS</h4>
        <div class="ids">
          ${ghIds
            .map(
              (item) => `
              <div>
                <p style="font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:#94a3b8; margin:0;">${item.label}</p>
                <p style="font-size:14px; margin:0; font-weight:600;">${item.value}</p>
              </div>
            `
            )
            .join('')}
        </div>
      </div>
    `)
  }

  if (template.showCodAmount) {
    sections.push(`
      <div class="label-section" style="background:${accent}15;border-color:${accent}30;">
        <h4>Thu hộ (COD)</h4>
        <p style="font-size:20px;font-weight:700;color:${accent};">${currency.format(0)}</p>
      </div>
    `)
  }

  if (template.showNotes) {
    sections.push(`
      <div class="label-section">
        <h4>Ghi chú</h4>
        <p>${escapeHtml(template.notePlaceholder ?? 'Ghi chú giao hàng')}</p>
      </div>
    `)
  }

  if (template.showBarcode) {
    sections.push(`
      <div class="barcode">
        <div></div>
        <p style="font-family:'Space Mono', monospace; letter-spacing:0.4em; font-size:11px; margin:0;">AA123456789VN</p>
      </div>
    `)
  }

  if (template.showQr) {
    sections.push(`
      <div class="label-section" style="text-align:center;">
        <div style="width:80px;height:80px;margin:0 auto;border:1px solid #0f172a;border-radius:12px;background:linear-gradient(135deg,#0f172a,#475569);"></div>
        <p style="font-size:10px;color:#475569;margin-top:4px;">QR tracking</p>
      </div>
    `)
  }

  return `
    <article class="label">
      <header class="label-header" style="color:${accent};">
        <div>
          <p style="margin:0;font-weight:700;font-size:16px;">${template.showLogo ? escapeHtml(template.logoText ?? 'Addressify') : 'Tem vận đơn'}</p>
          <p style="margin:0;font-size:10px;letter-spacing:0.3em;color:#64748b;">${new Date().toLocaleString('vi-VN')}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:10px;text-transform:uppercase;color:#94a3b8;">MÃ ĐƠN</p>
          <p style="margin:0;font-family:'Space Mono', monospace;font-size:14px;">#${index.toString().padStart(4, '0')}</p>
        </div>
      </header>
      ${sections.join('')}
      <p class="footnote">${escapeHtml(shopName)} — Xử lý bởi Addressify</p>
    </article>
  `
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
