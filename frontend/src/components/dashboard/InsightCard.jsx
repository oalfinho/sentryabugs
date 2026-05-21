"use client";

import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { IconBox } from "@/components/ui/IconBox";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPercent } from "@/lib/utils";

// ─── Interpretação puramente pelo Isolation Forest ────────────────────────────

function getIFHeadline(is_anomaly, score) {
  if (is_anomaly) {
    if (score >= 0.8) return "Isolation Forest: anomalia crítica detectada";
    if (score >= 0.6) return "Isolation Forest: anomalia com alta confiança";
    return "Isolation Forest: anomalia identificada";
  }
  if (score >= 0.4) return "Isolation Forest: padrão limítrofe — atenção";
  return "Isolation Forest: padrão normal confirmado";
}

function getIFRecommendation(is_anomaly, score) {
  if (!is_anomaly) return "Monitoramento Contínuo Ativo";
  if (score >= 0.8) return "Verificar Rolamento — Parada Imediata Recomendada";
  if (score >= 0.6) return "Inspecionar Componentes Mecânicos";
  return "Verificar Rolamento do Motor";
}

function getIFDescription(is_anomaly, score) {
  if (!is_anomaly)
    return `Score IF: ${formatPercent(score * 100)} — dentro dos limites normais do modelo`;
  return `Score IF: ${formatPercent(score * 100)} — padrão isolado com alta divergência`;
}

function ScoreBar({ score }) {
  const pct = Math.min(100, Math.round(score * 100));
  const color =
    pct >= 80
      ? "bg-red-500"
      : pct >= 60
        ? "bg-orange-400"
        : pct >= 40
          ? "bg-yellow-400"
          : "bg-teal-400";

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-brand-muted">
        <span>Score Isolation Forest</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function InsightCard({ data }) {
  const loading = !data;

  // Fonte única de verdade: Isolation Forest
  const is_anomaly = data?.is_anomaly ?? false;
  const anomaly_score = data?.anomaly_score ?? 0;
  const risk_pct = data?.risk_pct ?? Math.round(anomaly_score * 100);

  const headline = loading ? "" : getIFHeadline(is_anomaly, anomaly_score);
  const recommendation = loading
    ? ""
    : getIFRecommendation(is_anomaly, anomaly_score);
  const description = loading
    ? ""
    : getIFDescription(is_anomaly, anomaly_score);

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <IconBox variant="info">
          <TrendingUp size={14} className="text-accent-light" />
        </IconBox>
        <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-brand-muted">
          Insight — Isolation Forest
        </span>
      </div>

      {/* Headline */}
      {loading ? (
        <Skeleton className="mb-1.5 h-6 w-3/4" />
      ) : (
        <h3 className="mb-1.5 text-lg font-bold leading-tight text-brand-cream">
          {headline}
        </h3>
      )}

      {/* Score bar */}
      {loading ? (
        <Skeleton className="mb-4 h-4 w-full" />
      ) : (
        <ScoreBar score={anomaly_score} />
      )}

      {/* Risk row */}
      <div className="flex items-start gap-2.5 border-b border-accent/20 py-2.5">
        <IconBox variant={is_anomaly ? "warn" : "info"} className="mt-0.5">
          {is_anomaly ? "⚠" : "◎"}
        </IconBox>
        <div>
          <p className="text-[13px] font-semibold text-brand-cream">
            {is_anomaly
              ? `Probabilidade de falha: ${formatPercent(risk_pct)}`
              : "Sistema dentro dos padrões normais"}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-brand-muted">
            {description}
          </p>
        </div>
      </div>

      {/* Recommendation row */}
      <div className="flex items-start gap-2.5 pt-2.5">
        <IconBox variant="info" className="mt-0.5">
          ◎
        </IconBox>
        <div>
          <p className="text-[13px] font-semibold text-brand-cream">
            {recommendation}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-brand-muted">
            Recomendação baseada exclusivamente no Isolation Forest
          </p>
        </div>
      </div>
    </Card>
  );
}
