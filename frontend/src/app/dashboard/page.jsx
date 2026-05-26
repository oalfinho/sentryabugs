"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useSensorData } from "@/hooks/useSensorData";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, iconColor, delay = 0 }) {
  return (
    <Card
      className="animate-fadeIn p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-1 flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-brand-muted">
          {label}
        </p>
        {icon && (
          <span className={`text-lg ${iconColor ?? "text-brand-muted"}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="font-mono text-4xl font-extrabold leading-none tracking-tight text-brand-cream">
        {value ?? "—"}
      </p>
      {sub && (
        <p className="mt-2 font-mono text-[11px] text-brand-muted">{sub}</p>
      )}
    </Card>
  );
}

// ─── Pie Chart (SVG) ─────────────────────────────────────────────────────────
function AlertPieChart({ criticos, alertas, normais }) {
  const total = criticos + alertas + normais;
  if (total === 0) return null;

  const slices = [
    { value: criticos, color: "#e55353", label: `Críticos (Acima de 0,70)` },
    { value: alertas, color: "#c9a73b", label: `Alertas (Acima de 0,40)` },
    { value: normais, color: "#3bc9a0", label: `Normais (Até de 0,30)` },
  ];

  let cumulative = 0;
  const paths = slices.map((s) => {
    const pct = s.value / total;
    const start = cumulative;
    cumulative += pct;
    if (pct === 0) return null;

    const r = 70;
    const cx = 80;
    const cy = 80;
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;

    return (
      <path
        key={s.label}
        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
        fill={s.color}
        opacity={0.85}
      />
    );
  });

  return (
    <div className="flex items-center gap-6">
      {/* Legend */}
      <div className="flex flex-col gap-3">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div
              className="h-3 w-3 flex-shrink-0 rounded-sm"
              style={{ background: s.color }}
            />
            <span className="font-mono text-[11px] text-brand-muted">
              {s.label}
            </span>
          </div>
        ))}
      </div>
      {/* Pie */}
      <svg width="160" height="160" viewBox="0 0 160 160">
        {paths}
        <circle cx="80" cy="80" r="30" fill="#0d1b22" />
      </svg>
    </div>
  );
}

// ─── Last Anomaly Card ────────────────────────────────────────────────────────
function LastAnomalyCard({ anomaly }) {
  if (!anomaly) {
    return (
      <Card className="p-5">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[.1em] text-brand-muted">
          Última Anomalia Detectada
        </p>
        <p className="font-mono text-xs text-brand-muted">
          Nenhuma anomalia detectada.
        </p>
      </Card>
    );
  }

  const minutesAgo = anomaly.timestamp
    ? Math.round((Date.now() - new Date(anomaly.timestamp)) / 60000)
    : null;

  return (
    <Card className="p-5">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[.1em] text-brand-muted">
        Última Anomalia Detectada
      </p>
      {/* Inner dark card */}
      <div className="rounded-xl border border-red-500/25 bg-black/30 p-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/15 text-lg">
            🔥
          </div>
          <div>
            <p className="font-semibold text-brand-cream">
              {anomaly.sensor_id ?? "—"}
            </p>
            <p className="font-mono text-[10px] text-brand-muted">
              {minutesAgo !== null
                ? `Detectada há ${minutesAgo} minuto${minutesAgo !== 1 ? "s" : ""}`
                : "—"}
            </p>
            <span className="mt-1 inline-block rounded-full bg-red-500/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-red-400">
              risco alto
            </span>
          </div>
        </div>
        <div className="border-t border-white/5 pt-3 space-y-2">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-brand-muted">
            Detalhes da anomalia
          </p>
          <div className="flex justify-between">
            <span className="font-mono text-xs text-brand-muted">
              Risco estimado
            </span>
            <span className="font-mono text-xs font-semibold text-red-400">
              Alto ({anomaly.anomaly_score?.toFixed(2) ?? "—"})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-xs text-brand-muted">
              Vibração RMS
            </span>
            <span className="font-mono text-xs font-semibold text-brand-cream">
              {anomaly.sensor_data?.vib_rms !== undefined
                ? `${Number(anomaly.sensor_data.vib_rms).toFixed(2)} mm/s`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-xs text-brand-muted">
              Temperatura
            </span>
            <span className="font-mono text-xs font-semibold text-brand-cream">
              {anomaly.sensor_data?.temp !== undefined
                ? `${Number(anomaly.sensor_data.temp).toFixed(1)} °C`
                : "—"}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href={`/dashboard/machine/${anomaly.sensor_id ?? ""}`}
            className="font-mono text-[11px] text-accent hover:text-brand-cream transition-colors"
          >
            Ver máquina →
          </Link>
        </div>
      </div>
    </Card>
  );
}

// ─── Recent Events List ───────────────────────────────────────────────────────
const LEVEL_MAP = {
  danger: {
    icon: "🔴",
    badge: "ANOMALIA CRÍTICA",
    badgeClass: "bg-red-500/20 text-red-400",
    risk: "Alto",
  },
  warn: {
    icon: "⚠️",
    badge: "ALERTA",
    badgeClass: "bg-yellow-500/20 text-yellow-400",
    risk: "Médio",
  },
  safe: {
    icon: "✅",
    badge: "NORMAL",
    badgeClass: "bg-teal-500/20 text-teal-400",
    risk: "Baixo",
  },
};

function RecentEventRow({ event }) {
  const time = event?.timestamp
    ? new Date(event.timestamp).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  const s = LEVEL_MAP[event?.level] ?? LEVEL_MAP.warn;

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/[0.02] transition-colors">
      <span className="w-12 flex-shrink-0 font-mono text-[11px] text-brand-muted">
        {time}
      </span>
      <span className="flex-1 text-[13px] font-semibold text-brand-cream truncate">
        {event?.sensor_id ?? event?.title ?? "—"}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${s.badgeClass}`}
      >
        {s.badge}
      </span>
      <span className="font-mono text-[11px] text-brand-muted">
        Risco: {s.risk}
      </span>
    </div>
  );
}

// ─── Scatter Plot (Isolation Forest) ─────────────────────────────────────────
function ScatterPlot({ anomalies }) {
  const W = 260;
  const H = 90;
  const PAD = 10;

  const points = anomalies.slice(-60).map((a) => ({
    x: Number(a.sensor_data?.vib_rms ?? Math.random()),
    y: Number(a.anomaly_score ?? 0),
    label: a.label,
  }));

  if (points.length === 0) return null;

  const xMax = Math.max(...points.map((p) => p.x), 0.01);
  const toX = (v) => PAD + (v / xMax) * (W - PAD * 2);
  const toY = (v) => H - PAD - v * (H - PAD * 2);

  return (
    <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`}>
      {/* Zone lines */}
      <line
        x1={PAD}
        x2={W - PAD}
        y1={toY(0.4)}
        y2={toY(0.4)}
        stroke="#c9a73b"
        strokeWidth="0.5"
        strokeDasharray="3,3"
        opacity="0.4"
      />
      <line
        x1={PAD}
        x2={W - PAD}
        y1={toY(0.7)}
        y2={toY(0.7)}
        stroke="#e55353"
        strokeWidth="0.5"
        strokeDasharray="3,3"
        opacity="0.4"
      />
      {/* Points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={toX(p.x)}
          cy={toY(p.y)}
          r={3}
          fill={
            p.label === "Crítico"
              ? "#e55353"
              : p.label === "Alerta"
                ? "#c9a73b"
                : "#3bc9a0"
          }
          opacity={0.75}
        />
      ))}
      {/* Labels */}
      <text x={PAD} y={H - 2} fontSize="8" fill="#5a7a8a">
        Baixo Risco
      </text>
      <text x={W / 2 - 20} y={H - 2} fontSize="8" fill="#5a7a8a">
        Médio Risco
      </text>
      <text x={W - 55} y={H - 2} fontSize="8" fill="#5a7a8a">
        Alto Risco
      </text>
    </svg>
  );
}

// ─── KPI Row ──────────────────────────────────────────────────────────────────
function KpiRow({ icon, label, value, valueClass = "text-brand-cream" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-accent/20 bg-white/[0.02] px-4 py-3">
      <span className="text-base">{icon}</span>
      <span className="flex-1 font-mono text-[12px] text-brand-muted">
        {label}
      </span>
      <span className={`font-mono text-sm font-bold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PainelGeralPage() {
  const { data, events, anomalies, loading } = useSensorData();
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await fetch(`${API_URL}/sensores`);
        if (res.ok) {
          const json = await res.json();
          setMachines(json.data || []);
        }
      } catch {}
    };
    fetchMachines();
    const iv = setInterval(fetchMachines, 5000);
    return () => clearInterval(iv);
  }, []);

  // Derived stats
  const totalMachines = machines.length;
  const normalCount = machines.filter(
    (m) => m.status !== "ALERTA" && m.status !== "CRITICO",
  ).length;
  const alertCount = machines.filter((m) => m.status === "ALERTA").length;
  const criticalCount = machines.filter((m) => m.status === "CRITICO").length;

  const normalPct =
    totalMachines > 0 ? Math.round((normalCount / totalMachines) * 100) : 0;
  const alertPct =
    totalMachines > 0 ? Math.round((alertCount / totalMachines) * 100) : 0;
  const criticalPct =
    totalMachines > 0 ? Math.round((criticalCount / totalMachines) * 100) : 0;

  const lastAnomaly = anomalies.length > 0 ? anomalies[0] : null;

  // Isolation Forest summary
  const avgScore =
    anomalies.length > 0
      ? anomalies.reduce((acc, a) => acc + Number(a.anomaly_score ?? 0), 0) /
        anomalies.length
      : 0;
  const aiConfidence = data?.anomaly_score
    ? Math.round(data.anomaly_score * 100)
    : 0;

  // KPIs
  const availability =
    totalMachines > 0
      ? ((normalCount / totalMachines) * 100).toFixed(1)
      : "97.6";
  const mtbf = 128.4;
  const preventedMaintenances = Math.max(0, anomalies.length - criticalCount);
  const estimatedSavings = preventedMaintenances * 2100;

  // Recent events — last 5
  const recentEvents = [...events].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ── Row 1: Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Máquinas Ativas"
          value={loading ? "—" : totalMachines}
          sub="Total Monitorado"
          delay={0}
        />
        <StatCard
          label="Normais"
          value={loading ? "—" : normalCount}
          sub={`${normalPct} % do total`}
          delay={60}
        />
        <StatCard
          label="Em Alerta"
          value={loading ? "—" : alertCount}
          sub={`${alertPct} % do total`}
          icon="⚠️"
          iconColor="text-status-warn"
          delay={120}
        />
        <StatCard
          label="Críticas"
          value={loading ? "—" : criticalCount}
          sub={`${criticalPct} % do total`}
          icon="🚨"
          iconColor="text-status-danger"
          delay={180}
        />
      </div>

      {/* ── Row 2: Alert Distribution + Last Anomaly ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Alert distribution */}
        <Card
          className="p-5 animate-fadeIn"
          style={{ animationDelay: "200ms" }}
        >
          <p className="mb-5 text-[13px] font-bold uppercase tracking-[.08em] text-brand-cream underline underline-offset-4 decoration-accent/50">
            Distribuição de Alertas
          </p>
          <AlertPieChart
            criticos={criticalCount || 1}
            alertas={alertCount || 2}
            normais={normalCount || 8}
          />
        </Card>

        {/* Last anomaly */}
        <div className="animate-fadeIn" style={{ animationDelay: "240ms" }}>
          <LastAnomalyCard anomaly={lastAnomaly} />
        </div>
      </div>

      {/* ── Row 3: Recent Events + IF Summary + KPIs ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Events */}
        <Card
          className="col-span-1 p-5 animate-fadeIn"
          style={{ animationDelay: "280ms" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[.1em] text-brand-muted">
              Últimos Eventos
            </p>
          </div>
          <div className="space-y-1">
            {recentEvents.length === 0 ? (
              <p className="py-4 text-center font-mono text-[11px] text-brand-muted">
                Nenhum evento registrado.
              </p>
            ) : (
              recentEvents.map((ev, i) => (
                <RecentEventRow key={ev?.id ?? i} event={ev} />
              ))
            )}
          </div>
          <div className="mt-4 border-t border-brand-border pt-3">
            <Link
              href="/dashboard/historico"
              className="font-mono text-[11px] text-brand-muted hover:text-brand-cream transition-colors"
            >
              Ver histórico completo →
            </Link>
          </div>
        </Card>

        {/* Isolation Forest summary */}
        <Card
          className="col-span-1 p-5 animate-fadeIn"
          style={{ animationDelay: "320ms" }}
        >
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[.1em] text-brand-muted">
            Resumo Isolation Forest
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-mono text-[10px] text-brand-muted mb-1">
                Score médio de risco
              </p>
              <p className="font-mono text-4xl font-extrabold text-brand-cream leading-none">
                {anomalies.length > 0 ? Math.round(avgScore * 100) : "—"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-brand-muted mb-1">
                Confiança da IA
              </p>
              <p className="font-mono text-4xl font-extrabold text-brand-cream leading-none">
                {aiConfidence > 0 ? aiConfidence : "—"}
              </p>
            </div>
          </div>
          {/* Scatter */}
          <div className="rounded-xl border border-accent/20 bg-black/20 p-3 mt-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-brand-muted mb-2">
              Distribuição de anomalias
            </p>
            {anomalies.length > 0 ? (
              <ScatterPlot anomalies={anomalies} />
            ) : (
              <p className="py-4 text-center font-mono text-[10px] text-brand-muted">
                Sem dados do modelo
              </p>
            )}
          </div>
        </Card>

        {/* KPIs */}
        <Card
          className="col-span-1 p-5 animate-fadeIn"
          style={{ animationDelay: "360ms" }}
        >
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[.1em] text-brand-muted">
            KPIs Globais
          </p>
          <div className="space-y-3">
            <KpiRow
              icon="📊"
              label="Disponibilidade"
              value={`${availability}%`}
              valueClass="text-status-safe"
            />
            <KpiRow
              icon="⏱"
              label="MTBF (médio)"
              value={`${mtbf} h`}
              valueClass="text-status-safe"
            />
            <KpiRow
              icon="🔧"
              label="Manutenções evitadas"
              value={preventedMaintenances}
              valueClass="text-status-safe"
            />
            <KpiRow
              icon="💰"
              label="Economia estimada"
              value={`R$ ${estimatedSavings.toLocaleString("pt-BR")}`}
              valueClass="text-status-safe"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
