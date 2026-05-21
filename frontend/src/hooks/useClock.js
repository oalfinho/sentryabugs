"use client";

import { useState, useEffect } from "react";
import { formatTime } from "@/lib/utils";

/**
 * Returns a live-updating timestamp string (HH:MM:SS, pt-BR).
 */
export function useClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(formatTime());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}
