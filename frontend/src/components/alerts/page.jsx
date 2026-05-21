"use client";

import { AlertCard } from "@/components/alerts/AlertCard";
import { CriticalTable } from "@/components/alerts/CriticalTable";
import { RecommendationCard } from "@/components/alerts/RecommendationCard";
import { RiskPanel } from "@/components/alerts/RiskPanel";

export default function AlertsPage() {

const alerts = [
{
id:"1",
title:"Anomalia detectada",
machine:"Motor A",
location:"Linha 1",
sector:"Usinagem",
time:"2 min",
sensor:"VIB_01",
aiConfidence:94,
isolationScore:-0.82,
estimatedFailure:"15 min",
currentVibration:480,
severity:"critical",
insight:
"Crescimento contínuo de vibração"
}
];

const critical = [
{
id:"1",
status:"critico",
machine:"Motor A",
risk:92,
trend:"up"
}
];

return (

<div className="
min-h-screen
bg-black
p-8
text-white
">

<h1 className="
text-3xl
font-bold
mb-8
">

CENTRAL DE ALERTAS

</h1>

<div className="
grid
grid-cols-1
lg:grid-cols-3
gap-6
mb-6
">

<div className="lg:col-span-2">

<RiskPanel
riskPercentage={28}
criticalMachines={3}
progressiveFailures={4}
urgentMaintenance={2}
/>

</div>

<RecommendationCard
message="
Verificar rolamentos
do Motor A
"
/>

</div>

<div className="mb-6">

<CriticalTable
machines={critical}
/>

</div>

<div>

{alerts.map(
(alert)=>(

<AlertCard
key={alert.id}
alert={alert}
/>

)
)}

</div>

</div>

);

}