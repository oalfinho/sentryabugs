"use client";

import { useSearchParams } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import Link from "next/link";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { VibrationChart } from "@/components/dashboard/VibrationChart";
import { EventsList } from "@/components/dashboard/EventsList";

import { useSensorData } from "@/hooks/useSensorData";

export default function MachineDashboard() {
  const searchParams = useSearchParams();

  const machineId = searchParams.get("id");

  const { data, history, loading } = useSensorData();

  if (!data) {
    return <div className="p-10 text-center">Carregando máquina...</div>;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNav />

      <main className="p-6">
        <Link
          href="/dashboard/maquinas"
          className="
                    mb-6
                    inline-block
                    text-sm
                    text-brand-muted
                    hover:text-brand-cream
                    "
        >
          ← Voltar para máquinas
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-cream">{machineId}</h1>

          <p className="text-brand-muted">Dashboard individual da máquina</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatusCard data={data} loading={loading} />

          <InsightCard data={data} />

          <VibrationChart history={history} status={data.status} />

          <div className="flex flex-col gap-4">
            <MetricsCard
              vibracao={data.vibracao}
              temperatura={data.temperatura}
            />

            <EventsList events={data.events ?? []} />
          </div>
        </div>
      </main>
    </div>
  );
}
