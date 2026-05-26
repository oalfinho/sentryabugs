import asyncio
import json
from datetime import datetime
from typing import Dict, List, Optional
from collections import deque
from app.services.telegram import telegram
from app.sqlite.sqlite import sqlite_storage
from app.enum.enums import StatusSensor
from app.core.config import settings
from app.log.logger import log
from app.ia.ia import ia
from app.ia.predictive import predictive_model  # NOVO - importação segura

EVENT_DEBOUNCE_SECONDS = 30


class VibrationService:

    def __init__(self):
        self.sensores: Dict[str, Dict] = {}
        self.websocket_clients: List = []
        self.event_log: List[Dict] = []
        self._last_event: Dict[str, Dict] = {}
        self._last_predictive_alert: Dict[str, datetime] = {}  # NOVO - cooldown para alertas preditivos
        
        telegram.__init__(
            token=settings.telegram_token,
            chat_id=settings.telegram_chat_id,
        )


    async def process_reading(self, dados: Dict) -> Dict:
        sensor_id  = str(dados.get("id",   dados.get("sensor_id", "ESP32")))
        vib_rms    = float(dados.get("vib", dados.get("vib_rms",    0)) or 0)
        temp       = float(dados.get("temp", dados.get("temperatura", 25)) or 25)
        acc_x      = float(dados.get("acc_x",  0) or 0)
        acc_y      = float(dados.get("acc_y",  0) or 0)
        acc_z      = float(dados.get("acc_z",  1) or 1)
        gyro_x     = float(dados.get("gyro_x", 0) or 0)
        gyro_y     = float(dados.get("gyro_y", 0) or 0)
        gyro_z     = float(dados.get("gyro_z", 0) or 0)
        now        = datetime.now()

        # ========== DETECÇÃO DE ANOMALIAS (existente) ==========
        ai_result = ia.predict({
            "sensor_id": sensor_id,
            "vib_rms": vib_rms,
            "temp": temp,
            "acc_x": acc_x,
            "acc_y": acc_y,
            "acc_z": acc_z,
            "gyro_x": gyro_x,
            "gyro_y": gyro_y,
        })

        label         = ai_result["label"]
        anomaly_score = ai_result["anomaly_score"]
        is_anomaly    = ai_result["is_anomaly"]
        status = self._label_to_status(label)

        # ========== PREDIÇÃO DE FALHAS (NOVO - não interfere no existente) ==========
        try:
            # Alimenta modelo preditivo (não bloqueia se falhar)
            predictive_model.add_reading(sensor_id, {
                "vib_rms": vib_rms,
                "temp": temp,
                "acc_x": acc_x,
                "acc_y": acc_y,
                "acc_z": acc_z,
                "gyro_x": gyro_x,
                "gyro_y": gyro_y,
                "gyro_z": gyro_z,
            }, now)
            
            # Verifica predição a cada 30 segundos (evita spam)
            last_alert = self._last_predictive_alert.get(sensor_id)
            if last_alert is None or (now - last_alert).total_seconds() >= 300:  # 5 minutos
                pred_failure = predictive_model.predict_failure(sensor_id, {})
                if pred_failure and pred_failure["risk_level"] in ["Alerta", "Crítico"]:
                    await self._send_predictive_alert(sensor_id, pred_failure, now)
                    self._last_predictive_alert[sensor_id] = now
        except Exception as e:
            log.error(f"Erro no modelo preditivo: {e}")  # Não quebra o fluxo principal
        # ========== FIM PREDIÇÃO ==========

        if sensor_id not in self.sensores:
            self.sensores[sensor_id] = {
                "sensor_id": sensor_id,
                "history": deque(maxlen=60),
            }

        sensor = self.sensores[sensor_id]
        sensor.update({
            "vib_rms":      vib_rms,
            "temp":         temp,
            "acc_x":        acc_x,
            "acc_y":        acc_y,
            "acc_z":        acc_z,
            "gyro_x":       gyro_x,
            "gyro_y":       gyro_y,
            "gyro_z":       gyro_z,
            "status":       status,
            "label":        label,
            "anomaly_score": anomaly_score,
            "is_anomaly":   is_anomaly,
            "timestamp":    now,
        })
        sensor["history"].append([vib_rms, temp])

        # SQLite insert (existente)
        sqlite_storage.insert_sensor_record({
            "sensor_id":     sensor_id,
            "timestamp":     now.isoformat(),
            "acc_x":         acc_x,
            "acc_y":         acc_y,
            "acc_z":         acc_z,
            "gyro_x":        gyro_x,
            "gyro_y":        gyro_y,
            "gyro_z":        gyro_z,
            "vibration_rms": vib_rms,
            "energia":       round(vib_rms ** 2, 4),
            "temp":          temp,
            "status":        status.value,
            "is_anomaly":    int(is_anomaly),
            "anomaly_score": anomaly_score,
            "label":         label,
        })
        
        event = None
        if is_anomaly:
            last = self._last_event.get(sensor_id)
            label_mudou = last is None or last["label"] != label
            tempo_passou = last is None or (now - last["timestamp"]).total_seconds() >= EVENT_DEBOUNCE_SECONDS
            
            if label_mudou or tempo_passou:
                event = {
                    "id":        f"evt_{sensor_id}_{int(now.timestamp())}",
                    "sensor_id": sensor_id,
                    "level":     "danger" if label == "Crítico" else "warn",
                    "label":     label,
                    "title":     f"{label} — {sensor_id}",
                    "desc":      f"Vibração: {vib_rms:.3f} g | Temp: {temp:.1f}°C | Score: {anomaly_score*100:.1f}%",
                    "timestamp": now.isoformat(),
                }
                self.event_log.append(event)
                self._last_event[sensor_id] = {"label": label, "timestamp": now}
                
                if len(self.event_log) > 500:
                    self.event_log = self.event_log[-500:]

        log.info(
            f"[{sensor_id}] vib={vib_rms:.3f}g temp={temp:.1f}°C "
            f"{label} (score={anomaly_score:.3f})"
            + (" [evento gerado]" if event else "")
        )

        ws_payload = {
            "sensor_id":    sensor_id,
            "vibracao":     round(vib_rms, 4),
            "temperatura":  round(temp, 2),
            "energia":      round(vib_rms ** 2, 4),
            "status":       status.value,
            "label":        label,
            "fault_type":   label,
            "risk_pct":     int(anomaly_score * 100),
            "is_anomaly":   is_anomaly,
            "anomaly_score": anomaly_score,
            "timestamp":    now.isoformat(),
            "events": [event] if is_anomaly else [],
        }

        await self.notify_clients(ws_payload)
        return ws_payload

    # NOVO - Método para enviar alertas preditivos
    async def _send_predictive_alert(self, sensor_id: str, prediction: Dict, now: datetime):
        """Envia alerta preditivo via Telegram (não conflita com alertas de anomalia)"""
        risk = prediction["risk_level"]
        icon = "🔴" if risk == "Crítico" else "🟠"
        
        message = (
            f"{icon} *PREDIÇÃO - {risk.upper()}*\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"📡 *Sensor:* `{sensor_id}`\n"
            f"📊 *Vibração atual:* `{prediction['current_vib']} m/s²`\n"
            f"📈 *Baseline:* `{prediction['baseline_vib']} m/s²`\n"
            f"📐 *Crescimento:* `{prediction['growth_rate']}%/leitura`\n"
        )
        
        if prediction.get('time_to_failure_hours'):
            message += f"⏰ *Falha prevista em:* `{prediction['time_to_failure_hours']} horas`\n"
        
        message += (
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"💡 *Recomendação:* {prediction['recommendation']}\n"
            f"_Alerta preditivo - ação preventiva_"
        )
        
        # Usa o mesmo telegram, mas com label diferente
        await telegram.send_alert({
            "label": f"Preditivo-{risk}",
            "sensor_id": sensor_id,
            "Desc": prediction['recommendation'],
            "anomaly_score": 0.8 if risk == "Crítico" else 0.6
        })
        
        log.warning(f"🔮 Alerta preditivo para {sensor_id}: {risk} - {prediction['recommendation']}")

    # Método existente (sem modificações)
    def train_ia_from_sqlite(self, limit: int = 500):
        """Treina o Isolation Forest com os dados já salvos no SQLite."""
        import pandas as pd
        records = sqlite_storage.query_sensor_records(limit=limit)
        if not records:
            log.warning("Sem registros no banco de dados para treinar o modelo IA.")
            return
        df = pd.DataFrame(records)
        ia.train_from_df(df)
        
        # NOVO: Também treina modelo preditivo se houver dados suficientes
        try:
            from app.ia.predictive import predictive_model
            # Re-alimenta modelo preditivo com dados históricos
            for _, row in df.iterrows():
                predictive_model.add_reading(
                    row['sensor_id'],
                    {
                        "vib_rms": row['vibration_rms'],
                        "temp": row['temp'],
                        "acc_x": row['acc_x'],
                        "acc_y": row['acc_y'],
                        "acc_z": row['acc_z'],
                        "gyro_x": row['gyro_x'],
                        "gyro_y": row['gyro_y'],
                        "gyro_z": row['gyro_z'],
                    },
                    datetime.fromisoformat(row['timestamp'])
                )
            log.info("✅ Modelo preditivo também atualizado")
        except Exception as e:
            log.warning(f"Não foi possível treinar modelo preditivo: {e}")

    async def notify_clients(self, payload: Dict):
        dead = []
        for client in list(self.websocket_clients):
            try:
                await client.send_text(json.dumps(payload, default=str))
            except Exception:
                dead.append(client)
        for c in dead:
            if c in self.websocket_clients:
                self.websocket_clients.remove(c)

    def _label_to_status(self, label: str) -> StatusSensor:
        mapping = {
            "Normal":   StatusSensor.OK,
            "Alerta":   StatusSensor.ALERTA,
            "Crítico":  StatusSensor.CRITICO,
        }.get(label, StatusSensor.OK)
        return mapping
    
    def get_sensor(self, sensor_id: str) -> Dict:
        if sensor_id not in self.sensores:
            raise ValueError(f"Sensor {sensor_id} não encontrado")
        s = self.sensores[sensor_id]
        return {
            "sensor_id":    s["sensor_id"],
            "vib_rms":      s.get("vib_rms", 0.0),
            "temp":         s.get("temp", 0.0),
            "status":       s["status"].value if hasattr(s.get("status"), "value") else "OK",
            "label":        s.get("label", "Normal"),
            "anomaly_score": s.get("anomaly_score", 0.0),
            "is_anomaly":   s.get("is_anomaly", False),
            "timestamp":    s["timestamp"].isoformat() if isinstance(s.get("timestamp"), datetime) else str(s.get("timestamp", "")),
            "alert_level":  list(StatusSensor).index(s["status"]) if hasattr(s.get("status"), "value") else 0,
        }

    def get_all_sensors(self) -> List[Dict]:
        return [self.get_sensor(sid) for sid in self.sensores]

    def check_alerts(self) -> List[Dict]:
        alerts = []
        for sensor_id, s in self.sensores.items():
            label = s.get("label", "Normal")
            if label in ("Alerta", "Crítico"):
                alerts.append({
                    "sensor_id":    sensor_id,
                    "message":      f"{label}: Vib={s.get('vib_rms', 0):.3f}g",
                    "severity":     3 if label == "Crítico" else 2,
                    "timestamp":    s.get("timestamp", datetime.now()),
                })
        return alerts

    def get_sqlite_records(self, limit: int = 100, sensor_id: Optional[str] = None) -> List[Dict]:
        return sqlite_storage.query_sensor_records(limit=limit, sensor_id=sensor_id)

    def get_event_log(self, limit: int = 100) -> List[Dict]:
        return list(reversed(self.event_log[-limit:]))


vibration = VibrationService()
