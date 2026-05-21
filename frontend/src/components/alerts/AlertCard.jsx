"use client";

import {
  Clock,
  MapPin,
  Activity,
  Brain,
  TrendingUp,
  Wrench,
  Eye,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";

const severityConfig = {
  critical: {
    bg: "bg-gradient-to-r from-[#7A1025]/90 to-[#A51F3D]/70",

    border: "border-[#A51F3D]/50",

    badge: "bg-[#A51F3D] text-[#FFFAE2]",

    badgeText: "Crítico",

    glow: "animate-pulse-critical",

    insightBg: "bg-[#7A1025]/40",
  },

  alert: {
    bg: "bg-gradient-to-r from-[#5E4D20]/90 to-[#7A6A30]/70",

    border: "border-[#5E4D20]/50",

    badge: "bg-[#5E4D20] text-[#FFFAE2]",

    badgeText: "Alerta",

    glow: "animate-pulse-alert",

    insightBg: "bg-[#5E4D20]/40",
  },

  moderate: {
    bg: "bg-gradient-to-r from-[#123142]/90 to-[#3B657A]/70",

    border: "border-[#3B657A]/50",

    badge: "bg-[#3B657A] text-[#FFFAE2]",

    badgeText: "Moderado",

    glow: "",

    insightBg: "bg-[#123142]/40",
  },
};

export function AlertCard({
  alert,
  onMarkRead,
  onOpenDetails,
  onGenerateMaintenance,
}) {
  const config = severityConfig[alert.severity] || severityConfig.moderate;

  return (
    <div
      className={`

rounded-xl
p-5
mb-4

transition-all
duration-300

hover:translate-y-[-2px]
hover:shadow-xl

${config.bg}
${config.border}
${config.glow}

border
backdrop-blur-sm

`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[#FFFAE2] font-bold text-lg mb-2">
            {alert.title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-[#D9D9D9]">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {alert.location}-{alert.sector}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />

              {alert.time}
            </span>
          </div>
        </div>

        <Badge
          className={`
${config.badge}
px-3
py-1
text-sm
font-semibold
`}
        >
          {config.badgeText}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#3B657A]" />

          <div>
            <p className="text-xs text-[#D9D9D9]">Sensor</p>

            <p className="text-sm text-[#FFFAE2] font-medium">{alert.sensor}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#3B657A]" />

          <div>
            <p className="text-xs text-[#D9D9D9]">Confiança IA</p>

            <p className="text-sm text-[#FFFAE2] font-medium">
              {alert.aiConfidence}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#3B657A]" />

          <div>
            <p className="text-xs text-[#D9D9D9]">Isolation Forest</p>

            <p className="text-sm text-[#FFFAE2] font-medium">
              {alert.isolationScore}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#A51F3D]" />

          <div>
            <p className="text-xs text-[#D9D9D9]">Falha est.</p>

            <p className="text-sm text-[#FFFAE2] font-medium">
              {alert.estimatedFailure}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="px-3 py-2 rounded-lg bg-[#142026]/50">
          <p className="text-xs text-[#D9D9D9]">Vibração atual</p>

          <p className="text-lg text-[#FFFAE2] font-bold">
            {alert.currentVibration}
            mm/s
          </p>
        </div>
      </div>

      <div
        className={`
${config.insightBg}
rounded-lg
p-3
mb-4
border
border-[#FFFAE2]/10
`}
      >
        <p className="text-sm text-[#FFFAE2]/90">{alert.insight}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMarkRead?.(alert.id)}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Marcar como lido
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenDetails?.(alert.id)}
        >
          <Eye className="w-4 h-4 mr-1" />
          Abrir detalhes
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onGenerateMaintenance?.(alert.id)}
        >
          <Wrench className="w-4 h-4 mr-1" />
          Gerar manutenção
        </Button>
      </div>
    </div>
  );
}
