import type { LabelTemplateConfig, LabelTemplateState } from '@/types/label'

const STORAGE_KEY = 'label-templates-v1'

export const DEFAULT_LABEL_TEMPLATE: LabelTemplateConfig = {
  id: 'default-a6',
  name: 'Tem A6 dọc',
  description: 'Khổ A6 in 2 tem mỗi trang, hiển thị đầy đủ thông tin người gửi/nhận',
  paperSize: 'A6',
  orientation: 'portrait',
  columns: 2,
  logoText: 'Addressify',
  accentColor: '#38bdf8',
  fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
  showLogo: true,
  showSenderInfo: true,
  showRecipientPhone: true,
  showGhIds: true,
  showNotes: true,
  showBarcode: true,
  showQr: false,
  showCodAmount: true,
  notePlaceholder: 'Hàng dễ vỡ, vui lòng nhẹ tay'
}

export const LABEL_TEMPLATE_PRESETS: LabelTemplateConfig[] = [
  DEFAULT_LABEL_TEMPLATE,
  {
    id: 'label-100x150',
    name: 'Tem 100x150mm',
    description: 'Khổ tem chuẩn máy in nhiệt 100x150mm, font lớn dễ đọc',
    paperSize: 'LABEL_100x150',
    orientation: 'portrait',
    columns: 1,
    logoText: 'Addressify Express',
    accentColor: '#f97316',
    fontFamily: 'Space Grotesk, "Segoe UI", sans-serif',
    showLogo: true,
    showSenderInfo: true,
    showRecipientPhone: true,
    showGhIds: true,
    showNotes: false,
    showBarcode: true,
    showQr: true,
    showCodAmount: true,
    notePlaceholder: 'Kiểm tra hàng trước khi nhận'
  },
  {
    id: 'compact-a6',
    name: 'Tem gọn nhẹ',
    description: 'Ẩn bớt thông tin, phù hợp in nhanh nội bộ',
    paperSize: 'A6',
    orientation: 'landscape',
    columns: 2,
    logoText: 'Addressify',
    accentColor: '#c084fc',
    fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
    showLogo: false,
    showSenderInfo: false,
    showRecipientPhone: false,
    showGhIds: true,
    showNotes: false,
    showBarcode: false,
    showQr: false,
    showCodAmount: true,
    notePlaceholder: 'Ghi chú'
  }
]

function createFallbackState(): LabelTemplateState {
  return {
    templates: LABEL_TEMPLATE_PRESETS,
    activeTemplateId: DEFAULT_LABEL_TEMPLATE.id
  }
}

export function loadLabelTemplates(): LabelTemplateState {
  if (typeof window === 'undefined') {
    return createFallbackState()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return createFallbackState()
    }
    const parsed = JSON.parse(raw) as LabelTemplateState
    if (!parsed.templates?.length) {
      return createFallbackState()
    }
    return {
      templates: parsed.templates,
      activeTemplateId: parsed.activeTemplateId || parsed.templates[0].id
    }
  } catch (error) {
    console.warn('[labelTemplates] Failed to parse storage, resetting...', error)
    return createFallbackState()
  }
}

export function saveLabelTemplates(state: LabelTemplateState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function getActiveLabelTemplate(state: LabelTemplateState): LabelTemplateConfig {
  const active = state.templates.find((tpl) => tpl.id === state.activeTemplateId)
  return active || state.templates[0] || DEFAULT_LABEL_TEMPLATE
}

export function upsertLabelTemplate(
  state: LabelTemplateState,
  template: LabelTemplateConfig
): LabelTemplateState {
  const exists = state.templates.some((tpl) => tpl.id === template.id)
  const templates = exists
    ? state.templates.map((tpl) => (tpl.id === template.id ? template : tpl))
    : [...state.templates, template]

  return {
    templates,
    activeTemplateId: template.id
  }
}

export function removeLabelTemplate(state: LabelTemplateState, templateId: string): LabelTemplateState {
  const templates = state.templates.filter((tpl) => tpl.id !== templateId)
  if (templates.length === 0) {
    return createFallbackState()
  }

  return {
    templates,
    activeTemplateId: templates[0].id
  }
}

export function resetLabelTemplates(): LabelTemplateState {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY)
  }
  return createFallbackState()
}
