"use client";

import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const statusConfig = {
  critico:             { badge: "danger", label: "Crítico" },
  "falha-progressiva": { badge: "warn",   label: "Falha progressiva" },
  monitorado:          { badge: "info",   label: "Monitorado" },
};

const trendConfig = {
  up:     { icon: <TrendingUp  size={14} className="text-red-400"    /> },
  down:   { icon: <TrendingDown size={14} className="text-green-400" /> },
  stable: { icon: <Minus       size={14} className="text-brand-muted" /> },
};

export function CriticalTable({ machines }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-950/40">
          <AlertTriangle size={14} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-brand-cream">Críticos</h3>
          <p className="font-mono text-[10px] text-brand-muted">Prioridade máxima</p>
        </div>
      </div>

      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-brand-border">
            {["Status", "Máquina", "Risco", "Tendência"].map((h) => (
              <th key={h} className="pb-2 font-mono text-[10px] uppercase tracking-[.1em] text-brand-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {machines.map((m) => {
            const s = statusConfig[m.status] ?? statusConfig.monitorado;
            const t = trendConfig[m.trend]  ?? trendConfig.stable;
            return (
              <tr key={m.id} className="hover:bg-white/[0.02]">
                <td className="py-2.5 pr-4">
                  <Badge variant={s.badge}>{s.label}</Badge>
                </td>
                <td className="py-2.5 pr-4 font-mono text-brand-cream">{m.machine}</td>
                <td className="py-2.5 pr-4 font-mono text-brand-cream">{m.risk}%</td>
                <td className="py-2.5">{t.icon}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}