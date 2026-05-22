"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  SAFE_LIMIT,
  ALERT_LIMIT,
  CRITICAL_LIMIT,
  getVibrationStatus,
} from "@/lib/utils";

Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
);

/** Plugin: desenha linha de limite seguro */
const safeLimitPlugin = {
  id: "safeLimitLine",
  afterDatasetsDraw(chart) {
    const {
      ctx,
      chartArea: { top, bottom, left, right },
      scales: { y },
    } = chart;

    if (!y) return;

    const yPx = y.getPixelForValue(SAFE_LIMIT);

    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "rgba(229,160,59,0.55)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(left, yPx);
    ctx.lineTo(right, yPx);
    ctx.stroke();

    ctx.fillStyle = "rgba(229,160,59,0.65)";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.fillText("Limite seguro", left + 6, yPx - 5);

    ctx.setLineDash([]);
    ctx.restore();
  },
};

export function VibrationChart({ history, isAnomaly, status }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // Inicializa gráfico uma vez
  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      plugins: [safeLimitPlugin],
      data: {
        labels: [],
        datasets: [
          {
            label: "Vibração (mm/s)",
            data: [],
            borderColor: "rgba(59,201,160,0.9)",
            backgroundColor: "rgba(59,201,160,0.08)",
            pointBackgroundColor: [],
            pointBorderColor: [],
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            segment: {
              borderColor: (ctx) => {
                if (ctx.p0DataIndex == null || ctx.p1DataIndex == null) {
                  return "rgba(59,201,160,0.9)";
                }

                if (!ctx?.dataset?.data) {
                  return "rgba(59,201,160,0.9)";
                }

                const v = ctx.dataset.data[ctx.p1DataIndex];
                if (v > CRITICAL_LIMIT) return "rgba(229,83,83,0.95)";
                if (v > ALERT_LIMIT) return "rgba(245,159,0,0.9)";
                return "rgba(59,201,160,0.9)";
              },
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 300,
          easing: "easeInOutQuart",
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#8aacba",
              font: { family: "JetBrains Mono", size: 10 },
              boxWidth: 12,
              padding: 8,
              usePointStyle: true,
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(20,32,38,.95)",
            borderColor: "rgba(59,101,122,.5)",
            borderWidth: 1,
            titleColor: "#8aacba",
            bodyColor: "#FFFAE2",
            padding: 12,
            titleFont: { family: "JetBrains Mono", size: 11 },
            bodyFont: { family: "JetBrains Mono", size: 10 },
            caretPadding: 8,
            cornerRadius: 4,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                const statusText = getVibrationStatus(value, status);
                return `Vibração: ${value.toFixed(2)} mm/s [${statusText}]`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(59,101,122,0.08)", drawBorder: false },
            ticks: {
              color: "#8aacba",
              font: { family: "JetBrains Mono", size: 8 },
              maxRotation: 45,
              minRotation: 0,
            },
            border: { color: "rgba(59,101,122,0.2)" },
          },
          y: {
            min: 0,
            grid: { color: "rgba(59,101,122,0.1)", drawBorder: false },
            ticks: {
              color: "#8aacba",
              font: { family: "JetBrains Mono", size: 9 },
              stepSize: 100,
              callback: (value) => `${value}`,
            },
            border: { color: "rgba(59,101,122,0.2)" },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, []);

  // Atualiza gráfico quando histórico muda (com throttling para performance)
  useEffect(() => {
    if (!chartRef.current || !history.length) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < 100) return;
    lastUpdateRef.current = now;

    const ds = chartRef.current.data.datasets[0];
    const values = history.map((p) => p.value);
    const colors = values.map((v, i) => {
      const isLast = i === values.length - 1;
      if (isLast && v > CRITICAL_LIMIT) return "#e55353";
      if (isLast && v > ALERT_LIMIT) return "#f59f0f";
      if (v > CRITICAL_LIMIT) return "rgba(229,83,83,0.8)";
      if (v > ALERT_LIMIT) return "rgba(245,159,0,0.86)";
      return "rgba(59,201,160,0.9)";
    });

    chartRef.current.data.labels = history.map((p) => p.label);
    ds.data = values;
    ds.pointBackgroundColor = colors;
    ds.pointBorderColor = colors;

    const maxVal = Math.max(...values, SAFE_LIMIT + 1);
    chartRef.current.options.scales.y.max = Math.ceil(maxVal * 1.2);

    if (status === "CRITICO") {
      ds.borderColor = "rgba(229,83,83,0.85)";
      ds.backgroundColor = "rgba(229,83,83,0.08)";
    } else if (status === "ALERTA") {
      ds.borderColor = "rgba(245,159,0,0.95)";
      ds.backgroundColor = "rgba(245,159,0,0.12)";
    } else {
      ds.borderColor = "rgba(59,201,160,0.9)";
      ds.backgroundColor = "rgba(59,201,160,0.08)";
    }

    chartRef.current.update("none"); // "none" para atualizar sem animação
  }, [history, isAnomaly]);

  const latestValue =
    history.length > 0 ? history[history.length - 1]?.value : null;
  const formattedValue = latestValue !== null ? latestValue.toFixed(2) : "—";
  const currentStatus = getVibrationStatus(latestValue, status);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-brand-cream">
            Análise da Vibração em Tempo Real
          </h3>
          <p className="mt-1 font-mono text-[11px] text-brand-muted">
            {history.length} leituras • Valor atual:{" "}
            <span
              className={
                latestValue > ALERT_LIMIT ? "text-red-400" : "text-green-400"
              }
            >
              {formattedValue} mm/s
            </span>
          </p>
        </div>
        <Badge
          variant={
            status === "CRITICO"
              ? "danger"
              : status === "ALERTA"
                ? "warn"
                : "safe"
          }
        >
          ● {currentStatus}
        </Badge>
      </div>

      <div className="relative h-48 w-full">
        <canvas ref={canvasRef} />
      </div>

      <div className="mt-4 flex justify-between border-t border-brand-border pt-3">
        <div className="text-[10px] text-brand-muted">
          <p className="font-bold text-brand-cream">Máximo:</p>
          <p className="text-red-400">
            {history.length > 0
              ? Math.max(...history.map((p) => p.value)).toFixed(2)
              : "—"}{" "}
            mm/s
          </p>
        </div>
        <div className="text-[10px] text-brand-muted">
          <p className="font-bold text-brand-cream">Mínimo:</p>
          <p className="text-green-400">
            {history.length > 0
              ? Math.min(...history.map((p) => p.value)).toFixed(2)
              : "—"}{" "}
            mm/s
          </p>
        </div>
        <div className="text-[10px] text-brand-muted">
          <p className="font-bold text-brand-cream">Média:</p>
          <p className="text-blue-400">
            {history.length > 0
              ? (
                  history.reduce((sum, p) => sum + p.value, 0) / history.length
                ).toFixed(2)
              : "—"}{" "}
            mm/s
          </p>
        </div>
      </div>
    </Card>
  );
}
