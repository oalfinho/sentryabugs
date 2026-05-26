"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { formatTime } from "@/lib/utils";
import { getHistory, getAnomalyHistory } from "@/services/sensorApi";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws";

const MAX_HISTORY = 60;
const MAX_EVENTS = 500;
const RECONNECT_MAX_DELAY = 10_000;
const INITIAL_RECONNECT_DELAY = 1_000;

export function useSensorData() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]); // leituras para o gráfico
  const [anomalies, setAnomalies] = useState([]); // histórico Isolation Forest
  const [events, setEvents] = useState([]); // eventos Alerta/Crítico acumulados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const historyRef = useRef([]);
  const eventsRef = useRef([]);
  const wsRef = useRef(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef(null);

  // Novo - Adicionando remocaoo de eventos antigos para evitar acúmulo excessivo
  const clearEvents = useCallback(() => {
    eventsRef.current = [];
    setEvents([]);
  }, []);

  const fetchInitial = useCallback(async () => {
    try {
      const [histRes, anomRes] = await Promise.all([
        getHistory(MAX_HISTORY),
        getAnomalyHistory(50),
      ]);

      // Histórico de leituras
      if (histRes.status === "ok" && Array.isArray(histRes.data)) {
        const rows = [...histRes.data].reverse();
        const formatted = rows.map((row) => {
          const ts = row.timestamp ? new Date(row.timestamp) : new Date();
          const vib = Number(row.vibration_rms ?? 0);
          return {
            label: formatTime(ts),
            value: vib,
            temperatura: Number(row.temp ?? 0),
            energia: Number(row.energia ?? vib ** 2),
            status: row.status ?? "OK",
            label_ia: row.label ?? "Normal",
            timestamp: ts.toISOString(),
          };
        });
        const pts = formatted.slice(-MAX_HISTORY);
        historyRef.current = pts;
        setHistory(pts.map((p) => ({ ...p })));

        if (pts.length > 0) {
          const last = pts[pts.length - 1];
          const lastRow = rows[rows.length - 1];
          setData({
            vibracao: last.value,
            temperatura: last.temperatura,
            energia: last.energia,
            sensor_id: lastRow.sensor_id,
            status: lastRow.status ?? "OK",
            label: lastRow.label ?? "Normal",
            fault_type: lastRow.label ?? "Normal",
            risk_pct: Math.round(Number(lastRow.anomaly_score ?? 0) * 100),
            is_anomaly: lastRow.is_anomaly === 1,
            anomaly_score: Number(lastRow.anomaly_score ?? 0),
            timestamp: last.timestamp,
            events: [],
          });
        }
      }

      if (anomRes.status === "ok" && Array.isArray(anomRes.data)) {
        setAnomalies(
          anomRes.data.map((a) => ({
            ...a,
            formattedTime: formatTime(new Date(a.timestamp)),
          })),
        );
      }
    } catch (err) {
      console.error("Erro ao buscar dados iniciais:", err);
      setError("Falha ao carregar dados históricos");
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // WebSocket
  // ------------------------------------------------------------------
  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`✅ WS conectado ${WS_URL}`);
        setIsConnected(true);
        setError(null);
        reconnectCountRef.current = 0;
      };

      ws.onmessage = (evt) => {
        try {
          const fresh = JSON.parse(evt.data);
          setData(fresh);
          setLoading(false);

          // Adiciona ao histórico do gráfico
          const pt = {
            label: formatTime(),
            value: fresh.vibracao ?? 0,
            temperatura: fresh.temperatura ?? 0,
            energia: fresh.energia ?? (fresh.vibracao ?? 0) ** 2,
            status: fresh.status ?? "OK",
            label_ia: fresh.label ?? "Normal",
            timestamp: fresh.timestamp
              ? new Date(fresh.timestamp).toISOString()
              : new Date().toISOString(),
          };
          const next = [...historyRef.current, pt].slice(-MAX_HISTORY);
          historyRef.current = next;
          setHistory(next.map((p) => ({ ...p })));

          // Acumula eventos recebidos via WS (sem event_permanent)
          if (Array.isArray(fresh.events) && fresh.events.length > 0) {
            const merged = [...eventsRef.current, ...fresh.events].slice(
              -MAX_EVENTS,
            );
            eventsRef.current = merged;
            setEvents([...merged]);
          }
        } catch (e) {
          console.error("WS parse error:", e);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
        setError("Erro na conexão WebSocket");
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectCountRef.current++;
        const delay = Math.min(
          INITIAL_RECONNECT_DELAY * 2 ** reconnectCountRef.current,
          RECONNECT_MAX_DELAY,
        );
        console.warn(`⚠️ WS fechado — reconectando em ${delay}ms`);
        reconnectTimerRef.current = setTimeout(connectWS, delay);
      };
    } catch (e) {
      console.error("Erro ao criar WS:", e);
      setError("Erro ao conectar ao servidor");
      reconnectTimerRef.current = setTimeout(
        connectWS,
        INITIAL_RECONNECT_DELAY,
      );
    }
  }, []);

  // ------------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------------
  useEffect(() => {
    fetchInitial();
    connectWS();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [fetchInitial, connectWS]);

  return {
    data,
    history,
    anomalies,
    events,
    loading,
    error,
    isConnected,
    maxHistory: MAX_HISTORY,
  };
}
