"use client";

import { AppShell } from "@/components/AppShell";
import { KpiCard } from "@/components/KpiCard";
import { CompliancePill } from "@/components/StatusPill";
import { useAppData } from "@/lib/AppDataContext";
import { TODAY_ISO } from "@/lib/AppDataContext";
import {
  avgDailyNet,
  byLine,
  complianceRate,
  currency,
  dailyNeed,
  daysSinceLastPurchase,
  gap,
  grossOf,
  netOf,
  percent,
  projection,
  quotaTotal,
  rejectedOf,
  rejectionRate,
  statusFromProjection,
  ticketAvg,
} from "@/lib/kpis";
import { LINES } from "@/lib/types";

const BUSINESS_DAYS_TOTAL = 25;
const BUSINESS_DAYS_ELAPSED = 10; // hasta el 14/08/2026
const BUSINESS_DAYS_REMAINING = BUSINESS_DAYS_TOTAL - BUSINESS_DAYS_ELAPSED;

export default function DashboardPage() {
  const { currentUser, sales, rejections, quotas, clients, branches, zones } = useAppData();

  const mySales = sales.filter((s) => s.sellerId === currentUser?.sellerId || currentUser?.role === "admin");
  const mySaleIds = new Set(mySales.map((s) => s.id));
  const myRejections = rejections.filter((r) => mySaleIds.has(r.saleId));
  const myQuotas = quotas.filter((q) => q.sellerId === currentUser?.sellerId || currentUser?.role === "admin");

  const gross = grossOf(mySales);
  const rejected = rejectedOf(myRejections);
  const net = netOf(mySales, myRejections);
  const quota = quotaTotal(myQuotas);
  const compliance = complianceRate(net, quota);
  const gapValue = gap(net, quota);
  const daily = avgDailyNet(net, BUSINESS_DAYS_ELAPSED);
  const need = dailyNeed(net, quota, BUSINESS_DAYS_REMAINING);
  const proj = projection(net, daily, BUSINESS_DAYS_REMAINING);
  const status = statusFromProjection(proj, quota);
  const rate = rejectionRate(gross, rejected);
  const ticket = ticketAvg(net, mySales.filter((s) => s.status !== "anulada").length);

  const lines = byLine(mySales, myRejections, myQuotas);
  const worstLine = [...lines].sort((a, b) => a.compliance - b.compliance)[0];

  // Zona con menor cumplimiento (usando venta neta de zona / promedio simple, demo)
  const zoneStats = zones.map((z) => {
    const zSales = mySales.filter((s) => s.zoneIdSnapshot === z.id);
    const zSaleIds = new Set(zSales.map((s) => s.id));
    const zRej = myRejections.filter((r) => zSaleIds.has(r.saleId));
    return { zone: z, net: netOf(zSales, zRej) };
  }).filter((z) => z.net > 0);
  const worstZone = [...zoneStats].sort((a, b) => a.net - b.net)[0];

  // Cliente con mayor % de rechazo
  const clientStats = clients.map((c) => {
    const cSales = mySales.filter((s) => s.clientId === c.id);
    const cSaleIds = new Set(cSales.map((s) => s.id));
    const cRej = myRejections.filter((r) => cSaleIds.has(r.saleId));
    const cGross = grossOf(cSales);
    const cRejected = rejectedOf(cRej);
    const lastSale = cSales.map((s) => s.saleDate).sort().pop() ?? null;
    return {
      client: c,
      gross: cGross,
      rate: rejectionRate(cGross, cRejected),
      daysSince: daysSinceLastPurchase(lastSale, TODAY_ISO),
    };
  });
  const highRejectionClient = [...clientStats].filter((c) => c.gross > 0).sort((a, b) => b.rate - a.rate)[0];
  const inactiveClient = [...clientStats].filter((c) => (c.daysSince ?? 0) >= 15).sort((a, b) => (b.daysSince ?? 0) - (a.daysSince ?? 0))[0];

  // puntos para el gráfico venta neta acumulada (demo simplificado con las ventas ordenadas por fecha)
  const sortedSales = [...mySales].filter((s) => s.status !== "anulada").sort((a, b) => a.saleDate.localeCompare(b.saleDate));
  let running = 0;
  const points = sortedSales.map((s) => {
    running += s.grossTotal;
    return running;
  });
  const maxVal = Math.max(quota, running, 1);
  const chartW = 640;
  const chartH = 200;
  const stepX = points.length > 1 ? (chartW - 60) / (points.length - 1) : 0;
  const polyline = points
    .map((v, i) => {
      const x = 40 + i * stepX;
      const y = chartH - 20 - (v / maxVal) * (chartH - 40);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold">Hola, {currentUser?.name?.split(" ")[0]} 👋</h1>
          <p className="text-sm text-inksoft">Agosto 2026 · resumen comercial al {TODAY_ISO.split("-").reverse().join("/")}</p>
        </div>
        <CompliancePill status={status} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard label="Cuota del mes" value={currency(quota)} accent="lavender" />
        <KpiCard label="Venta bruta" value={currency(gross)} accent="blue" />
        <KpiCard label="Rechazos" value={currency(rejected)} sub={`${percent(rate)} de la bruta`} accent="red" />
        <KpiCard label="Venta neta" value={currency(net)} accent="mint" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
        <KpiCard label="% Cumplimiento" value={percent(compliance)} accent="blue" progress={compliance} />
        <KpiCard label="GAP a la cuota" value={currency(gapValue)} accent="peach" />
        <KpiCard label="Necesidad diaria" value={currency(need)} sub={`${BUSINESS_DAYS_REMAINING} días hábiles restantes`} accent="yellow" />
        <KpiCard label="Proyección fin de mes" value={currency(proj)} sub={`${percent((proj / (quota || 1)) * 100)} de la cuota`} accent="mint" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
        <KpiCard label="Venta diaria promedio" value={currency(daily)} accent="lavender" />
        <KpiCard label="Ticket promedio" value={currency(ticket)} accent="pink" />
        <KpiCard label="N° de ventas" value={String(mySales.filter((s) => s.status !== "anulada").length)} accent="blue" />
        <KpiCard label="N° de rechazos" value={String(myRejections.length)} accent="red" />
      </div>

      <section className="surface-card p-5 mt-6">
        <h2 className="text-sm font-bold mb-3">Venta neta acumulada vs ruta objetivo</h2>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-52" role="img" aria-label="Venta acumulada frente a la cuota">
          <line x1="40" y1={chartH - 20} x2={chartW - 20} y2={chartH - 20} stroke="#c3c2b7" strokeWidth="1" />
          <line x1="40" y1="20" x2="40" y2={chartH - 20} stroke="#c3c2b7" strokeWidth="1" />
          <line x1="40" y1={chartH - 20} x2={chartW - 20} y2="24" stroke="#f3b899" strokeWidth="2.5" strokeDasharray="6 5" />
          {points.length > 1 && <polyline points={polyline} fill="none" stroke="#5b8fc7" strokeWidth="3" strokeLinecap="round" />}
          {points.length > 0 && (
            <circle
              cx={40 + (points.length - 1) * stepX}
              cy={chartH - 20 - (points[points.length - 1] / maxVal) * (chartH - 40)}
              r="5"
              fill="#5b8fc7"
            />
          )}
        </svg>
        <div className="flex gap-5 text-xs text-inksoft mt-1">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pastel-blueDeep" /> Venta neta acumulada</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-pastel-peachDeep" /> Ruta objetivo (cuota)</span>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold mb-3">Cumplimiento por línea</h2>
        <div className="surface-card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[11px] uppercase text-muted">
                <th className="px-4 py-3">Línea</th>
                <th className="px-4 py-3">Cuota</th>
                <th className="px-4 py-3">Bruta</th>
                <th className="px-4 py-3">Rechazos</th>
                <th className="px-4 py-3">Neta</th>
                <th className="px-4 py-3">% Cumpl.</th>
                <th className="px-4 py-3">% Rechazo</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.line.id} className="border-t border-line">
                  <td className="px-4 py-3 font-semibold">{l.line.name}</td>
                  <td className="px-4 py-3 tabular-nums">{currency(l.quota)}</td>
                  <td className="px-4 py-3 tabular-nums">{currency(l.gross)}</td>
                  <td className="px-4 py-3 tabular-nums text-pastel-redDeep">{currency(l.rejected)}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold">{currency(l.net)}</td>
                  <td className="px-4 py-3 tabular-nums">{percent(l.compliance)}</td>
                  <td className="px-4 py-3 tabular-nums">{percent(l.rejectionRate)}</td>
                  <td className="px-4 py-3"><CompliancePill status={statusFromProjection(l.net, l.quota)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold mb-3">Plan de ataque</h2>
        <div className="surface-card p-5 flex flex-col gap-3 text-sm">
          {worstLine && (
            <div className="flex items-start gap-3">
              <span className="pill bg-pastel-red text-pastel-redDeep shrink-0">Prioridad 1</span>
              <span><strong>{worstLine.line.name}</strong> — cumplimiento de {percent(worstLine.compliance)}, la línea más atrasada del mes.</span>
            </div>
          )}
          {worstZone && (
            <div className="flex items-start gap-3">
              <span className="pill bg-pastel-yellow text-pastel-yellowDeep shrink-0">Prioridad 2</span>
              <span>Zona <strong>{worstZone.zone.name}</strong> — la de menor venta neta registrada este mes.</span>
            </div>
          )}
          {inactiveClient && (
            <div className="flex items-start gap-3">
              <span className="pill bg-pastel-blue text-pastel-blueDeep shrink-0">Prioridad 3</span>
              <span><strong>{inactiveClient.client.tradeName}</strong> — {inactiveClient.daysSince} días sin comprar, revisar si necesita visita.</span>
            </div>
          )}
          {highRejectionClient && highRejectionClient.rate > 0 && (
            <div className="flex items-start gap-3">
              <span className="pill bg-pastel-peach text-pastel-peachDeep shrink-0">Prioridad 4</span>
              <span><strong>{highRejectionClient.client.tradeName}</strong> — % de rechazo de {percent(highRejectionClient.rate)}, por encima del promedio.</span>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
