import {
  AuditLog,
  Branch,
  Client,
  Quota,
  Rejection,
  RejectionReason,
  Sale,
  Seller,
  User,
  Zone,
} from "./types";

export const DEMO_USERS: User[] = [
  { id: "u-andy", name: "Andy Acosta", email: "andy.acosta@mangro.com.pe", role: "vendedor", sellerId: "s-andy" },
  { id: "u-admin", name: "Administrador MANGRO", email: "admin@mangro.com.pe", role: "admin" },
];

export const DEMO_SELLERS: Seller[] = [
  { id: "s-andy", name: "Andy Acosta", code: "V-01" },
];

export const DEMO_ZONES: Zone[] = [
  { id: "z-chachapoyas", code: "CHA", name: "Chachapoyas", status: "activa" },
  { id: "z-bagua", code: "BAG", name: "Bagua", status: "activa" },
  { id: "z-jaen", code: "JAE", name: "Jaén", status: "activa" },
  { id: "z-utcubamba", code: "UTC", name: "Utcubamba", status: "activa" },
];

export const DEMO_CLIENTS: Client[] = [
  {
    id: "c-abc",
    code: "CLI-001",
    businessName: "Distribuidora ABC SAC",
    tradeName: "ABC",
    ruc: "20123456789",
    phone: "941 000 111",
    email: "compras@abc.pe",
    fiscalAddress: "Jr. Amazonas 123, Chachapoyas",
    sellerId: "s-andy",
    status: "activo",
    observations: "Cliente histórico, alto potencial",
    createdAt: "2024-02-10",
  },
  {
    id: "c-xyz",
    code: "CLI-002",
    businessName: "Comercial XYZ EIRL",
    tradeName: "XYZ",
    ruc: "20456789123",
    phone: "941 222 333",
    sellerId: "s-andy",
    status: "activo",
    observations: "Rechazo recurrente, dar seguimiento",
    createdAt: "2024-05-03",
  },
  {
    id: "c-nortesur",
    code: "CLI-003",
    businessName: "Norte Sur Distribuciones SAC",
    tradeName: "Norte Sur",
    ruc: "20678912345",
    phone: "941 555 777",
    sellerId: "s-andy",
    status: "activo",
    createdAt: "2023-11-20",
  },
];

export const DEMO_BRANCHES: Branch[] = [
  { id: "b-abc-cha", clientId: "c-abc", zoneId: "z-chachapoyas", code: "SUC-001", name: "ABC Chachapoyas", status: "activa", address: "Av. Grau 456", openingDate: "2024-02-10" },
  { id: "b-abc-bag", clientId: "c-abc", zoneId: "z-bagua", code: "SUC-002", name: "ABC Bagua", status: "activa", address: "Calle Comercio 88", openingDate: "2024-03-01" },
  { id: "b-abc-jae", clientId: "c-abc", zoneId: "z-jaen", code: "SUC-003", name: "ABC Jaén", status: "activa", address: "Jr. San Martín 210", openingDate: "2024-04-15" },
  { id: "b-xyz-uct", clientId: "c-xyz", zoneId: "z-utcubamba", code: "SUC-004", name: "XYZ Utcubamba", status: "activa", address: "Av. Bagua Grande 300", openingDate: "2024-05-03" },
  { id: "b-nortesur-cha", clientId: "c-nortesur", zoneId: "z-chachapoyas", code: "SUC-005", name: "Norte Sur Chachapoyas", status: "activa", address: "Jr. Ortiz Arrieta 77", openingDate: "2023-11-20" },
];

export const DEMO_REASONS: RejectionReason[] = [
  { id: "r-no-solicitado", name: "Producto no solicitado", active: true },
  { id: "r-equivocado", name: "Producto equivocado", active: true },
  { id: "r-deteriorado", name: "Producto deteriorado", active: true },
  { id: "r-vencido", name: "Producto vencido", active: true },
  { id: "r-stock", name: "Falta de stock", active: true },
  { id: "r-cliente-rechazo", name: "Cliente rechazó producto", active: true },
  { id: "r-precio", name: "Diferencia de precio", active: true },
  { id: "r-pedido", name: "Error de pedido", active: true },
  { id: "r-despacho", name: "Error de despacho", active: true },
  { id: "r-cerrado", name: "Cliente cerrado", active: true },
  { id: "r-duplicado", name: "Pedido duplicado", active: true },
  { id: "r-otro", name: "Otro", active: true },
];

export const DEMO_QUOTAS: Quota[] = [
  { id: "q-1", sellerId: "s-andy", year: 2026, month: 8, lineId: "nestle", amount: 150000 },
  { id: "q-2", sellerId: "s-andy", year: 2026, month: 8, lineId: "golosinas", amount: 80000 },
  { id: "q-3", sellerId: "s-andy", year: 2026, month: 8, lineId: "colgate", amount: 100000 },
  { id: "q-4", sellerId: "s-andy", year: 2026, month: 8, lineId: "dkasa", amount: 70000 },
  { id: "q-5", sellerId: "s-andy", year: 2026, month: 8, lineId: "philip_morris", amount: 100000 },
];

export const DEMO_SALES: Sale[] = [
  {
    id: "sale-152",
    correlative: "V-2026-000152",
    saleDate: "2026-08-13",
    clientId: "c-abc",
    branchId: "b-abc-cha",
    zoneIdSnapshot: "z-chachapoyas",
    sellerId: "s-andy",
    status: "con_rechazo",
    details: [
      { lineId: "nestle", amount: 5000 },
      { lineId: "golosinas", amount: 1500 },
      { lineId: "colgate", amount: 1000 },
      { lineId: "dkasa", amount: 1000 },
      { lineId: "philip_morris", amount: 1500 },
    ],
    grossTotal: 10000,
    createdBy: "u-andy",
    createdAt: "2026-08-13T09:14:00-05:00",
  },
  {
    id: "sale-153",
    correlative: "V-2026-000153",
    saleDate: "2026-08-05",
    clientId: "c-xyz",
    branchId: "b-xyz-uct",
    zoneIdSnapshot: "z-utcubamba",
    sellerId: "s-andy",
    status: "con_rechazo",
    details: [
      { lineId: "golosinas", amount: 3200 },
      { lineId: "colgate", amount: 2100 },
    ],
    grossTotal: 5300,
    createdBy: "u-andy",
    createdAt: "2026-08-05T10:02:00-05:00",
  },
  {
    id: "sale-154",
    correlative: "V-2026-000154",
    saleDate: "2026-08-07",
    clientId: "c-nortesur",
    branchId: "b-nortesur-cha",
    zoneIdSnapshot: "z-chachapoyas",
    sellerId: "s-andy",
    status: "entregada",
    details: [
      { lineId: "nestle", amount: 8200 },
      { lineId: "dkasa", amount: 2400 },
      { lineId: "philip_morris", amount: 3100 },
    ],
    grossTotal: 13700,
    createdBy: "u-andy",
    createdAt: "2026-08-07T15:40:00-05:00",
  },
  {
    id: "sale-155",
    correlative: "V-2026-000155",
    saleDate: "2026-08-10",
    clientId: "c-abc",
    branchId: "b-abc-bag",
    zoneIdSnapshot: "z-bagua",
    sellerId: "s-andy",
    status: "entregada",
    details: [
      { lineId: "nestle", amount: 4100 },
      { lineId: "golosinas", amount: 900 },
    ],
    grossTotal: 5000,
    createdBy: "u-andy",
    createdAt: "2026-08-10T11:20:00-05:00",
  },
  {
    id: "sale-156",
    correlative: "V-2026-000156",
    saleDate: "2026-08-12",
    clientId: "c-abc",
    branchId: "b-abc-jae",
    zoneIdSnapshot: "z-jaen",
    sellerId: "s-andy",
    status: "registrada",
    details: [
      { lineId: "colgate", amount: 3600 },
      { lineId: "philip_morris", amount: 1900 },
    ],
    grossTotal: 5500,
    createdBy: "u-andy",
    createdAt: "2026-08-12T09:05:00-05:00",
  },
];

export const DEMO_REJECTIONS: Rejection[] = [
  {
    id: "rej-34",
    correlative: "R-2026-000034",
    saleId: "sale-152",
    rejectionDate: "2026-08-14",
    details: [
      { lineId: "nestle", amount: 500, reasonId: "r-no-solicitado" },
      { lineId: "colgate", amount: 350, reasonId: "r-deteriorado" },
    ],
    totalAmount: 850,
    createdBy: "u-andy",
    createdAt: "2026-08-14T11:02:00-05:00",
  },
  {
    id: "rej-41",
    correlative: "R-2026-000041",
    saleId: "sale-152",
    rejectionDate: "2026-08-15",
    details: [{ lineId: "philip_morris", amount: 150, reasonId: "r-despacho" }],
    totalAmount: 150,
    createdBy: "u-andy",
    createdAt: "2026-08-15T09:30:00-05:00",
  },
  {
    id: "rej-50",
    correlative: "R-2026-000050",
    saleId: "sale-153",
    rejectionDate: "2026-08-06",
    details: [{ lineId: "golosinas", amount: 700, reasonId: "r-cliente-rechazo" }],
    totalAmount: 700,
    createdBy: "u-andy",
    createdAt: "2026-08-06T14:10:00-05:00",
  },
];

export const DEMO_AUDIT: AuditLog[] = [
  { id: "a-1", table: "sales", recordRef: "V-2026-000152", action: "insert", user: "Andy Acosta", createdAt: "2026-08-13T09:14:00-05:00" },
  { id: "a-2", table: "rejections", recordRef: "R-2026-000034", action: "insert", user: "Andy Acosta", createdAt: "2026-08-14T11:02:00-05:00" },
  { id: "a-3", table: "rejections", recordRef: "R-2026-000041", action: "insert", user: "Andy Acosta", createdAt: "2026-08-15T09:30:00-05:00" },
];
