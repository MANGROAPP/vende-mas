"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppData } from "@/lib/AppDataContext";
import { BOTTOM_NAV_ITEMS, NAV_ITEMS } from "./nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAppData();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) router.replace("/login");
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-sm text-inksoft">
        Redirigiendo a inicio de sesión…
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex bg-cream">
      {/* Sidebar — desktop / tablet */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-line bg-white/70 backdrop-blur px-4 py-6 sticky top-0 h-dvh">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-9 h-9 rounded-2xl bg-pastel-blue flex items-center justify-center text-lg">🧭</div>
          <div>
            <div className="font-extrabold text-sm leading-tight">Vende+</div>
            <div className="text-[11px] text-muted">MANGRO</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-pastel-blue text-pastel-blueDeep font-bold" : "text-inksoft hover:bg-cream"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line pt-4 mt-4">
          <div className="text-sm font-semibold">{currentUser.name}</div>
          <div className="text-[11px] text-muted capitalize mb-3">{currentUser.role === "admin" ? "Administrador" : "Vendedor"}</div>
          <button onClick={() => { logout(); router.replace("/login"); }} className="btn-secondary w-full text-xs">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar — mobile */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur border-b border-line">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pastel-blue flex items-center justify-center text-base">🧭</div>
            <span className="font-extrabold text-sm">Vende+</span>
          </div>
          <button
            onClick={() => { logout(); router.replace("/login"); }}
            className="text-xs font-semibold text-pastel-blueDeep"
          >
            Salir
          </button>
        </header>

        <main className="flex-1 min-w-0 px-4 py-5 sm:px-6 sm:py-7 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        {/* Bottom nav — mobile */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-5">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
                    active ? "text-pastel-blueDeep" : "text-muted"
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
