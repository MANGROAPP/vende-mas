"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/AppDataContext";
import { LINES } from "@/lib/types";

interface PreviewRow {
  businessName: string;
  tradeName: string;
  ruc: string;
  phone: string;
  email: string;
  errors: string[];
}

// Reportes y la importación/exportación en Excel están habilitados para
// TODOS los roles (vendedor y administrador): cada vendedor necesita poder
// sacar sus propios reportes y cargar su cartera de clientes sin depender
// de un administrador.
export default function ReportesPage() {
  const { currentUser, sales, rejections, clients, branches, zones, addClient } = useAppData();
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [imported, setImported] = useState<number | null>(null);

  const mySales = sales.filter((s) => currentUser?.role === "admin" || s.sellerId === currentUser?.sellerId);
  const mySaleIds = new Set(mySales.map((s) => s.id));
  const myRejections = rejections.filter((r) => mySaleIds.has(r.saleId));

  const exportVentas = (format: "xlsx" | "csv") => {
    const rows = mySales.map((s) => {
      const client = clients.find((c) => c.id === s.clientId);
      const branch = branches.find((b) => b.id === s.branchId);
      const zone = zones.find((z) => z.id === s.zoneIdSnapshot);
      const row: Record<string, unknown> = {
        Correlativo: s.correlative,
        Fecha: s.saleDate,
        Cliente: client?.businessName,
        Sucursal: branch?.name,
        Zona: zone?.name,
        Estado: s.status,
        "Venta bruta": s.grossTotal,
      };
      LINES.forEach((l) => {
        row[l.name] = s.details.find((d) => d.lineId === l.id)?.amount ?? 0;
      });
      return row;
    });
    downloadSheet(rows, "ventas", format);
  };

  const exportRechazos = (format: "xlsx" | "csv") => {
    const rows = myRejections.flatMap((r) => {
      const sale = sales.find((s) => s.id === r.saleId);
      return r.details.map((d) => ({
        Rechazo: r.correlative,
        Venta: sale?.correlative,
        Fecha: r.rejectionDate,
        Línea: LINES.find((l) => l.id === d.lineId)?.name,
        Motivo: d.reasonId,
        Monto: d.amount,
        Observación: d.observation ?? "",
      }));
    });
    downloadSheet(rows, "rechazos", format);
  };

  const downloadSheet = (rows: Record<string, unknown>[], name: string, format: "xlsx" | "csv") => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    XLSX.writeFile(wb, `${name}-${new Date().toISOString().slice(0, 10)}.${format}`);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImported(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
      const existingRucs = new Set(clients.map((c) => c.ruc));
      const seenRucs = new Set<string>();
      const rows: PreviewRow[] = json.map((r) => {
        const businessName = String(r["Razón Social"] ?? r["businessName"] ?? r["Razon Social"] ?? "").trim();
        const tradeName = String(r["Nombre Comercial"] ?? r["tradeName"] ?? "").trim();
        const ruc = String(r["RUC"] ?? r["ruc"] ?? "").trim();
        const phone = String(r["Teléfono"] ?? r["phone"] ?? "").trim();
        const email = String(r["Email"] ?? r["email"] ?? "").trim();
        const errors: string[] = [];
        if (!businessName) errors.push("Falta razón social");
        if (!ruc) errors.push("Falta RUC");
        if (ruc && existingRucs.has(ruc)) errors.push("Cliente ya existe (RUC duplicado)");
        if (ruc && seenRucs.has(ruc)) errors.push("Duplicado dentro del archivo");
        if (ruc) seenRucs.add(ruc);
        return { businessName, tradeName, ruc, phone, email, errors };
      });
      setPreview(rows);
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmImport = () => {
    if (!preview || !currentUser) return;
    let count = 0;
    preview
      .filter((r) => r.errors.length === 0)
      .forEach((r) => {
        addClient({
          businessName: r.businessName,
          tradeName: r.tradeName || r.businessName,
          ruc: r.ruc,
          phone: r.phone,
          email: r.email,
          sellerId: currentUser.sellerId ?? currentUser.id,
          status: "activo",
        });
        count += 1;
      });
    setImported(count);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <AppShell>
      <h1 className="text-xl sm:text-2xl font-extrabold mb-1">Reportes</h1>
      <p className="text-sm text-inksoft mb-6">Exporta tus ventas y rechazos, o importa una cartera de clientes desde Excel. Disponible para vendedores y administradores.</p>

      <section className="surface-card p-5 mb-6">
        <h2 className="text-sm font-bold mb-3">Exportar</h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => exportVentas("xlsx")}>Ventas · Excel</button>
          <button className="btn-secondary" onClick={() => exportVentas("csv")}>Ventas · CSV</button>
          <button className="btn-secondary" onClick={() => exportRechazos("xlsx")}>Rechazos · Excel</button>
          <button className="btn-secondary" onClick={() => exportRechazos("csv")}>Rechazos · CSV</button>
        </div>
      </section>

      <section className="surface-card p-5">
        <h2 className="text-sm font-bold mb-1">Importar clientes desde Excel</h2>
        <p className="text-xs text-muted mb-4">Columnas esperadas: Razón Social, Nombre Comercial, RUC, Teléfono, Email. Se muestra una vista previa con validación antes de importar — nunca se carga directo.</p>
        <input ref={fileInput} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="text-sm" />

        {preview && (
          <div className="mt-5">
            <div className="surface-card overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase text-muted">
                    <th className="px-3 py-2">Razón social</th>
                    <th className="px-3 py-2">RUC</th>
                    <th className="px-3 py-2">Teléfono</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="px-3 py-2">{row.businessName || "—"}</td>
                      <td className="px-3 py-2 tabular-nums">{row.ruc || "—"}</td>
                      <td className="px-3 py-2">{row.phone || "—"}</td>
                      <td className="px-3 py-2">
                        {row.errors.length === 0 ? (
                          <span className="pill bg-pastel-mint text-pastel-mintDeep">Lista para importar</span>
                        ) : (
                          <span className="pill bg-pastel-red text-pastel-redDeep">{row.errors.join(" · ")}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button className="btn-primary" onClick={confirmImport} disabled={preview.every((r) => r.errors.length > 0)}>
                Confirmar importación ({preview.filter((r) => r.errors.length === 0).length} de {preview.length})
              </button>
              <button className="btn-secondary" onClick={() => setPreview(null)}>Cancelar</button>
            </div>
          </div>
        )}

        {imported !== null && (
          <div className="mt-4 bg-pastel-mint text-pastel-mintDeep rounded-xl px-4 py-3 text-sm font-semibold">
            Se importaron {imported} cliente(s) correctamente.
          </div>
        )}
      </section>
    </AppShell>
  );
}
