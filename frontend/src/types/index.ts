// ─── Sensor / API response ───────────────────────────────────────────────────

export type EventLevel = "danger" | "warn" | "safe";

export interface SensorEvent {
  level: EventLevel;
  title: string;
  desc: string;
}

export interface SensorData {
  vibracao: number;      // raw vibration reading
  temperatura: number;  // °C
  energia: number;      // Volts
  status: "normal" | "anomalia";
  ultima_falha: number; // minutes ago
  risk_pct: number;     // 0–100
  events: SensorEvent[];
}

// ─── UI state ─────────────────────────────────────────────────────────────────

export type NavTab = "Visão Geral" | "Máquinas" | "Histórico";

export interface ChartPoint {
  label: string;
  value: number;
}

// ─── Component props ──────────────────────────────────────────────────────────

export interface StatusCardProps {
  data: SensorData | null;
  loading: boolean;
}

export interface InsightCardProps {
  data: SensorData | null;
}

export interface MetricsCardProps {
  vibracao: number;
  temperatura: number;
  energia: number;
}

export interface EventsListProps {
  events: SensorEvent[];
}

export interface VibrationChartProps {
  history: ChartPoint[];
  isAnomaly: boolean;
}
