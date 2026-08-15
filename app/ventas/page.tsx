"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SaleStatusPill } from "@/components/StatusPill";
import { useAppData } from "@/lib/AppDataContext";
import { currency, netOf } from "@/lib/kpis";

export default function VentasPage() {
  const { currentUser, sales, rejections, clients, branches } = useAppData();
  const [query, setQuery] = useState("");

  const mySales = sales.filter((s) => currentUser?.role === "admin" || s.sellerId === currentUser?.sellerId);

  const rows = useMemo(() => {
    return mySales
      .map((s) => {
        const client = clients.find((c) => c.id === s.clientId);
        const branch = branches.find((b) => b.id === s.branchId);
        const saleRejections = rejections.filter((r) => r.saleId === s.id);
        const net = netOf([s], saleRejections);
        return { sale: s, client, branch, net };
      })
      .filter((row) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          row.sale.correlative.toLowerCase().includes(q) ||
          row.client?.businessName.toLowerCase().includes(q) ||
          row.branch?.name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.sale.saleDate.localeCompare(a.sale.saleDate));
  }, [mySales, rejections, clients, branches, query]);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold">Ventas</h1>
        <Link href="/ventas/nueva" className="btn-primary">+ Nueva venta</Link>
      </div>

      <input
        className="field-input mb-4 max-w-sm"
        placeholder="Buscar por correlativo, cliente o sucursal…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="surface-card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-[11px] uppercase text-muted">
              <th className="px-4 py-3">Correlativo</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Sucursal</th>
              <th className="px-4 py-3">Bruto</th>
              <th className="px-4 py-3">Neto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ sale, client, branch, net }) => (
              <tr key={sale.id} className="border-t border-line">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-pastel-blueDeep">{sale.correlative}</td>
                <td className="px-4 py-3 tabular-nums">{sale.saleDate.split("-").reverse().join("/")}</td>
                <td className="px-4 py-3">{client?.tradeName}</td>
                <td className="px-4 py-3">{branch?.name}</td>
                <td className="px-4 py-3 tabular-nums">{currency(sale.grossTotal)}</td>
                <td className="px-4 py-3 tabular-nums font-semibold">{currency(net)}</td>
                <td className="px-4 py-3"><SaleStatusPill status={sale.status} /></td>
                <td className="px-4 py-3">
                  <Link href={`/ventas/${sale.id}`} className="text-xs font-semibold text-pastel-blueDeep">Ver →</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted text-sm">No hay ventas que coincidan con la búsqueda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
