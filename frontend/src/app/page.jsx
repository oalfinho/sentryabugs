"use client";

import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { MachineList } from "@/components/machines/MachineList";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { VibrationChart } from "@/components/dashboard/VibrationChart";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { EventsList } from "@/components/dashboard/EventsList";
import { Card } from "@/components/ui/Card";
import { useSensorData } from "@/hooks/useSensorData";
import { useNavTab } from "@/hooks/useNavTab";

export default function DashboardPage() {
  const {
    data,
    history,
    anomalies,
    events,
    loading,
    error,
    isConnected,
    clearEvents,
  } = useSensorData();

  const { active } = useNavTab();

  const isAlert = data?.status === "ALERTA" || data?.status === "CRITICO";

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <TopNav />

      {/* Status da conexão */}
      {active === "Visão Geral" && (
        <div
          className={`border-b px-6 py-2 ${
            isConnected
              ? "border-brand-border bg-green-950/10"
              : "border-brand-border bg-red-950/20"
          }`}
        >
          <p
            className={`text-xs font-mono ${
              isConnected ? "text-green-400" : "text-red-400"
            }`}
          >
            {isConnected
              ? "✓ Conectado — recebendo dados do ESP32 em tempo real"
              : error
                ? `⚠️ ${error}`
                : "⚠️ Aguardando conexão com o servidor..."}
          </p>
        </div>
      )}

      <main className="flex-1 p-6">
        {/* ── Visão Geral ── */}
        {active === "Visão Geral" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="animate-fadeIn" style={{ animationDelay: "0ms" }}>
              <StatusCard data={data} loading={loading} />
            </div>

            <div className="animate-fadeIn" style={{ animationDelay: "80ms" }}>
              <InsightCard data={data} />
            </div>

            <div className="animate-fadeIn" style={{ animationDelay: "160ms" }}>
              <VibrationChart
                history={history}
                isAnomaly={isAlert}
                status={data?.status}
              />
            </div>

            <div
              className="flex animate-fadeIn flex-col gap-4"
              style={{ animationDelay: "240ms" }}
            >
              <MetricsCard
                vibracao={data?.vibracao ?? null}
                temperatura={data?.temperatura ?? null}
              />
              <EventsList events={events} onClear={clearEvents} />
            </div>
          </div>
        )}

        {/* ── Máquinas ── */}
        {active === "Máquinas" && (
          <div className="animate-fadeIn">
            <MachinesList />
          </div>
        )}

        {/* ── Histórico ── */}
        {active === "Histórico" && (
          <div className="animate-fadeIn space-y-6">
            {/* Tabela de leituras */}
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-cream">
                    Histórico de leituras
                  </p>
                  <p className="mt-1 text-xs font-mono text-brand-muted">
                    Últimos registros do ESP32 armazenados no SQLite.
                  </p>
                </div>
                <span className="rounded-full border border-brand-border px-3 py-1 text-[11px] font-semibold text-brand-muted">
                  {history.length} leituras
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-border text-left text-[13px]">
                  <thead>
                    <tr className="text-brand-muted">
                      {[
                        "Hora",
                        "Vibração (g)",
                        "Temperatura (°C)",
                        "Energia",
                        "Status IA",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-3 font-mono uppercase tracking-[.16em]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {history.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-4 text-sm text-brand-muted"
                        >
                          Nenhum dado disponível ainda.
                        </td>
                      </tr>
                    ) : (
                      [...history].reverse().map((entry, i) => (
                        <tr
                          key={`${entry.timestamp}-${i}`}
                          className={`hover:bg-slate-950/10 ${
                            entry.label_ia === "Crítico"
                              ? "bg-red-950/10"
                              : entry.label_ia === "Alerta"
                                ? "bg-orange-950/10"
                                : ""
                          }`}
                        >
                          <td className="px-3 py-3 font-mono text-xs text-brand-cream">
                            {entry.label}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-brand-cream">
                            {Number(entry.value ?? 0).toFixed(4)}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-brand-cream">
                            {Number(entry.temperatura ?? 0).toFixed(1)}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-brand-cream">
                            {Number(entry.energia ?? 0).toFixed(4)}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                entry.label_ia === "Crítico"
                                  ? "bg-red-500/20 text-red-400"
                                  : entry.label_ia === "Alerta"
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {entry.label_ia ?? "Normal"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Detalhes do Isolation Forest */}
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-400">
                    Detalhes — Isolation Forest
                  </p>
                  <p className="mt-1 text-xs font-mono text-brand-muted">
                    Features brutas de cada inferência do modelo.
                  </p>
                </div>
                <span className="rounded-full border border-red-500/20 bg-red-950/10 px-3 py-1 text-[11px] font-semibold text-red-400">
                  {anomalies.length} inferências
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-red-500/20 text-left text-[13px]">
                  <thead>
                    <tr className="text-red-400/70">
                      {[
                        "Timestamp",
                        "Sensor",
                        "Vibração",
                        "Temp",
                        "Score IF",
                        "Nível",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-3 font-mono uppercase tracking-[.16em]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-500/10">
                    {anomalies.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-4 text-sm text-brand-muted"
                        >
                          Nenhuma anomalia detectada ainda.
                        </td>
                      </tr>
                    ) : (
                      anomalies.map((a, i) => (
                        <tr
                          key={`${a.timestamp}-${i}`}
                          className="hover:bg-red-950/5"
                        >
                          <td className="px-3 py-3 font-mono text-xs text-red-300">
                            {a.formattedTime ??
                              new Date(a.timestamp).toLocaleString("pt-BR")}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-red-300">
                            {a.sensor_id ?? "—"}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-red-300">
                            {Number(a.sensor_data?.vib_rms ?? 0).toFixed(4)}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-red-300">
                            {Number(a.sensor_data?.temp ?? 0).toFixed(1)}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-red-300">
                            {(a.anomaly_score * 100).toFixed(1)}%
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                a.label === "Crítico"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-orange-500/20 text-orange-400"
                              }`}
                            >
                              {a.label}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
