"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/AppDataContext";
import { currency, percent, rejectedOf, rejectionRate } from "@/lib/kpis";
import { LINES } from "@/lib/types";

export default function RechazosPage() {
  const { currentUser, sales, rejections, clients, branches, zones, reasons } = useAppData();
  const [zoneFilter, setZoneFilter] = useState("");
  const [lineFilter, setLineFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");

  const mySales = sales.filter((s) => currentUser?.role === "admin" || s.sellerId === currentUser?.sellerId);
  const mySaleIds = new Set(mySales.map((s) => s.id));

  const rows = useMemo(() => {
    return rejections
      .filter((r) => mySaleIds.has(r.saleId))
      .flatMap((r) => {
        const sale = sales.find((s) => s.id === r.saleId);
        const client = clients.find((c) => c.id === sale?.clientId);
        const branch = branches.find((b) => b.id === sale?.branchId);
        const zone = zones.find((z) => z.id === sale?.zoneIdSnapshot);
        return r.details.map((d) => ({
          rejection: r,
          sale,
          client,
          branch,
          zone,
          detail: d,
          reason: reasons.find((rr) => rr.id === d.reasonId),
        }));
      })
      .filter((row) => (!zoneFilter || row.zone?.id === zoneFilter))
      .filter((row) => (!lineFilter || row.detail.lineId === lineFilter))
      .filter((row) => (!reasonFilter || row.reason?.id === reasonFilter))
      .sort((a, b) => b.rejection.rejectionDate.localeCompare(a.rejection.rejectionDate));
  }, [rejections, mySaleIds, sales, clients, branches, zones, reasons, zoneFilter, lineFilter, reasonFilter]);

  const totalGross = mySales.filter((s) => s.status !== "anulada").reduce((sum, s) => sum + s.grossTotal, 0);
  const myRejections = rejections.filter((r) => mySaleIds.has(r.saleId));
  const totalRejected = rejectedOf(myRejections);
  const rate = rejectionRate(totalGross, totalRejected);
  const avgTicket = myRejections.length ? totalRejected / myRejections.length : 0;

  const reasonCounts = new Map<string, number>();
  rows.forEach((r) => {
    const key = r.reason?.name ?? "Otro";
    reasonCounts.set(key, (reasonCounts.get(key) ?? 0) + r.detail.amount);
  });
  const mainReason = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <AppShell>
      <h1 className="text-xl sm:text-2xl font-extrabold mb-5">Historial de rechazos</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="surface-card p-4"><div className="text-[11px] uppercase text-muted font-bold">Total rechazado</div><div className="text-lg font-extrabold text-pastel-redDeep">{currency(totalRejected)}</div></div>
        <div className="surface-card p-4"><div className="text-[11px] uppercase text-muted font-bold">% rechazo</div><div className="text-lg font-extrabold">{percent(rate)}</div></div>
        <div className="surface-card p-4"><div className="text-[11px] uppercase text-muted font-bold">Ticket promedio</div><div className="text-lg font-extrabold">{currency(avgTicket)}</div></div>
        <div className="surface-card p-4"><div className="text-[11px] uppercase text-muted font-bold">Motivo principal</div><div className="text-sm font-bold truncate">{mainReason?.[0] ?? "—"}</div></div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="field-input max-w-[180px]" value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}>
          <option value="">Todas las zonas</option>
          {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        <select className="field-input max-w-[180px]" value={lineFilter} onChange={(e) => setLineFilter(e.target.value)}>
          <option value="">Todas las líneas</option>
          {LINES.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select className="field-input max-w-[220px]" value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)}>
          <option value="">Todos los motivos</option>
          {reasons.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="text-left text-[11px] uppercase text-muted">
              <th className="px-4 py-3">Rechazo</th>
              <th className="px-4 py-3">Venta</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Zona</th>
              <th className="px-4 py-3">Línea</th>
              <th className="px-4 py-3">Motivo</th>
              <th className="px-4 py-3">Monto</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-pastel-redDeep">{row.rejection.correlative}</td>
                <td className="px-4 py-3">
                  <Link href={`/ventas/${row.sale?.id}`} className="font-mono text-xs font-semibold text-pastel-blueDeep">{row.sale?.correlative}</Link>
                </td>
                <td className="px-4 py-3">{row.rejection.rejectionDate.split("-").reverse().join("/")}</td>
                <td className="px-4 py-3">{row.client?.tradeName}</td>
                <td className="px-4 py-3">{row.zone?.name}</td>
                <td className="px-4 py-3">{LINES.find((l) => l.id === row.detail.lineId)?.name}</td>
                <td className="px-4 py-3">{row.reason?.name}</td>
                <td className="px-4 py-3 tabular-nums">{currency(row.detail.amount)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted text-sm">No hay rechazos con estos filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
