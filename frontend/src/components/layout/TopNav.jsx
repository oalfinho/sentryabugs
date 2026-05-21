"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClock } from "@/hooks/useClock";
import { useNavTab } from "@/hooks/useNavTab";

export function TopNav() {
  const time = useClock();
  const { active, setActive, tabs } = useNavTab();

  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-accent/30 bg-bg-tertiary px-6">
      {/* Logo — centralizada verticalmente, alinhada à esquerda, tamanho controlado */}
      <div className="flex items-center">
        <img
          src="/sentrya.png"
          alt="Sentrya"
          className="h-8 w-auto object-contain"
          style={{ maxWidth: "120px" }}
        />
      </div>

      {/* Tabs — centro */}
      <div className="flex gap-1 rounded-xl bg-white/[0.03] p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-[13px] font-semibold transition-all duration-200 font-sans",
              active === tab
                ? "bg-card-dark text-brand-cream shadow-[0_0_0_1px_rgba(59,101,122,0.35)]"
                : "text-brand-muted hover:text-brand-cream",
            )}
          >
            {tab}
          </button>
        ))}
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

        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-accent/35 bg-card transition-colors hover:bg-card-dark">
          <Bell size={16} className="text-brand-muted" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border-[1.5px] border-bg-tertiary bg-status-danger" />
        </button>
      </div>
    </nav>
  );
}
