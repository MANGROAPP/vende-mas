"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/AppDataContext";
import { currency, daysSinceLastPurchase, grossOf, rejectionRate } from "@/lib/kpis";
import { TODAY_ISO } from "@/lib/AppDataContext";

export default function ClientesPage() {
  const { currentUser, clients, branches, sales, rejections, addClient } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ businessName: "", tradeName: "", ruc: "", phone: "", email: "", fiscalAddress: "", observations: "" });

  const myClients = clients.filter((c) => currentUser?.role === "admin" || c.sellerId === currentUser?.sellerId);

  const rows = myClients.map((c) => {
    const cBranches = branches.filter((b) => b.clientId === c.id);
    const cSales = sales.filter((s) => s.clientId === c.id);
    const cSaleIds = new Set(cSales.map((s) => s.id));
    const cRej = rejections.filter((r) => cSaleIds.has(r.saleId));
    const gross = grossOf(cSales);
    const rejected = cRej.reduce((sum, r) => sum + r.totalAmount, 0);
    const lastSale = cSales.map((s) => s.saleDate).sort().pop() ?? null;
    return {
      client: c,
      branches: cBranches.length,
      gross,
      rate: rejectionRate(gross, rejected),
      daysSince: daysSinceLastPurchase(lastSale, TODAY_ISO),
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    addClient({
      businessName: form.businessName,
      tradeName: form.tradeName || form.businessName,
      ruc: form.ruc,
      phone: form.phone,
      email: form.email,
      fiscalAddress: form.fiscalAddress,
      observations: form.observations,
      sellerId: currentUser.sellerId ?? currentUser.id,
      status: "activo",
    });
    setForm({ businessName: "", tradeName: "", ruc: "", phone: "", email: "", fiscalAddress: "", observations: "" });
    setShowForm(false);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold">Clientes</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>+ Nuevo cliente</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="surface-card p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="field-label">Razón social</label><input required className="field-input" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></div>
          <div><label className="field-label">Nombre comercial</label><input className="field-input" value={form.tradeName} onChange={(e) => setForm({ ...form, tradeName: e.target.value })} /></div>
          <div><label className="field-label">RUC</label><input className="field-input" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} /></div>
          <div><label className="field-label">Teléfono</label><input className="field-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="field-label">Email</label><input className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="field-label">Dirección fiscal</label><input className="field-input" value={form.fiscalAddress} onChange={(e) => setForm({ ...form, fiscalAddress: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="field-label">Observaciones</label><input className="field-input" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} /></div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary">Guardar cliente</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-[11px] uppercase text-muted">
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">RUC</th>
              <th className="px-4 py-3">Sucursales</th>
              <th className="px-4 py-3">Venta bruta</th>
              <th className="px-4 py-3">% rechazo</th>
              <th className="px-4 py-3">Días sin comprar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ client, branches: n, gross, rate, daysSince }) => (
              <tr key={client.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <div className="font-semibold">{client.tradeName}</div>
                  <div className="text-xs text-muted">{client.businessName}</div>
                </td>
                <td className="px-4 py-3 tabular-nums">{client.ruc}</td>
                <td className="px-4 py-3">{n}</td>
                <td className="px-4 py-3 tabular-nums">{currency(gross)}</td>
                <td className="px-4 py-3 tabular-nums">{rate.toFixed(1)}%</td>
                <td className="px-4 py-3">
                  {daysSince === null ? "—" : (
                    <span className={daysSince >= 20 ? "text-pastel-redDeep font-semibold" : ""}>{daysSince} días</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
