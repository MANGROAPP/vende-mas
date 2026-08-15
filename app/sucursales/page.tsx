"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/AppDataContext";
import { currency, netOf } from "@/lib/kpis";

export default function SucursalesPage() {
  const { currentUser, clients, branches, zones, sales, rejections, addBranch } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const myClients = clients.filter((c) => currentUser?.role === "admin" || c.sellerId === currentUser?.sellerId);
  const [form, setForm] = useState({ clientId: myClients[0]?.id ?? "", zoneId: zones[0]?.id ?? "", name: "", address: "" });

  const myBranchIds = new Set(myClients.map((c) => c.id));
  const rows = branches
    .filter((b) => myBranchIds.has(b.clientId))
    .map((b) => {
      const client = clients.find((c) => c.id === b.clientId);
      const zone = zones.find((z) => z.id === b.zoneId);
      const bSales = sales.filter((s) => s.branchId === b.id);
      const bSaleIds = new Set(bSales.map((s) => s.id));
      const bRej = rejections.filter((r) => bSaleIds.has(r.saleId));
      const net = netOf(bSales, bRej);
      const lastSale = bSales.map((s) => s.saleDate).sort().pop();
      return { branch: b, client, zone, net, lastSale };
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.zoneId || !form.name) return;
    addBranch({ clientId: form.clientId, zoneId: form.zoneId, name: form.name, address: form.address, status: "activa" });
    setForm({ clientId: myClients[0]?.id ?? "", zoneId: zones[0]?.id ?? "", name: "", address: "" });
    setShowForm(false);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold">Sucursales</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>+ Nueva sucursal</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="surface-card p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Cliente</label>
            <select className="field-input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              {myClients.map((c) => <option key={c.id} value={c.id}>{c.businessName}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Zona</label>
            <select className="field-input" value={form.zoneId} onChange={(e) => setForm({ ...form, zoneId: e.target.value })}>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
          <div><label className="field-label">Nombre de sucursal</label><input required className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="field-label">Dirección</label><input className="field-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary">Guardar sucursal</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-[11px] uppercase text-muted">
              <th className="px-4 py-3">Sucursal</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Zona</th>
              <th className="px-4 py-3">Venta neta</th>
              <th className="px-4 py-3">Última compra</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ branch, client, zone, net, lastSale }) => (
              <tr key={branch.id} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{branch.name}</td>
                <td className="px-4 py-3">{client?.tradeName}</td>
                <td className="px-4 py-3">{zone?.name}</td>
                <td className="px-4 py-3 tabular-nums">{currency(net)}</td>
                <td className="px-4 py-3">{lastSale ? lastSale.split("-").reverse().join("/") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
