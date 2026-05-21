import { clsx } from "clsx";

// Re-export clsx for convenience
export { clsx as cn };

// ─── Vibration helpers ────────────────────────────────────────────────────────

export const SAFE_LIMIT = 150;
export const ALERT_LIMIT = 150;
export const CRITICAL_LIMIT = 300;

export function isAnomaly(vibracao, status) {
  if (typeof status === "string") {
    return ["ALERTA", "CRITICO", "CRÍTICO"].includes(status.toUpperCase());
  }
  return typeof vibracao === "number" && vibracao > ALERT_LIMIT;
}

export function getVibrationStatus(value, status) {
  if (typeof status === "string") {
    return status.toUpperCase();
  }
  if (value > CRITICAL_LIMIT) return "CRÍTICO";
  if (value > ALERT_LIMIT) return "ALERTA";
  if (value > 80) return "ATENÇÃO";
  return "OK";
}

/** Returns a readable insight string based on vibration level. */
export function getInsightMessage(vibracao, status) {
  const level = getVibrationStatus(vibracao, status);
  if (level === "CRÍTICO") return "Nível Crítico: Parada Imediata Recomendada";
  if (level === "ALERTA") return "Alerta detectado — monitorar imediatamente";
  if (level === "ATENÇÃO")
    return "Nível de atenção — pequena oscilação detectada";
  return "Padrão de vibração estável";
}

// ─── Chart labels ─────────────────────────────────────────────────────────────

const TIME_LABELS = [
  "15min",
  "30min",
  "1h",
  "1h30",
  "2h",
  "2h30",
  "3h",
  "3h30",
];

export function getNextChartLabel(index) {
  return TIME_LABELS[index] ?? `${index * 15}min`;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatPercent(value) {
  return `${Math.round(value)}%`;
}

// ─── Event level colors ───────────────────────────────────────────────────────

export const EVENT_COLORS = {
  danger: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-status-danger",
    dot: "bg-red-400",
  },
  warn: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-status-warn",
    dot: "bg-yellow-400",
  },
  safe: {
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    text: "text-status-safe",
    dot: "bg-teal-400",
  },
};
