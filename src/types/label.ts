export type LabelPaperSize = 'A6' | 'A5' | 'LETTER' | 'LABEL_100x150'
export type LabelOrientation = 'portrait' | 'landscape'

export interface LabelTemplateConfig {
  id: string
  name: string
  description?: string
  paperSize: LabelPaperSize
  orientation: LabelOrientation
  columns: 1 | 2 | 3
  logoText?: string
  accentColor: string
  fontFamily: string
  showLogo: boolean
  showSenderInfo: boolean
  showRecipientPhone: boolean
  showGhIds: boolean
  showNotes: boolean
  showBarcode: boolean
  showQr: boolean
  showCodAmount: boolean
  notePlaceholder: string
}

export interface LabelTemplateState {
  templates: LabelTemplateConfig[]
  activeTemplateId: string
}
