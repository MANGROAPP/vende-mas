export interface NavItem {
  href: string;
  label: string;
  icon: string; // emoji kept simple/dependency-free; swap for an icon set later
}

// Cuotas y Reportes están disponibles para TODOS los roles (vendedor y admin) —
// el vendedor necesita ver/gestionar su propia cuota mensual y exportar/importar
// sus reportes, ya que esta app opera de forma independiente al sistema
// corporativo principal.
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/ventas", label: "Ventas", icon: "🧾" },
  { href: "/rechazos", label: "Rechazos", icon: "↩️" },
  { href: "/clientes", label: "Clientes", icon: "🏬" },
  { href: "/sucursales", label: "Sucursales", icon: "📍" },
  { href: "/zonas", label: "Zonas", icon: "🗺️" },
  { href: "/cuotas", label: "Cuotas", icon: "🎯" },
  { href: "/reportes", label: "Reportes", icon: "📁" },
];

// Subconjunto mostrado en la barra inferior en móvil (espacio limitado)
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[2],
  NAV_ITEMS[6],
  NAV_ITEMS[7],
];
