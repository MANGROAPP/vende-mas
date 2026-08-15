"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/AppDataContext";
import { TODAY_ISO } from "@/lib/AppDataContext";
import { currency } from "@/lib/kpis";
import { LINES, LineCode } from "@/lib/types";

export default function NuevaVentaPage() {
  const router = useRouter();
  const { currentUser, clients, branches, zones, addSale } = useAppData();

  const myClients = clients.filter((c) => currentUser?.role === "admin" || c.sellerId === currentUser?.sellerId);

  const [saleDate, setSaleDate] = useState(TODAY_ISO);
  const [clientId, setClientId] = useState(myClients[0]?.id ?? "");
  const [branchId, setBranchId] = useState("");
  const [amounts, setAmounts] = useState<Record<LineCode, string>>({
    nestle: "",
    golosinas: "",
    colgate: "",
    dkasa: "",
    philip_morris: "",
  });
  const [saved, setSaved] = useState<string | null>(null);

  const clientBranches = useMemo(() => branches.filter((b) => b.clientId === clientId), [branches, clientId]);
  const currentBranch = branches.find((b) => b.id === branchId);
  const zone = zones.find((z) => z.id === currentBranch?.zoneId);

  const total = LINES.reduce((sum, l) => sum + (parseFloat(amounts[l.id]) || 0), 0);

  const handleClientChange = (id: string) => {
    setClientId(id);
    const firstBranch = branches.find((b) => b.clientId === id);
    setBranchId(firstBranch?.id ?? "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId || total <= 0 || !currentUser) return;
    const details = LINES.map((l) => ({ lineId: l.id, amount: parseFloat(amounts[l.id]) || 0 }));
    const sale = addSale({
      saleDate,
      clientId,
      branchId,
      details,
      createdBy: currentUser.id,
      sellerId: currentUser.sellerId ?? currentUser.id,
    });
    setSaved(sale.correlative);
    setTimeout(() => router.push(`/ventas/${sale.id}`), 900);
  };

  return (
    <AppShell>
      <h1 className="text-xl sm:text-2xl font-extrabold mb-5">Nueva venta</h1>

      <form onSubmit={handleSubmit} className="surface-card p-5 sm:p-6 flex flex-col gap-5 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Fecha</label>
            <input type="date" className="field-input" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} required />
          </div>
          <div>
            <label className="field-label">Cliente</label>
            <select className="field-input" value={clientId} onChange={(e) => handleClientChange(e.target.value)} required>
              {myClients.map((c) => (
                <option key={c.id} value={c.id}>{c.businessName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Sucursal</label>
            <select className="field-input" value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
              <option value="">Selecciona una sucursal</option>
              {clientBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Zona (automática)</label>
            <div className="field-input bg-line/50 text-inksoft flex items-center justify-between">
              <span>{zone?.name ?? "—"}</span>
              <span title="Se hereda de la sucursal, no editable">🔒</span>
            </div>
          </div>
        </div>

        <div>
          <label className="field-label mb-2">Montos por línea</label>
          <div className="flex flex-col gap-2">
            {LINES.map((line) => (
              <div key={line.id} className="flex items-center gap-3">
                <span className="w-32 text-sm font-medium shrink-0">{line.name}</span>
                <span className="text-sm text-muted">S/</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  className="field-input"
                  value={amounts[line.id]}
                  onChange={(e) => setAmounts((prev) => ({ ...prev, [line.id]: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm font-bold">Total</span>
          <span className="text-xl font-extrabold text-pastel-blueDeep">{currency(total)}</span>
        </div>

        {saved ? (
          <div className="bg-pastel-mint text-pastel-mintDeep rounded-xl px-4 py-3 text-sm font-semibold text-center">
            Venta guardada — correlativo {saved}
          </div>
        ) : (
          <button type="submit" className="btn-primary self-start" disabled={!branchId || total <= 0}>
            Guardar venta
          </button>
        )}
      </form>
    </AppShell>
  );
}
