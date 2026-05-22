"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ALERT_LIMIT,
  CRITICAL_LIMIT,
} from "@/lib/utils";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export function MachinesList() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/sensores`
        );

        if (!response.ok) {
          throw new Error(
            "Falha ao buscar máquinas"
          );
        }

        const data = await response.json();

        setMachines(data.data || []);
        setError(null);
      } catch (err) {
        console.error(err);

        setError(
          "Não foi possível carregar as máquinas"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();

    const interval = setInterval(
      fetchMachines,
      2000
    );

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm font-mono text-brand-muted">
          Carregando máquinas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-sm font-mono text-red-400">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <div className="mb-6">

        <h2 className="text-lg font-bold text-brand-cream">
          Máquinas Monitoradas
        </h2>

        <p className="mt-1 text-xs font-mono text-brand-muted">
          {machines.length} máquina
          {machines.length !== 1
            ? "s"
            : ""}
        </p>

      </div>

      <div className="grid gap-4 md:grid-cols-2">

        {machines.map((machine) => (

          <Link
            key={machine.sensor_id}
            href={`/dashboard?id=${machine.sensor_id}`}
          >

            <Card
              className="
              p-5
              cursor-pointer
              transition
              hover:scale-[1.02]
              "
              variant={
                machine.status ===
                "CRITICO"
                  ? "danger"
                  : "default"
              }
            >

              <div className="mb-4 flex items-start justify-between">

                <div>

                  <h3 className="text-base font-bold text-brand-cream">
                    {machine.sensor_id}
                  </h3>

                  <p className="mt-1 font-mono text-[11px] text-brand-muted">

                    Vibração:

                    {" "}

                    {(
                      machine.vib_rms *
                      100
                    ).toFixed(2)}

                    {" "}mm/s

                  </p>

                </div>

                <Badge
                  variant={
                    machine.status ===
                    "CRITICO"
                      ? "danger"
                      : machine.status ===
                        "ALERTA"
                      ? "warn"
                      : "safe"
                  }
                >
                  {machine.status}
                </Badge>

              </div>

              <div className="space-y-3 border-t border-brand-border pt-4">

                <div className="flex items-center justify-between">

                  <span className="text-[11px] font-mono text-brand-muted">
                    Temperatura
                  </span>

                  <span className="font-mono font-bold text-brand-cream">
                    {machine.temp?.toFixed(
                      1
                    )}
                    °C
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-[11px] font-mono text-brand-muted">
                    Threshold Alerta
                  </span>

                  <span className="font-mono text-[11px] text-brand-muted">
                    {ALERT_LIMIT} mm/s
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-[11px] font-mono text-brand-muted">
                    Threshold Crítico
                  </span>

                  <span className="font-mono text-[11px] text-brand-muted">
                    {CRITICAL_LIMIT} mm/s
                  </span>

                </div>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">

                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (
                          (machine.vib_rms *
                            100) /
                          CRITICAL_LIMIT
                        ) *
                          100,
                        100
                      )}%`,

                      background:
                        machine.vib_rms *
                          100 >
                        CRITICAL_LIMIT
                          ? "#e55353"
                          : machine.vib_rms *
                              100 >
                            ALERT_LIMIT
                          ? "#f59f0f"
                          : "#3bc9a0",
                    }}
                  />

                </div>

              </div>

              <div className="mt-3 border-t border-brand-border pt-3 text-right">

                <p className="text-[10px] font-mono text-brand-muted">

                  {new Date(
                    machine.timestamp
                  ).toLocaleTimeString(
                    "pt-BR"
                  )}

                </p>

              </div>

            </Card>

          </Link>

        ))}

      </div>

    </div>
  );
}