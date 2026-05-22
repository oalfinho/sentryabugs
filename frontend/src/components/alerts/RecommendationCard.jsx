"use client";

import { Lightbulb, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

const priorityConfig = {
  high: { border: "border-red-500/30", icon: "bg-red-900/40    text-red-400" },
  medium: {
    border: "border-orange-500/30",
    icon: "bg-orange-900/40 text-orange-400",
  },
  low: {
    border: "border-accent/30",
    icon: "bg-accent/20     text-accent-light",
  },
};

export function RecommendationCard({ message, priority = "high" }) {
  const config = priorityConfig[priority] ?? priorityConfig.low;

  return (
    <Card className={`border p-5 ${config.border}`}>
      <div className="flex gap-4">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.icon}`}
        >
          <Lightbulb size={16} />
        </div>
        <div>
          <p className="mb-3 text-[13px] text-brand-cream">{message}</p>
          <button className="flex items-center gap-1.5 font-mono text-[11px] text-brand-muted transition-colors hover:text-brand-cream">
            Ver detalhes
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </Card>
  );
}
