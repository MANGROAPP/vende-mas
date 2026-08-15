import { ComplianceStatus } from "@/lib/kpis";
import { SaleStatus } from "@/lib/types";

const complianceMap: Record<ComplianceStatus, { label: string; classes: string }> = {
  en_meta: { label: "En meta", classes: "bg-pastel-mint text-pastel-mintDeep" },
  en_riesgo: { label: "En riesgo", classes: "bg-pastel-yellow text-pastel-yellowDeep" },
  critico: { label: "Crítico", classes: "bg-pastel-red text-pastel-redDeep" },
};

export function CompliancePill({ status }: { status: ComplianceStatus }) {
  const cfg = complianceMap[status];
  return <span className={`pill ${cfg.classes}`}>{cfg.label}</span>;
}

const saleStatusMap: Record<SaleStatus, { label: string; classes: string }> = {
  borrador: { label: "Borrador", classes: "bg-line text-inksoft" },
  registrada: { label: "Registrada", classes: "bg-pastel-blue text-pastel-blueDeep" },
  confirmada: { label: "Confirmada", classes: "bg-pastel-blue text-pastel-blueDeep" },
  entregada_parcial: { label: "Entregada parcial", classes: "bg-pastel-yellow text-pastel-yellowDeep" },
  entregada: { label: "Entregada", classes: "bg-pastel-mint text-pastel-mintDeep" },
  con_rechazo: { label: "Con rechazo", classes: "bg-pastel-peach text-pastel-peachDeep" },
  anulada: { label: "Anulada", classes: "bg-line text-inksoft line-through" },
  cerrada: { label: "Cerrada", classes: "bg-pastel-lavender text-pastel-lavenderDeep" },
};

export function SaleStatusPill({ status }: { status: SaleStatus }) {
  const cfg = saleStatusMap[status];
  return <span className={`pill ${cfg.classes}`}>{cfg.label}</span>;
}
