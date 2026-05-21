"use client";

import {
TrendingUp,
AlertTriangle,
AlertCircle,
Wrench
} from "lucide-react";

export function RiskPanel({

riskPercentage,

criticalMachines,

progressiveFailures,

urgentMaintenance

}) {

return(

<div className="
glass-card
rounded-xl
p-5
">

<div className="
flex
justify-between
mb-4
">

<h3 className="
text-[#FFFAE2]
font-bold
">

Taxa de risco

</h3>

<span className="
text-[#A51F3D]
font-bold
">

+{riskPercentage}%

</span>

</div>

<div className="
space-y-3
">

<div className="
flex
gap-3
">

<AlertTriangle/>

<span>

{criticalMachines}
máquinas críticas

</span>

</div>

<div className="
flex
gap-3
">

<AlertCircle/>

<span>

{progressiveFailures}
falhas progressivas

</span>

</div>

<div className="
flex
gap-3
">

<Wrench/>

<span>

{urgentMaintenance}
manutenção urgente

</span>

</div>

</div>

</div>

);

}