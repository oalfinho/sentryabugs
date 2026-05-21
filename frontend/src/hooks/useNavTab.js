"use client";

import { useState } from "react";

const TABS = ["Visão Geral", "Máquinas", "Histórico"];

export function useNavTab() {
  const [active, setActive] = useState("Visão Geral");
  return { active, setActive, tabs: TABS };
}
