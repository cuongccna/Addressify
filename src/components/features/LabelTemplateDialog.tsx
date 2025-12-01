'use client';

import { useEffect, useMemo, useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { cn } from '@/utils/cn'
import type { LabelTemplateConfig, LabelTemplateState } from '@/types/label'
import type { SenderConfig } from './SenderConfigDialog'
import { LabelTemplatePreview } from './LabelTemplatePreview'
import {
  LABEL_TEMPLATE_PRESETS,
  getActiveLabelTemplate,
  removeLabelTemplate,
  resetLabelTemplates,
  upsertLabelTemplate
} from '@/utils/labelTemplates'

interface LabelTemplateDialogProps {
  state: LabelTemplateState
  sender?: SenderConfig
  onSave: (state: LabelTemplateState) => void
  onClose: () => void
}

const PAPER_SIZE_OPTIONS = [
  { value: 'A6', label: 'A6 (105×148mm)' },
  { value: 'A5', label: 'A5 (148×210mm)' },
  { value: 'LETTER', label: 'Letter (8.5×11 inch)' },
  { value: 'LABEL_100x150', label: 'Tem 100×150mm' }
] as const

const ORIENTATION_OPTIONS = [
  { value: 'portrait', label: 'Dọc' },
  { value: 'landscape', label: 'Ngang' }
] as const

const DISPLAY_TOGGLES: Array<{
  key: keyof Pick<
    LabelTemplateConfig,
    'showLogo' | 'showSenderInfo' | 'showRecipientPhone' | 'showGhIds' | 'showNotes' | 'showBarcode' | 'showQr' | 'showCodAmount'
  >
  label: string
}> = [
  { key: 'showLogo', label: 'Hiển thị logo/tiêu đề' },
  { key: 'showSenderInfo', label: 'Hiển thị người gửi' },
  { key: 'showRecipientPhone', label: 'Hiển thị số điện thoại nhận' },
  { key: 'showGhIds', label: 'Hiển thị GHN IDs' },
  { key: 'showNotes', label: 'Ô ghi chú' },
  { key: 'showBarcode', label: 'Barcode' },
  { key: 'showQr', label: 'QR code' },
  { key: 'showCodAmount', label: 'Dòng COD / Thu hộ' }
]

export function LabelTemplateDialog({ state, sender, onSave, onClose }: LabelTemplateDialogProps) {
  const [draft, setDraft] = useState<LabelTemplateState>(state)

  useEffect(() => {
    setDraft(state)
  }, [state])

  const activeTemplate = useMemo(() => getActiveLabelTemplate(draft), [draft])

  const handleTemplateSelect = (templateId: string) => {
    setDraft((prev) => ({ ...prev, activeTemplateId: templateId }))
  }

  const handleTemplateChange = (changes: Partial<LabelTemplateConfig>) => {
    setDraft((prev) => ({
      ...prev,
      templates: prev.templates.map((tpl) =>
        tpl.id === prev.activeTemplateId ? { ...tpl, ...changes } : tpl
      )
    }))
  }

  const handleDuplicate = () => {
    const template = activeTemplate
    if (!template) return

    const newTemplate: LabelTemplateConfig = {
      ...template,
      id: `${template.id}-${Date.now()}`,
      name: `${template.name} (copy)`
    }

    setDraft((prev) => upsertLabelTemplate(prev, newTemplate))
  }

  const handlePresetApply = (preset: LabelTemplateConfig) => {
    setDraft((prev) => upsertLabelTemplate(prev, preset))
  }

  const handleDelete = () => {
    if (draft.templates.length === 1) return
    setDraft((prev) => removeLabelTemplate(prev, prev.activeTemplateId))
  }

  const handleReset = () => {
    setDraft(resetLabelTemplates())
  }

  const handleSubmit = () => {
    onSave(draft)
    onClose()
  }

  if (!activeTemplate) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card glass padding="lg" className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Template in tem vận đơn</h3>
              <p className="text-sm text-slate-400">Tùy chỉnh layout, màu sắc và thông tin hiển thị khi in tem hàng loạt.</p>
            </div>
            <button className="text-slate-400 hover:text-white" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Templates</p>
                  <button
                    className="text-xs text-sky-400 hover:text-sky-300"
                    onClick={() => handlePresetApply(LABEL_TEMPLATE_PRESETS[0])}
                  >
                    + Thêm template mặc định
                  </button>
                </div>
                <div className="space-y-2">
                  {draft.templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleTemplateSelect(tpl.id)}
                      className={cn(
                        'w-full rounded-xl border px-3 py-2 text-left text-sm transition',
                        tpl.id === draft.activeTemplateId
                          ? 'border-sky-500/60 bg-sky-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      )}
                    >
                      <p className="font-semibold">{tpl.name}</p>
                      {tpl.description && <p className="text-xs text-slate-400">{tpl.description}</p>}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleDuplicate}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 hover:border-slate-500"
                  >
                    Nhân bản
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:border-red-400 disabled:opacity-40"
                    disabled={draft.templates.length === 1}
                  >
                    Xóa
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 hover:border-amber-400"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Presets</p>
                <div className="space-y-2">
                  {LABEL_TEMPLATE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetApply(preset)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-left text-xs text-slate-300 hover:border-slate-700"
                    >
                      <p className="font-semibold text-white">{preset.name}</p>
                      <p className="text-[11px] text-slate-400">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Tên template</label>
                    <input
                      value={activeTemplate.name}
                      onChange={(e) => handleTemplateChange({ name: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Mô tả</label>
                    <input
                      value={activeTemplate.description ?? ''}
                      onChange={(e) => handleTemplateChange({ description: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Khổ giấy</label>
                    <select
                      value={activeTemplate.paperSize}
                      onChange={(e) => handleTemplateChange({ paperSize: e.target.value as LabelTemplateConfig['paperSize'] })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                    >
                      {PAPER_SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-900">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Hướng</label>
                    <select
                      value={activeTemplate.orientation}
                      onChange={(e) => handleTemplateChange({ orientation: e.target.value as LabelTemplateConfig['orientation'] })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                    >
                      {ORIENTATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-900">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Số cột</label>
                    <input
                      type="number"
                      min={1}
                      max={3}
                      value={activeTemplate.columns}
                      onChange={(e) => handleTemplateChange({ columns: Math.min(3, Math.max(1, Number(e.target.value) || 1)) as LabelTemplateConfig['columns'] })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Logo / Tiêu đề</label>
                    <input
                      value={activeTemplate.logoText ?? ''}
                      onChange={(e) => handleTemplateChange({ logoText: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Màu nhấn</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeTemplate.accentColor}
                        onChange={(e) => handleTemplateChange({ accentColor: e.target.value })}
                        className="h-10 w-12 rounded border border-slate-800 bg-transparent"
                      />
                      <input
                        value={activeTemplate.accentColor}
                        onChange={(e) => handleTemplateChange({ accentColor: e.target.value })}
                        className="flex-1 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Font</label>
                    <input
                      value={activeTemplate.fontFamily}
                      onChange={(e) => handleTemplateChange({ fontFamily: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Ghi chú mặc định</label>
                  <textarea
                    value={activeTemplate.notePlaceholder}
                    onChange={(e) => handleTemplateChange({ notePlaceholder: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                    rows={2}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {DISPLAY_TOGGLES.map((toggle) => (
                    <label key={toggle.key} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={Boolean(activeTemplate[toggle.key])}
                        onChange={(e) => handleTemplateChange({ [toggle.key]: e.target.checked } as Partial<LabelTemplateConfig>)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                      />
                      {toggle.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Preview</p>
                <div className="flex flex-wrap gap-6">
                  <LabelTemplatePreview template={activeTemplate} sender={sender} compact />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>
                  Hủy
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                  Lưu template
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
