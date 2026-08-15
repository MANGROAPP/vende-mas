export type Role = "admin" | "vendedor";

export type LineCode = "nestle" | "golosinas" | "colgate" | "dkasa" | "philip_morris";

export interface LineDef {
  id: LineCode;
  name: string;
}

export const LINES: LineDef[] = [
  { id: "nestle", name: "Nestlé" },
  { id: "golosinas", name: "Golosinas" },
  { id: "colgate", name: "Colgate" },
  { id: "dkasa", name: "DKasa" },
  { id: "philip_morris", name: "Philip Morris" },
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  sellerId?: string;
}

export interface Seller {
  id: string;
  name: string;
  code: string;
}

export interface Zone {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: "activa" | "inactiva";
}

export interface Client {
  id: string;
  code: string;
  businessName: string;
  tradeName: string;
  ruc: string;
  phone?: string;
  email?: string;
  fiscalAddress?: string;
  sellerId: string;
  status: "activo" | "inactivo";
  observations?: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  clientId: string;
  zoneId: string;
  code: string;
  name: string;
  address?: string;
  reference?: string;
  phone?: string;
  contact?: string;
  status: "activa" | "cerrada";
  openingDate?: string;
  closingDate?: string;
  observations?: string;
}

export type SaleStatus =
  | "borrador"
  | "registrada"
  | "confirmada"
  | "entregada_parcial"
  | "entregada"
  | "con_rechazo"
  | "anulada"
  | "cerrada";

export interface SaleDetail {
  lineId: LineCode;
  amount: number;
}

export interface Sale {
  id: string;
  correlative: string;
  saleDate: string;
  clientId: string;
  branchId: string;
  zoneIdSnapshot: string;
  sellerId: string;
  status: SaleStatus;
  details: SaleDetail[];
  grossTotal: number;
  createdBy: string;
  createdAt: string;
  cancelReason?: string;
}

export interface RejectionDetail {
  lineId: LineCode;
  amount: number;
  reasonId: string;
  observation?: string;
}

export interface Rejection {
  id: string;
  correlative: string;
  saleId: string;
  rejectionDate: string;
  details: RejectionDetail[];
  totalAmount: number;
  createdBy: string;
  createdAt: string;
}

export interface RejectionReason {
  id: string;
  name: string;
  active: boolean;
}

export interface Quota {
  id: string;
  sellerId: string;
  year: number;
  month: number;
  lineId: LineCode;
  amount: number;
}

export interface AuditLog {
  id: string;
  table: string;
  recordRef: string;
  action: "insert" | "update" | "anulacion";
  user: string;
  reason?: string;
  createdAt: string;
}
