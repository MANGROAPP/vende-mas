import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Devuelve un cliente de Supabase si las variables de entorno están configuradas
 * (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).
 *
 * Mientras no se configuren, la app funciona en "modo demo" con datos de
 * ejemplo en memoria (ver lib/AppDataContext.tsx), para que puedas ver y
 * probar el Cockpit Comercial completo sin depender de un backend real.
 *
 * Para conectar tu propio proyecto de Supabase:
 *   1. Crea un proyecto en https://supabase.com
 *   2. Ejecuta supabase/schema.sql en el SQL Editor de tu proyecto
 *   3. Copia .env.local.example a .env.local y completa las dos variables
 *   4. Reinicia `npm run dev`
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key);
  }
  return client;
}

export const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
