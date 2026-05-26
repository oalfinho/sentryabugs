"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Trash2 } from "lucide-react";

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
  if (!event) return null;
  const s = LEVEL_STYLES[event?.level] ?? LEVEL_STYLES.warn;
  const time = event?.timestamp
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
          <p className={`text-[13px] font-semibold ${s.text}`}>
            {event?.title}
          </p>
          <span className="shrink-0 font-mono text-[10px] text-brand-muted">
            {time}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-[11px] text-brand-muted">
          {event?.desc}
        </p>
      </div>

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

export function EventsList({ events = [], onClear }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // filter(Boolean) remove qualquer null/undefined antes de processar
  const recent = [...events].filter(Boolean).reverse();
  const VISIBLE = 3;
  const visible = expanded ? recent : recent.slice(0, VISIBLE);
  const hasMore = recent.length > VISIBLE;

  return (
    <Card className="flex-1 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[.08em] text-brand-muted">
          Histórico de Eventos
        </p>

        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <span className="rounded-full border border-brand-border px-2 py-0.5 font-mono text-[10px] text-brand-muted">
              {events.length} total
            </span>
          )}

          {events.length > 0 &&
            (confirmClear ? (
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-brand-muted">
                  Limpar?
                </span>
                <button
                  onClick={() => {
                    onClear?.();
                    setConfirmClear(false);
                  }}
                  className="rounded px-2 py-0.5 font-mono text-[10px] text-red-400 hover:bg-red-950/30"
                >
                  Sim
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="rounded px-2 py-0.5 font-mono text-[10px] text-brand-muted hover:bg-white/[0.04]"
                >
                  Não
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-brand-muted transition-colors hover:bg-red-950/20 hover:text-red-400"
              >
                <Trash2 size={11} />
                <span className="font-mono text-[10px]">Limpar</span>
              </button>
            ))}
        </div>
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
                key={ev?.id ?? `${ev?.timestamp}-${ev?.sensor_id}-${idx}`}
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
