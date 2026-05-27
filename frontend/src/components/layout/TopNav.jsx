"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useClock } from "@/hooks/useClock";

const TABS = [
  { label: "Painel Geral", href: "/dashboard" },
  { label: "Máquinas", href: "/dashboard/maquinas" },
  { label: "Histórico", href: "/dashboard/historico" },
  { label: "Alertas", href: "/dashboard/alertas" },
];

export function TopNav() {
  const time = useClock();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-accent/30 bg-bg-tertiary px-6">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/sentrya.png"
          alt="Sentrya"
          className="h-24 w-auto object-contain"
          style={{ maxWidth: "260px" }}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white/[0.03] p-1">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-lg px-4 py-1.5 text-[13px] font-semibold font-sans transition-all duration-200",
                isActive
                  ? "bg-card-dark text-brand-cream shadow-[0_0_0_1px_rgba(59,101,122,0.35)]"
                  : "text-brand-muted hover:text-brand-cream",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-brand-muted/50">
          {time}
        </span>

        <div className="flex items-center gap-1.5 rounded-full border border-red-500/35 bg-red-500/10 px-3 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse2 rounded-full bg-status-danger" />
          <span className="text-[11px] font-semibold tracking-[.05em] text-status-danger">
            AO VIVO
          </span>
        </div>

      </div>
    </nav>
  );
}
