"use client";

import {
Lightbulb,
ArrowRight
} from "lucide-react";

import {
Button
} from "@/components/ui/button";

export function RecommendationCard({
message,
priority="high"
}) {

const priorityConfig={

high:{
border:
"border-[#A51F3D]/50",

icon:
"bg-[#A51F3D]"
},

medium:{
border:
"border-[#5E4D20]/50",

icon:
"bg-[#5E4D20]"
},

low:{
border:
"border-[#3B657A]/50",

icon:
"bg-[#3B657A]"
}

};

const config=
priorityConfig[
priority
];

return(

<div
className={`
glass-card
rounded-xl
p-5
border
${config.border}
`}
>

<div className="
flex
gap-4
">

<div
className={`
${config.icon}
p-2
rounded-lg
`}
>

<Lightbulb
className="
w-5
h-5
text-[#FFFAE2]
"
/>

</div>

<div>

<p className="
text-[#FFFAE2]
mb-4
">

{message}

</p>

<Button
variant="ghost"
size="sm"
>

Ver detalhes

<ArrowRight
className="
w-4
h-4
ml-1
"
/>

</Button>

</div>

</div>

</div>

);

}