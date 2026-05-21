"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  AlertCircle,
  Eye,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

const statusConfig = {
  critico: {
    badge: "bg-[#A51F3D] text-[#FFFAE2]",

    label: "Crítico",
  },

  "falha-progressiva": {
    badge: "bg-[#5E4D20] text-[#FFFAE2]",

    label: "Falha progressiva",
  },

  monitorado: {
    badge: "bg-[#3B657A] text-[#FFFAE2]",

    label: "Monitorado",
  },
};

const trendConfig = {
  up: {
    icon: TrendingUp,
  },

  down: {
    icon: TrendingDown,
  },

  stable: {
    icon: Minus,
  },
};

export function CriticalTable({ machines }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="mb-4 flex gap-3">
        <div
          className="
w-8
h-8
rounded-full
bg-[#A51F3D]
flex
items-center
justify-center
"
        >
          <AlertTriangle
            className="
w-4
h-4
text-[#FFFAE2]
"
          />
        </div>

        <div>
          <h3
            className="
text-[#FFFAE2]
font-bold
text-lg
"
          >
            Críticos
          </h3>

          <p
            className="
text-[#D9D9D9]
text-sm
"
          >
            Prioridade máxima
          </p>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>Status</th>

            <th>Máquina</th>
          </tr>
        </thead>

        <tbody>
          {machines.map((machine) => {
            const status =
              statusConfig[machine.status] || statusConfig.monitorado;

            return (
              <tr key={machine.id}>
                <td>
                  <Badge className={status.badge}>{status.label}</Badge>
                </td>

                <td>
                  <p>{machine.machine}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
