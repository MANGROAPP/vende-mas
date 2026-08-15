"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/AppDataContext";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function LoginPage() {
  const { login, currentUser } = useAppData();
  const router = useRouter();
  const [email, setEmail] = useState("andy.acosta@mangro.com.pe");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(email);
    if (!user) {
      setError("No encontramos una cuenta con ese correo.");
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-pastel-blue/40 via-cream to-cream px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-pastel-blue flex items-center justify-center text-3xl shadow-soft mb-4">
            🧭
          </div>
          <h1 className="text-xl font-extrabold text-ink">Vende+</h1>
          <p className="text-xs text-muted mt-1">MANGRO · gestión y proyección de ventas</p>
        </div>

        <form onSubmit={handleSubmit} className="surface-card p-6 flex flex-col gap-4">
          <div>
            <label className="field-label">Correo</label>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Contraseña</label>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs text-pastel-redDeep font-semibold">{error}</p>}
          <button type="submit" className="btn-primary w-full mt-1">
            Ingresar
          </button>
          {!isSupabaseConfigured() && (
            <div className="text-[11px] text-muted bg-pastel-yellow/50 rounded-xl px-3 py-2 leading-relaxed">
              Modo demo (sin backend conectado). Prueba con{" "}
              <button type="button" className="underline font-semibold" onClick={() => setEmail("andy.acosta@mangro.com.pe")}>
                andy.acosta@mangro.com.pe
              </button>{" "}
              (vendedor) o{" "}
              <button type="button" className="underline font-semibold" onClick={() => setEmail("admin@mangro.com.pe")}>
                admin@mangro.com.pe
              </button>{" "}
              (administrador). Cualquier contraseña funciona en este modo.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
