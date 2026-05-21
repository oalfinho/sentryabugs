"use client";

import { Activity, Thermometer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { IconBox } from "@/components/ui/IconBox";
import { Skeleton } from "@/components/ui/Skeleton";

const METRICS = [
  {
    key: "vibracao",
    label: "Vibração",
    icon: Activity,
    color: "text-status-danger",
    iconVariant: "danger",
    format: (v) => `${Number(v).toFixed(2)} g`,
  },
  {
    key: "temperatura",
    label: "Temperatura",
    icon: Thermometer,
    color: "text-status-warn",
    iconVariant: "warn",
    format: (v) => `${Number(v).toFixed(2)}°`,
  },
];

export function MetricsCard({ vibracao, temperatura }) {
  const values = { vibracao, temperatura };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 gap-2.5">
        {METRICS.map(
          ({ key, label, icon: Icon, color, iconVariant, format }) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl border border-accent/25 bg-white/[0.02] p-3"
            >
              <IconBox variant={iconVariant} className="shrink-0">
                <Icon size={16} className={color} />
              </IconBox>
              <div>
                {values[key] == null ? (
                  <Skeleton className="h-5 w-14" />
                ) : (
                  <div className="font-mono text-lg font-bold leading-none text-brand-cream">
                    {format(values[key])}
                  </div>
                )}
                <div className="mt-1 text-[10px] uppercase tracking-[.06em] text-brand-muted">
                  {label}
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </Card>
  );
}
