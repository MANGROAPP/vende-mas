"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/AppDataContext";

export default function Home() {
  const router = useRouter();
  const { currentUser } = useAppData();

  useEffect(() => {
    router.replace(currentUser ? "/dashboard" : "/login");
  }, [currentUser, router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-cream text-inksoft text-sm">
      Cargando Vende+…
    </div>
  );
}
