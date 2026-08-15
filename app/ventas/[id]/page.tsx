"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SaleStatusPill } from "@/components/StatusPill";
import { useAppData } from "@/lib/AppDataContext";
import { TODAY_ISO } from "@/lib/AppDataContext";
import { currency, percent, rejectionRate } from "@/lib/kpis";
import { LINES, LineCode } from "@/lib/types";

export default function VentaDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, sales, rejections, clients, branches, zones, reasons, addRejection, cancelSale, saldoDisponible } = useAppData();

  const sale = sales.find((s) => s.id === params.id);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [rejDate, setRejDate] = useState(TODAY_ISO);
  const [rejLine, setRejLine] = useState<LineCode>("nestle");
  const [rejAmount, setRejAmount] = useState("");
  const [rejReason, setRejReason] = useState(reasons[0]?.id ?? "");
  const [rejObs, setRejObs] = useState("");
  const [rejError, setRejError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  if (!sale) {
    return (
      <AppShell>
        <p className="text-sm text-muted">Venta no encontrada.</p>
      </AppShell>
    );
  }

  const client = clients.find((c) => c.id === sale.clientId);
  const branch = branches.find((b) => b.id === sale.branchId);
  const zone = zones.find((z) => z.id === sale.zoneIdSnapshot);
  const saleRejections = rejections.filter((r) => r.saleId === sale.id).sort((a, b) => a.rejectionDate.localeCompare(b.rejectionDate));
  const totalRejected = saleRejections.reduce((sum, r) => sum + r.totalAmount, 0);
  const net = sale.grossTotal - totalRejected;
  const disponible = saldoDisponible(sale.id);
  const rate = rejectionRate(sale.grossTotal, totalRejected);

  const handleAddRejection = (e: React.FormEvent) => {
    e.preventDefault();
    setRejError(null);
    const amount = parseFloat(rejAmount) || 0;
    if (amount <= 0 || !currentUser) return;
    const result = addRejection({
      saleId: sale.id,
      rejectionDate: rejDate,
      details: [{ lineId: rejLine, amount, reasonId: rejReason, observation: rejObs || undefined }],
      createdBy: currentUser.id,
    });
    if (!result.ok) {
      setRejError(result.error ?? "No se pudo registrar el rechazo.");
      return;
    }
    setShowRejectionForm(false);
    setRejAmount("");
    setRejObs("");
  };

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim() || !currentUser) return;
    cancelSale(sale.id, cancelReason.trim(), currentUser.name);
    setShowCancelForm(false);
    router.push("/ventas");
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-mono">{sale.correlative}</h1>
          <p className="text-sm text-inksoft">{client?.businessName} · {branch?.name} · Zona {zone?.name}</p>
        </div>
        <SaleStatusPill status={sale.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="surface-card p-4"><div className="text-[11px] uppercase text-muted font-bold">Venta original</div><div className="text-xl font-extrabold">{currency(sale.grossTotal)}</div></div>
        <div className="surface-card p-4"><div className="text-[11px] uppercase text-muted font-bold">Rechazado</div><div className="text-xl font-extrabold text-pastel-redDeep">{currency(totalRejected)}</div><div className="text-xs text-muted mt-0.5">{percent(rate)} de la venta</div></div>
        <div className="surface-card p-4"><div className="text-[11px] uppercase text-muted font-bold">Venta neta</div><div className="text-xl font-extrabold text-pastel-mintDeep">{currency(net)}</div></div>
      </div>

      <div className="surface-card p-5 mb-6">
        <h2 className="text-sm font-bold mb-3">Detalle por línea</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase text-muted"><th className="py-2">Línea</th><th className="py-2">Monto</th></tr></thead>
          <tbody>
            {sale.details.map((d) => (
              <tr key={d.lineId} className="border-t border-line">
                <td className="py-2">{LINES.find((l) => l.id === d.lineId)?.name}</td>
                <td className="py-2 tabular-nums">{currency(d.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">Rechazos asociados ({saleRejections.length})</h2>
        <div className="flex gap-2">
          {sale.status !== "anulada" && (
            <button className="btn-danger" onClick={() => setShowRejectionForm((v) => !v)} disabled={disponible <= 0}>
              + Registrar rechazo
            </button>
          )}
        </div>
      </div>

      {disponible <= 0 && sale.status !== "anulada" && (
        <p className="text-xs text-muted mb-3">Esta venta ya no tiene saldo disponible para nuevos rechazos.</p>
      )}

      {showRejectionForm && (
        <form onSubmit={handleAddRejection} className="surface-card p-5 mb-5 flex flex-col gap-4">
          <div className="text-xs text-muted">Saldo disponible para rechazar: <strong>{currency(disponible)}</strong></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Fecha</label>
              <input type="date" className="field-input" value={rejDate} onChange={(e) => setRejDate(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Línea</label>
              <select className="field-input" value={rejLine} onChange={(e) => setRejLine(e.target.value as LineCode)}>
                {LINES.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Importe rechazado</label>
              <input type="number" min={0} step="0.01" className="field-input" value={rejAmount} onChange={(e) => setRejAmount(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Motivo</label>
              <select className="field-input" value={rejReason} onChange={(e) => setRejReason(e.target.value)}>
                {reasons.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="field-label">Observación (opcional)</label>
            <input className="field-input" value={rejObs} onChange={(e) => setRejObs(e.target.value)} />
          </div>
          {rejError && <p className="text-xs font-semibold text-pastel-redDeep">{rejError}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn-danger">Guardar rechazo</button>
            <button type="button" className="btn-secondary" onClick={() => setShowRejectionForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="surface-card overflow-x-auto mb-6">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-[11px] uppercase text-muted">
              <th className="px-4 py-3">Rechazo</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Línea</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Motivo</th>
              <th className="px-4 py-3">Observación</th>
            </tr>
          </thead>
          <tbody>
            {saleRejections.flatMap((r) =>
              r.details.map((d, i) => (
                <tr key={`${r.id}-${i}`} className="border-t border-line">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-pastel-redDeep">{r.correlative}</td>
                  <td className="px-4 py-3">{r.rejectionDate.split("-").reverse().join("/")}</td>
                  <td className="px-4 py-3">{LINES.find((l) => l.id === d.lineId)?.name}</td>
                  <td className="px-4 py-3 tabular-nums">{currency(d.amount)}</td>
                  <td className="px-4 py-3">{reasons.find((rr) => rr.id === d.reasonId)?.name}</td>
                  <td className="px-4 py-3 text-inksoft">{d.observation ?? "—"}</td>
                </tr>
              ))
            )}
            {saleRejections.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted text-sm">Sin rechazos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {currentUser?.role === "admin" && sale.status !== "anulada" && (
        <div className="border-t border-line pt-5">
          {!showCancelForm ? (
            <button className="text-xs font-semibold text-pastel-redDeep" onClick={() => setShowCancelForm(true)}>
              Anular esta venta…
            </button>
          ) : (
            <form onSubmit={handleCancel} className="surface-card p-5 flex flex-col gap-3 max-w-md">
              <label className="field-label">Motivo de anulación (obligatorio)</label>
              <input className="field-input" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} required />
              <div className="flex gap-2">
                <button type="submit" className="btn-danger">Confirmar anulación</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCancelForm(false)}>Volver</button>
              </div>
            </form>
          )}
        </div>
      )}
      {sale.status === "anulada" && (
        <div className="text-xs text-muted">Venta anulada. Motivo: {sale.cancelReason}</div>
      )}
    </AppShell>
  );
}
