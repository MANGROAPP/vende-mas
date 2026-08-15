import { LINES, LineCode, Quota, Rejection, Sale } from "./types";

export interface PeriodConfig {
  year: number;
  month: number; // 1-12
  businessDaysTotal: number;
  businessDaysElapsed: number;
}

export function grossOf(sales: Sale[]): number {
  return sales
    .filter((s) => s.status !== "anulada")
    .reduce((sum, s) => sum + s.grossTotal, 0);
}

export function rejectedOf(rejections: Rejection[]): number {
  return rejections.reduce((sum, r) => sum + r.totalAmount, 0);
}

export function netOf(sales: Sale[], rejections: Rejection[]): number {
  return grossOf(sales) - rejectedOf(rejections);
}

export function rejectionRate(gross: number, rejected: number): number {
  if (gross <= 0) return 0;
  return (rejected / gross) * 100;
}

export function quotaTotal(quotas: Quota[]): number {
  return quotas.reduce((sum, q) => sum + q.amount, 0);
}

export function complianceRate(net: number, quota: number): number {
  if (quota <= 0) return 0;
  return (net / quota) * 100;
}

export function gap(net: number, quota: number): number {
  return Math.max(quota - net, 0);
}

export function avgDailyNet(net: number, businessDaysElapsed: number): number {
  if (businessDaysElapsed <= 0) return 0;
  return net / businessDaysElapsed;
}

export function dailyNeed(net: number, quota: number, businessDaysRemaining: number): number {
  const remaining = quota - net;
  if (remaining <= 0) return 0;
  if (businessDaysRemaining <= 0) return remaining;
  return remaining / businessDaysRemaining;
}

export function projection(net: number, avgDaily: number, businessDaysRemaining: number): number {
  return net + avgDaily * businessDaysRemaining;
}

export function ticketAvg(net: number, saleCount: number): number {
  if (saleCount <= 0) return 0;
  return net / saleCount;
}

export type ComplianceStatus = "en_meta" | "en_riesgo" | "critico";

export function statusFromProjection(projected: number, quota: number): ComplianceStatus {
  if (quota <= 0) return "en_meta";
  const ratio = projected / quota;
  if (ratio >= 1) return "en_meta";
  if (ratio >= 0.85) return "en_riesgo";
  return "critico";
}

export function byLine(sales: Sale[], rejections: Rejection[], quotas: Quota[]) {
  return LINES.map((line) => {
    const lineGross = sales
      .filter((s) => s.status !== "anulada")
      .reduce((sum, s) => {
        const detail = s.details.find((d) => d.lineId === line.id);
        return sum + (detail?.amount ?? 0);
      }, 0);
    const lineRejected = rejections.reduce((sum, r) => {
      const detail = r.details.find((d) => d.lineId === line.id);
      return sum + (detail?.amount ?? 0);
    }, 0);
    const lineNet = lineGross - lineRejected;
    const lineQuota = quotas
      .filter((q) => q.lineId === line.id)
      .reduce((sum, q) => sum + q.amount, 0);
    return {
      line,
      gross: lineGross,
      rejected: lineRejected,
      net: lineNet,
      quota: lineQuota,
      compliance: complianceRate(lineNet, lineQuota),
      rejectionRate: rejectionRate(lineGross, lineRejected),
    };
  });
}

export function daysSinceLastPurchase(lastSaleDateISO: string | null, todayISO: string): number | null {
  if (!lastSaleDateISO) return null;
  const last = new Date(lastSaleDateISO).getTime();
  const today = new Date(todayISO).getTime();
  return Math.round((today - last) / (1000 * 60 * 60 * 24));
}

export function currency(value: number): string {
  return `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function percent(value: number): string {
  return `${value.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}
