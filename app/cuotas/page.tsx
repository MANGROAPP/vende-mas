"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/AppDataContext";
import { currency } from "@/lib/kpis";
import { LINES, LineCode } from "@/lib/types";

const YEAR = 2026;
const MONTH = 8;

export default function CuotasPage() {
  const { currentUser, sellers, quotas, setQuota } = useAppData();

  // Vendedor y administrador pueden ambos ver y editar la cuota: en esta app
  // (independiente del sistema corporativo) es el propio vendedor quien recibe
  // su meta mensual y necesita poder registrarla/ajustarla para medir su avance.
  const sellerId = currentUser?.role === "vendedor" ? currentUser.sellerId! : sellers[0]?.id;
  const seller = sellers.find((s) => s.id === sellerId);

  const [draft, setDraft] = useState<Record<LineCode, string>>(() => {
    const map: Record<string, string> = {};
    LINES.forEach((l) => {
      const q = quotas.find((qq) => qq.sellerId === sellerId && qq.year === YEAR && qq.month === MONTH && qq.lineId === l.id);
      map[l.id] = q ? String(q.amount) : "";
    });
    return map as Record<LineCode, string>;
  });
  const [saved, setSaved] = useState(false);

  const total = LINES.reduce((sum, l) => sum + (parseFloat(draft[l.id]) || 0), 0);

  const handleSave = () => {
    if (!sellerId) return;
    LINES.forEach((l) => {
      setQuota(sellerId, YEAR, MONTH, l.id, parseFloat(draft[l.id]) || 0);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <h1 className="text-xl sm:text-2xl font-extrabold mb-1">Cuotas</h1>
      <p className="text-sm text-inksoft mb-5">
        {currentUser?.role === "vendedor"
          ? "Registra aquí la cuota mensual que te fue indicada, por línea, para poder medir tu avance."
          : `Cuota de ${seller?.name} — agosto 2026.`}
      </p>

      <div className="surface-card p-5 sm:p-6 max-w-xl flex flex-col gap-4">
        <div className="text-xs font-bold uppercase text-muted">Agosto 2026</div>
        {LINES.map((line) => (
          <div key={line.id} className="flex items-center gap-3">
            <span className="w-32 text-sm font-medium shrink-0">{line.name}</span>
            <span className="text-sm text-muted">S/</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className="field-input"
              value={draft[line.id]}
              onChange={(e) => setDraft((prev) => ({ ...prev, [line.id]: e.target.value }))}
              placeholder="0.00"
            />
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm font-bold">Cuota total del mes</span>
          <span className="text-xl font-extrabold text-pastel-lavenderDeep">{currency(total)}</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={handleSave}>Guardar cuota</button>
          {saved && <span className="text-xs font-semibold text-pastel-mintDeep">Cuota guardada ✓</span>}
        </div>
      </div>
    </AppShell>
  );
}
