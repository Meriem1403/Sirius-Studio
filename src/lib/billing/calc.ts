import type { BillingLineItem } from '../auth/types'

export const DEFAULT_VAT_RATE = 20

export function lineTotalHT(line: BillingLineItem) {
  return Math.round(line.quantity * line.unitPriceHT * 100) / 100
}

export function lineTVA(line: BillingLineItem) {
  return Math.round(lineTotalHT(line) * (line.vatRate / 100) * 100) / 100
}

export function computeTotals(lines: BillingLineItem[]) {
  const totalHT = Math.round(lines.reduce((s, l) => s + lineTotalHT(l), 0) * 100) / 100
  const totalTVA = Math.round(lines.reduce((s, l) => s + lineTVA(l), 0) * 100) / 100
  return { totalHT, totalTVA, totalTTC: Math.round((totalHT + totalTVA) * 100) / 100 }
}

export function newLineItem(partial?: Partial<BillingLineItem>): BillingLineItem {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    label: partial?.label ?? 'Prestation',
    description: partial?.description,
    quantity: partial?.quantity ?? 1,
    unitPriceHT: partial?.unitPriceHT ?? 0,
    vatRate: partial?.vatRate ?? DEFAULT_VAT_RATE,
  }
}
