import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "blue" | "mint" | "peach" | "yellow" | "pink" | "lavender" | "red";
  progress?: number; // 0-100
  children?: ReactNode;
}

const accentBg: Record<string, string> = {
  blue: "bg-pastel-blue",
  mint: "bg-pastel-mint",
  peach: "bg-pastel-peach",
  yellow: "bg-pastel-yellow",
  pink: "bg-pastel-pink",
  lavender: "bg-pastel-lavender",
  red: "bg-pastel-red",
};

const accentText: Record<string, string> = {
  blue: "text-pastel-blueDeep",
  mint: "text-pastel-mintDeep",
  peach: "text-pastel-peachDeep",
  yellow: "text-pastel-yellowDeep",
  pink: "text-pastel-pinkDeep",
  lavender: "text-pastel-lavenderDeep",
  red: "text-pastel-redDeep",
};

export function KpiCard({ label, value, sub, accent = "blue", progress, children }: KpiCardProps) {
  return (
    <div className="surface-card p-4 sm:p-5 flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${accentBg[accent]}`} />
      </div>
      <div className={`text-2xl sm:text-[28px] font-extrabold ${accentText[accent]} truncate`}>{value}</div>
      {sub && <div className="text-xs text-inksoft">{sub}</div>}
      {typeof progress === "number" && (
        <div className="h-2 rounded-full bg-line overflow-hidden mt-1">
          <div
            className={`h-full rounded-full ${accentBg[accent]}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
