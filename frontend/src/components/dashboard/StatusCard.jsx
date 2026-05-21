"use client";

import { Card } from "@/components/ui/Card";
import { IconBox } from "@/components/ui/IconBox";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ALERT_LIMIT,
  CRITICAL_LIMIT,
  getVibrationStatus,
  isAnomaly,
} from "@/lib/utils";

export function StatusCard({ data, loading }) {
  const currentStatus = data
    ? getVibrationStatus(data.vibracao, data.status)
    : "OK";
  const anomaly = data ? isAnomaly(null, data.status) : false;

  return (
    <Card
      variant={anomaly ? "danger" : "default"}
      className="p-5"
      style={
        anomaly
          ? {
              background:
                "linear-gradient(145deg,#2a0a0a 0%,#1a1020 40%,#0d1f2e 100%)",
            }
          : undefined
      }
    >
      {/* Glow orb */}
      {anomaly && (
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-red-500/10 blur-2xl" />
      )}

      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <IconBox variant={anomaly ? "danger" : "safe"}>
          {anomaly ? "⚡" : "✓"}
        </IconBox>
        <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-brand-muted">
          Status
        </span>
      </div>

      {/* Main label */}
      {loading ? (
        <Skeleton className="mb-4 h-8 w-56" />
      ) : (
        <p
          className="mb-4 text-3xl font-extrabold leading-none tracking-tight"
          style={{
            color: anomaly ? "#ff7070" : "#3bc9a0",
            textShadow: anomaly
              ? "0 0 40px rgba(229,83,83,.4)"
              : "0 0 30px rgba(59,201,160,.3)",
          }}
        >
          {anomaly ? "ANOMALIA DETECTADA" : "OPERAÇÃO NORMAL"}
        </p>
      )}

      {/* Metrics */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs text-brand-muted">
          Vibração atual:&nbsp;
          {loading ? (
            <Skeleton className="inline-block h-3 w-12" />
          ) : (
            <span className="font-semibold text-brand-cream">
              {data?.vibracao}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-brand-muted">
          Threshold alerta:&nbsp;
          <span className="font-semibold text-brand-cream">
            {ALERT_LIMIT} mm/s
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-brand-muted">
          Status da máquina:&nbsp;
          <span className="font-semibold text-brand-cream">
            {loading ? "—" : currentStatus}
          </span>
        </div>
      </div>

      {/* Risk bar */}
      <div className="my-4 h-1 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(((data?.vibracao ?? 0) / CRITICAL_LIMIT) * 100, 100)}%`,
            background: "linear-gradient(90deg, #e5a03b, #e55353)",
          }}
        />
      </div>

      <div className="border-t border-accent/25 pt-3 font-mono text-[11px] text-brand-muted">
        Última falha em:{" "}
        {loading ? (
          <Skeleton className="inline-block h-3 w-10" />
        ) : (
          <span className="text-status-warn">{data?.ultima_falha} min</span>
        )}
      </div>
    </Card>
  );
}
