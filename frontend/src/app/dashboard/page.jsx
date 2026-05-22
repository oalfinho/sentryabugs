"use client";

import { StatusCard } from "@/components/dashboard/StatusCard";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { VibrationChart } from "@/components/dashboard/VibrationChart";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { EventsList } from "@/components/dashboard/EventsList";
import { useSensorData } from "@/hooks/useSensorData";

export default function DashboardPage() {
  const { data, history, events, loading, error, isConnected, clearEvents } =
    useSensorData();

  const isAlert = data?.status === "ALERTA" || data?.status === "CRITICO";

  return (
    <>
      {/* Banner de conexão */}
      <div
        className={`-mt-6 mb-6 border-b px-6 py-2 ${
          isConnected
            ? "border-brand-border bg-green-950/10"
            : "border-brand-border bg-red-950/20"
        }`}
      >
        <p
          className={`font-mono text-xs ${isConnected ? "text-green-400" : "text-red-400"}`}
        >
          {isConnected
            ? "✓ Conectado — recebendo dados do ESP32 em tempo real"
            : error
              ? `⚠️ ${error}`
              : "⚠️ Aguardando conexão com o servidor..."}
        </p>
      </div>

      {/* Grid principal */}
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
    </>
  );
}
