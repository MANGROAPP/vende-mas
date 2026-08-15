"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  DEMO_AUDIT,
  DEMO_BRANCHES,
  DEMO_CLIENTS,
  DEMO_QUOTAS,
  DEMO_REASONS,
  DEMO_REJECTIONS,
  DEMO_SALES,
  DEMO_SELLERS,
  DEMO_USERS,
  DEMO_ZONES,
} from "./demoData";
import {
  AuditLog,
  Branch,
  Client,
  Quota,
  Rejection,
  RejectionDetail,
  RejectionReason,
  Sale,
  SaleDetail,
  Seller,
  User,
  Zone,
} from "./types";

export const TODAY_ISO = "2026-08-14";

interface NewSaleInput {
  saleDate: string;
  clientId: string;
  branchId: string;
  details: SaleDetail[];
  createdBy: string;
  sellerId: string;
}

interface NewRejectionInput {
  saleId: string;
  rejectionDate: string;
  details: RejectionDetail[];
  createdBy: string;
}

interface AppDataValue {
  currentUser: User | null;
  login: (email: string) => User | null;
  logout: () => void;

  users: User[];
  sellers: Seller[];
  zones: Zone[];
  clients: Client[];
  branches: Branch[];
  sales: Sale[];
  rejections: Rejection[];
  reasons: RejectionReason[];
  quotas: Quota[];
  audit: AuditLog[];

  addSale: (input: NewSaleInput) => Sale;
  addRejection: (input: NewRejectionInput) => { ok: boolean; error?: string; rejection?: Rejection };
  cancelSale: (saleId: string, reason: string, user: string) => void;
  addClient: (client: Omit<Client, "id" | "code" | "createdAt">) => Client;
  addBranch: (branch: Omit<Branch, "id" | "code">) => Branch;
  addZone: (zone: Omit<Zone, "id">) => Zone;
  setQuota: (sellerId: string, year: number, month: number, lineId: Quota["lineId"], amount: number) => void;

  saldoDisponible: (saleId: string) => number;
}

const AppDataContext = createContext<AppDataValue | null>(null);

function nextCorrelative(existing: string[], prefix: "V" | "R", year: number): string {
  const yearPrefix = `${prefix}-${year}-`;
  const nums = existing
    .filter((c) => c.startsWith(yearPrefix))
    .map((c) => parseInt(c.slice(yearPrefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${yearPrefix}${String(next).padStart(6, "0")}`;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sales, setSales] = useState<Sale[]>(DEMO_SALES);
  const [rejections, setRejections] = useState<Rejection[]>(DEMO_REJECTIONS);
  const [clients, setClients] = useState<Client[]>(DEMO_CLIENTS);
  const [branches, setBranches] = useState<Branch[]>(DEMO_BRANCHES);
  const [zones, setZones] = useState<Zone[]>(DEMO_ZONES);
  const [quotas, setQuotas] = useState<Quota[]>(DEMO_QUOTAS);
  const [audit, setAudit] = useState<AuditLog[]>(DEMO_AUDIT);

  const login = (email: string) => {
    const user = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) setCurrentUser(user);
    return user ?? null;
  };
  const logout = () => setCurrentUser(null);

  const saldoDisponible = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return 0;
    const rejected = rejections
      .filter((r) => r.saleId === saleId)
      .reduce((sum, r) => sum + r.totalAmount, 0);
    return sale.grossTotal - rejected;
  };

  const addSale: AppDataValue["addSale"] = (input) => {
    const branch = branches.find((b) => b.id === input.branchId);
    const year = new Date(input.saleDate).getFullYear();
    const correlative = nextCorrelative(sales.map((s) => s.correlative), "V", year);
    const grossTotal = input.details.reduce((sum, d) => sum + d.amount, 0);
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      correlative,
      saleDate: input.saleDate,
      clientId: input.clientId,
      branchId: input.branchId,
      zoneIdSnapshot: branch?.zoneId ?? "",
      sellerId: input.sellerId,
      status: "registrada",
      details: input.details.filter((d) => d.amount > 0),
      grossTotal,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
    };
    setSales((prev) => [sale, ...prev]);
    setAudit((prev) => [
      { id: `a-${Date.now()}`, table: "sales", recordRef: correlative, action: "insert", user: input.createdBy, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    return sale;
  };

  const addRejection: AppDataValue["addRejection"] = (input) => {
    const requested = input.details.reduce((sum, d) => sum + d.amount, 0);
    const disponible = saldoDisponible(input.saleId);
    if (requested > disponible) {
      return {
        ok: false,
        error: `El importe del rechazo (S/ ${requested.toFixed(2)}) supera el saldo disponible de la venta (S/ ${disponible.toFixed(2)}).`,
      };
    }
    const year = new Date(input.rejectionDate).getFullYear();
    const correlative = nextCorrelative(rejections.map((r) => r.correlative), "R", year);
    const rejection: Rejection = {
      id: `rej-${Date.now()}`,
      correlative,
      saleId: input.saleId,
      rejectionDate: input.rejectionDate,
      details: input.details.filter((d) => d.amount > 0),
      totalAmount: requested,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
    };
    setRejections((prev) => [rejection, ...prev]);
    setSales((prev) =>
      prev.map((s) => {
        if (s.id !== input.saleId) return s;
        const newDisponible = disponible - requested;
        const status = newDisponible <= 0 ? "cerrada" : "con_rechazo";
        return { ...s, status };
      })
    );
    setAudit((prev) => [
      { id: `a-${Date.now()}`, table: "rejections", recordRef: correlative, action: "insert", user: input.createdBy, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    return { ok: true, rejection };
  };

  const cancelSale: AppDataValue["cancelSale"] = (saleId, reason, user) => {
    setSales((prev) => prev.map((s) => (s.id === saleId ? { ...s, status: "anulada", cancelReason: reason } : s)));
    const sale = sales.find((s) => s.id === saleId);
    setAudit((prev) => [
      { id: `a-${Date.now()}`, table: "sales", recordRef: sale?.correlative ?? saleId, action: "anulacion", user, reason, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const addClient: AppDataValue["addClient"] = (input) => {
    const code = `CLI-${String(clients.length + 1).padStart(3, "0")}`;
    const client: Client = { ...input, id: `c-${Date.now()}`, code, createdAt: TODAY_ISO };
    setClients((prev) => [client, ...prev]);
    return client;
  };

  const addBranch: AppDataValue["addBranch"] = (input) => {
    const code = `SUC-${String(branches.length + 1).padStart(3, "0")}`;
    const branch: Branch = { ...input, id: `b-${Date.now()}`, code };
    setBranches((prev) => [branch, ...prev]);
    return branch;
  };

  const addZone: AppDataValue["addZone"] = (input) => {
    const zone: Zone = { ...input, id: `z-${Date.now()}` };
    setZones((prev) => [zone, ...prev]);
    return zone;
  };

  const setQuota: AppDataValue["setQuota"] = (sellerId, year, month, lineId, amount) => {
    setQuotas((prev) => {
      const idx = prev.findIndex((q) => q.sellerId === sellerId && q.year === year && q.month === month && q.lineId === lineId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], amount };
        return copy;
      }
      return [...prev, { id: `q-${Date.now()}`, sellerId, year, month, lineId, amount }];
    });
  };

  const value: AppDataValue = useMemo(
    () => ({
      currentUser,
      login,
      logout,
      users: DEMO_USERS,
      sellers: DEMO_SELLERS,
      zones,
      clients,
      branches,
      sales,
      rejections,
      reasons: DEMO_REASONS,
      quotas,
      audit,
      addSale,
      addRejection,
      cancelSale,
      addClient,
      addBranch,
      addZone,
      setQuota,
      saldoDisponible,
    }),
    [currentUser, zones, clients, branches, sales, rejections, quotas, audit]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData debe usarse dentro de <AppDataProvider>");
  return ctx;
}
