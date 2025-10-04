import type { AddressData } from '@/types/address';

export interface QuoteData {
  provider: string;
  amount?: number;
  service?: string;
  days?: number | null;
  error?: string;
}

export interface BulkQuoteResult {
  address: AddressData;
  quotes: QuoteData[];
}

/**
 * Export addresses to CSV format
 */
export function exportAddressesToCSV(addresses: AddressData[]): string {
  const headers = [
    'Địa chỉ gốc',
    'Địa chỉ chuẩn hóa',
    'Số nhà',
    'Tên đường',
    'Phường/Xã',
    'Quận/Huyện',
    'Tỉnh/TP',
    'GHN Province ID',
    'GHN District ID',
    'GHN Ward Code',
    'Confidence Province',
    'Confidence District',
    'Confidence Ward'
  ];

  const rows = addresses.map(addr => [
    escapeCSV(addr.original),
    escapeCSV(addr.normalizedAddress || ''),
    escapeCSV(addr.streetNumber || ''),
    escapeCSV(addr.streetName || ''),
    escapeCSV(addr.ward || ''),
    escapeCSV(addr.district || ''),
    escapeCSV(addr.province || ''),
    addr.ghnProvinceId || '',
    addr.ghnDistrictId || '',
    addr.ghnWardCode || '',
    addr.matchConfidence?.province ? (addr.matchConfidence.province * 100).toFixed(0) + '%' : '',
    addr.matchConfidence?.district ? (addr.matchConfidence.district * 100).toFixed(0) + '%' : '',
    addr.matchConfidence?.ward ? (addr.matchConfidence.ward * 100).toFixed(0) + '%' : ''
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Export bulk quotes to CSV format
 */
export function exportBulkQuotesToCSV(results: BulkQuoteResult[]): string {
  const headers = [
    'Địa chỉ',
    'GHN Province ID',
    'GHN District ID',
    'GHN Ward Code',
    'Provider',
    'Service',
    'Phí vận chuyển (₫)',
    'Thời gian giao (ngày)',
    'Lỗi'
  ];

  const rows: string[][] = [];

  for (const result of results) {
    if (result.quotes.length === 0) {
      // No quotes - show address with empty data
      rows.push([
        escapeCSV(result.address.normalizedAddress || result.address.original),
        result.address.ghnProvinceId?.toString() || '',
        result.address.ghnDistrictId?.toString() || '',
        result.address.ghnWardCode || '',
        '',
        '',
        '',
        '',
        'Không có báo giá'
      ]);
    } else {
      // Multiple quotes for same address
      for (const quote of result.quotes) {
        rows.push([
          escapeCSV(result.address.normalizedAddress || result.address.original),
          result.address.ghnProvinceId?.toString() || '',
          result.address.ghnDistrictId?.toString() || '',
          result.address.ghnWardCode || '',
          quote.provider,
          quote.service || '',
          // Export as plain number for Excel compatibility (no thousand separators)
          quote.amount ? quote.amount.toString() : '',
          quote.days !== null && quote.days !== undefined ? quote.days.toString() : '',
          quote.error || ''
        ]);
      }
    }
  }

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSV(value: string): string {
  if (!value) return '';
  
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}
