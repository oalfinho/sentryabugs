"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { VibrationChart } from "@/components/dashboard/VibrationChart";
import { EventsList } from "@/components/dashboard/EventsList";
import { useSensorData } from "@/hooks/useSensorData";

export default function MachineDashboard() {
  const { id } = useParams();
  const { data, history, events, loading, error, isConnected, clearEvents } =
    useSensorData();

  const isAlert = data?.status === "ALERTA" || data?.status === "CRITICO";

  return (
    <>
      <div className="mb-4">
        <Link
          href="/dashboard/maquinas"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-brand-muted transition-colors hover:text-brand-cream"
        >
          ← Voltar para Máquinas
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-cream">
          {id ?? "Máquina"}
        </h1>
        <p className="mt-1 font-mono text-[11px] text-brand-muted">
          Dashboard individual · monitoramento em tempo real
        </p>
      </div>

      <div
        className={`-mt-2 mb-6 border-b px-0 py-2 ${
          isConnected ? "border-brand-border" : "border-brand-border"
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
