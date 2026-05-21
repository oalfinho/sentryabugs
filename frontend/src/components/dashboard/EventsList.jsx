"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

const LEVEL_STYLES = {
  danger: {
    icon: "🔴",
    bg: "bg-red-950/30",
    border: "border-red-500/30",
    text: "text-red-400",
  },
  warn: {
    icon: "🟡",
    bg: "bg-orange-950/20",
    border: "border-orange-500/30",
    text: "text-orange-400",
  },
};

function EventItem({ event, faded = false }) {
  const s = LEVEL_STYLES[event.level] ?? LEVEL_STYLES.warn;
  const time = event.timestamp
    ? new Date(event.timestamp).toLocaleTimeString("pt-BR")
    : "";

  return (
    <div
      className={`
        relative flex items-start gap-3 rounded-lg border px-3 py-2.5
        ${s.bg} ${s.border}
        ${faded ? "overflow-hidden" : ""}
      `}
    >
      <span className="mt-0.5 text-base">{s.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[13px] font-semibold ${s.text}`}>{event.title}</p>
          <span className="shrink-0 font-mono text-[10px] text-brand-muted">
            {time}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-brand-muted">
          {event.desc}
        </p>
      </div>

      {/* Degradê cobrindo o 3º card */}
      {faded && (
        <div
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(9,15,21,0.85) 100%)",
          }}
        />
      )}
    </div>
  );
}

/**
 * EventsList — exibe os 3 eventos mais recentes com "ver mais".
 * O 3º card tem efeito de degradê para indicar que há mais eventos.
 * Sem event_permanent — baseado puramente nos eventos acumulados no hook.
 */
export function EventsList({ events = [] }) {
  const [expanded, setExpanded] = useState(false);

  const recent = [...events].reverse();
  const VISIBLE = 3;

  // Slice para exibição
  const visible = expanded ? recent : recent.slice(0, VISIBLE);
  const hasMore = recent.length > VISIBLE;

  return (
    <Card className="flex-1 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[.08em] text-brand-muted">
          Histórico de Eventos
        </p>
        {events.length > 0 && (
          <span className="rounded-full border border-brand-border px-2 py-0.5 font-mono text-[10px] text-brand-muted">
            {events.length} total
          </span>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col gap-2 py-2">
          <p className="text-center font-mono text-[12px] text-brand-muted">
            Nenhum evento Alerta ou Crítico registrado.
          </p>
          <p className="text-center font-mono text-[11px] text-brand-muted/60">
            O painel será atualizado ao detectar anomalias.
          </p>
        </div>
      ) : (
        <div className="flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1">
          {visible.map((ev, idx) => {
            const isLastVisible = idx === VISIBLE - 1 && !expanded && hasMore;
            return (
              <EventItem
                key={ev.id ?? `${ev.timestamp}-${ev.sensor_id}-${idx}`}
                event={ev}
                faded={isLastVisible}
              />
            );
          })}

          {hasMore && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 w-full rounded-lg border border-brand-border bg-white/[0.02] py-1.5 font-mono text-[11px] text-brand-muted transition-colors hover:bg-white/[0.05] hover:text-brand-cream"
            >
              {expanded
                ? "▲ Ver menos"
                : `▼ Ver mais (${recent.length - VISIBLE} ocultos)`}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
