// Sentrya API v3
// getEventos / event_permanent removidos para testes

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getSensores() {
  try {
    const res = await fetch(`${API_URL}/sensores`);
    return await res.json();
  } catch {
    return { status: "error", data: [], count: 0 };
  }
}

export async function getSensor(sensorId) {
  try {
    const res = await fetch(`${API_URL}/sensores/${sensorId}`);
    if (!res.ok) throw new Error(`Sensor ${sensorId} não encontrado`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function getAlertas() {
  try {
    const res = await fetch(`${API_URL}/alertas`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    return data.status === "healthy";
  } catch {
    return false;
  }
}

export async function getHistory(limit = 100, sensorId = null) {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (sensorId) params.append("sensor_id", sensorId);
    const res = await fetch(`${API_URL}/dados/sqlite?${params}`);
    return await res.json();
  } catch {
    return { status: "error", count: 0, data: [] };
  }
}

export async function getAnomalyHistory(limit = 20) {
  try {
    const res = await fetch(`${API_URL}/anomalias/historico?limit=${limit}`);
    return await res.json();
  } catch {
    return { status: "error", count: 0, data: [] };
  }
}

let ws = null;
let wsReconnectTimer = null;
let wsCallbacks = { onMessage: null, onConnect: null, onDisconnect: null };

export function connectWebSocket(onMessage, onConnect, onDisconnect) {
  wsCallbacks = { onMessage, onConnect, onDisconnect };
  _connect();
}

function _connect() {
  if (ws?.readyState === WebSocket.OPEN) return;

  const wsUrl =
    (process.env.NEXT_PUBLIC_WS_URL ?? API_URL.replace(/^http/, "ws")) + "/ws";

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("✅ WebSocket conectado");
    if (wsReconnectTimer) {
      clearTimeout(wsReconnectTimer);
      wsReconnectTimer = null;
    }
    wsCallbacks.onConnect?.();
  };

  ws.onmessage = (evt) => {
    try {
      wsCallbacks.onMessage?.(JSON.parse(evt.data));
    } catch (e) {
      console.error("WS parse error:", e);
    }
  };

  ws.onclose = () => {
    console.warn("⚠️ WebSocket desconectado — reconectando em 3s");
    wsCallbacks.onDisconnect?.();
    wsReconnectTimer = setTimeout(_connect, 3000);
  };

  ws.onerror = (e) => console.error("WS erro:", e);
}

export function disconnectWebSocket() {
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
  }
  ws?.close();
  ws = null;
}

export function sendPing() {
  if (ws?.readyState === WebSocket.OPEN) ws.send("ping");
}

export function getStatusColor(status) {
  return (
    {
      OK: "#22c55e",
      ATENCAO: "#eab308",
      ALERTA: "#f97316",
      CRITICO: "#ef4444",
    }[status] ?? "#6b7280"
  );
}

export function getLabelColor(label) {
  return (
    { Normal: "#22c55e", Alerta: "#f97316", Crítico: "#ef4444" }[label] ??
    "#6b7280"
  );
}

export function formatTimestamp(ts) {
  return new Date(ts).toLocaleString("pt-BR");
}
