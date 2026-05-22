"use client";

import { AlertTriangle, AlertCircle, Wrench } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function RiskPanel({
  riskPercentage,
  criticalMachines,
  progressiveFailures,
  urgentMaintenance,
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[.08em] text-brand-muted">
          Taxa de Risco
        </p>
        <span className="font-mono text-lg font-bold text-red-400">
          +{riskPercentage}%
        </span>
      </div>

      <div className="space-y-3">
        {[
          {
            icon: <AlertTriangle size={14} className="text-red-400" />,
            value: criticalMachines,
            label: "máquinas críticas",
          },
          {
            icon: <AlertCircle size={14} className="text-orange-400" />,
            value: progressiveFailures,
            label: "falhas progressivas",
          },
          {
            icon: <Wrench size={14} className="text-brand-muted" />,
            value: urgentMaintenance,
            label: "manutenção urgente",
          },
        ].map(({ icon, value, label }) => (
          <div key={label} className="flex items-center gap-3">
            {icon}
            <span className="font-mono text-[13px] text-brand-cream">
              <strong>{value}</strong>{" "}
              <span className="text-brand-muted">{label}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
