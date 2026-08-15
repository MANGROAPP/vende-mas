"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/AppDataContext";
import { currency, netOf } from "@/lib/kpis";

export default function ZonasPage() {
  const { zones, branches, clients, sales, rejections, addZone } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", description: "" });

  const rows = zones.map((z) => {
    const zBranches = branches.filter((b) => b.zoneId === z.id);
    const zClients = new Set(zBranches.map((b) => b.clientId));
    const zSales = sales.filter((s) => s.zoneIdSnapshot === z.id);
    const zSaleIds = new Set(zSales.map((s) => s.id));
    const zRej = rejections.filter((r) => zSaleIds.has(r.saleId));
    const net = netOf(zSales, zRej);
    return { zone: z, branches: zBranches.length, clients: zClients.size, sales: zSales.length, net };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    addZone({ code: form.code || form.name.slice(0, 3).toUpperCase(), name: form.name, description: form.description, status: "activa" });
    setForm({ code: "", name: "", description: "" });
    setShowForm(false);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold">Zonas</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>+ Nueva zona</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="surface-card p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="field-label">Código</label><input className="field-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="field-label">Nombre</label><input required className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="sm:col-span-3"><label className="field-label">Descripción</label><input className="field-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="sm:col-span-3 flex gap-2">
            <button type="submit" className="btn-primary">Guardar zona</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map(({ zone, branches: nb, clients: nc, sales: ns, net }) => (
          <div key={zone.id} className="surface-card p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{zone.name}</h3>
              <span className="pill bg-pastel-blue text-pastel-blueDeep">{zone.code}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-inksoft mb-2">
              <div>{nc} cliente(s)</div>
              <div>{nb} sucursal(es)</div>
              <div>{ns} venta(s)</div>
              <div className="font-semibold">{currency(net)} neto</div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
