"use client";

import {
  Clock, MapPin, Activity, Brain,
  TrendingUp, Wrench, Eye, CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const severityConfig = {
  critical: {
    bg:        "bg-gradient-to-r from-red-950/90 to-red-900/70",
    border:    "border-red-500/40",
    badge:     "danger",
    badgeText: "Crítico",
    insightBg: "bg-red-950/40",
  },
  alert: {
    bg:        "bg-gradient-to-r from-orange-950/90 to-orange-900/70",
    border:    "border-orange-500/40",
    badge:     "warn",
    badgeText: "Alerta",
    insightBg: "bg-orange-950/40",
  },
  moderate: {
    bg:        "bg-gradient-to-r from-[#123142]/90 to-[#3B657A]/70",
    border:    "border-accent/40",
    badge:     "info",
    badgeText: "Moderado",
    insightBg: "bg-[#123142]/40",
  },
};

export function AlertCard({ alert, onMarkRead, onOpenDetails, onGenerateMaintenance }) {
  const config = severityConfig[alert.severity] ?? severityConfig.moderate;

  return (
    <div
      className={`
        rounded-xl border p-5 mb-4 backdrop-blur-sm
        transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl
        ${config.bg} ${config.border}
      `}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="mb-2 text-lg font-bold text-brand-cream">
            {alert.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-brand-muted">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {alert.location} — {alert.sector}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {alert.time}
            </span>
          </div>
        </div>
        <Badge variant={config.badge}>{config.badgeText}</Badge>
      </div>

      {/* Métricas */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { icon: <Activity size={14} className="text-accent-light" />, label: "Sensor",           value: alert.sensor },
          { icon: <Brain    size={14} className="text-accent-light" />, label: "Confiança IA",     value: `${alert.aiConfidence}%` },
          { icon: <TrendingUp size={14} className="text-accent-light" />, label: "Isolation Forest", value: alert.isolationScore },
          { icon: <Clock    size={14} className="text-red-400"       />, label: "Falha est.",      value: alert.estimatedFailure },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-2">
            {icon}
            <div>
              <p className="text-[10px] text-brand-muted">{label}</p>
              <p className="text-[13px] font-semibold text-brand-cream">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Vibração atual */}
      <div className="mb-4 rounded-lg bg-bg-primary/50 px-3 py-2">
        <p className="text-[10px] text-brand-muted">Vibração atual</p>
        <p className="text-lg font-bold text-brand-cream">
          {alert.currentVibration} g
        </p>
      </div>

      {/* Insight */}
      <div className={`mb-4 rounded-lg border border-white/10 p-3 ${config.insightBg}`}>
        <p className="text-[13px] text-brand-cream/90">{alert.insight}</p>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        {[
          { icon: <CheckCircle size={13} />, label: "Marcar como lido",   fn: onMarkRead },
          { icon: <Eye        size={13} />, label: "Abrir detalhes",      fn: onOpenDetails },
          { icon: <Wrench     size={13} />, label: "Gerar manutenção",    fn: onGenerateMaintenance },
        ].map(({ icon, label, fn }) => (
          <button
            key={label}
            onClick={() => fn?.(alert.id)}
            className="flex items-center gap-1.5 rounded-lg border border-brand-border bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-brand-muted transition-colors hover:bg-white/[0.07] hover:text-brand-cream"
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}