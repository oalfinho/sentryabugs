from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List
from app.log.logger import log


class VibrationAI:

    THRESHOLD_ALERTA = 0.45
    THRESHOLD_CRITICO = 0.70

    def __init__(self):
        self.model = IsolationForest(
            contamination=0.15,
            random_state=42,
            n_estimators=100,
        )
        self.is_trained = False
        self._score_min: float = -0.5
        self._score_max: float = 0.5
        self.anomaly_history: List[Dict] = []

    def extract_features(self, sensor_data: Dict) -> np.ndarray:
        vib  = float(sensor_data.get("vib_rms",    sensor_data.get("vibracao", 0)) or 0)
        temp = float(sensor_data.get("temp",        sensor_data.get("temperatura", 25)) or 25)
        ax   = float(sensor_data.get("acc_x",  0) or 0)
        ay   = float(sensor_data.get("acc_y",  0) or 0)
        az   = float(sensor_data.get("acc_z",  1) or 1)
        gx   = float(sensor_data.get("gyro_x", 0) or 0)
        gy   = float(sensor_data.get("gyro_y", 0) or 0)
        return np.array([vib, temp, ax, ay, az, gx, gy])

    def build_feature_matrix(self, df: pd.DataFrame) -> np.ndarray:
        feature_cols = ["acc_x", "acc_y", "acc_z", "gyro_x", "gyro_y", "gyro_z", "vibration_rms"]
        available = [c for c in feature_cols if c in df.columns]
        if not available:
            available = df.select_dtypes(include=[np.number]).columns.tolist()
        return df[available].fillna(0).values

    def train(self, X: np.ndarray):
        if len(X) < 10:
            log.warning("Dados insuficientes para treinar o modelo IA (<10 amostras)")
            return
        self.model.fit(X)
        self.is_trained = True
        raw_scores = self.model.decision_function(X)
        self._score_min = float(raw_scores.min())
        self._score_max = float(raw_scores.max())
        log.info(f"Modelo IA treinado: {len(X)} amostras | score [{self._score_min:.3f}, {self._score_max:.3f}]")

    def train_from_df(self, df: pd.DataFrame):
        X = self.build_feature_matrix(df)
        self.train(X)

    def _normalize_score(self, raw_score: float) -> float:
        span = (self._score_max - self._score_min) or 1e-9
        normalized = 1.0 - ((raw_score - self._score_min) / span)
        return float(np.clip(normalized, 0.0, 1.0))

    def classify(self, anomaly_score: float) -> str:
        if anomaly_score >= self.THRESHOLD_CRITICO:
            return "Crítico"
        if anomaly_score >= self.THRESHOLD_ALERTA:
            return "Alerta"
        return "Normal"

    def predict(self, sensor_data: Dict) -> Dict[str, Any]:
        features = self.extract_features(sensor_data)

        if not self.is_trained:
            return {"label": "Normal", "anomaly_score": 0.0, "is_anomaly": False}

        raw_score = float(self.model.decision_function(features.reshape(1, -1))[0])
        anomaly_score = self._normalize_score(raw_score)
        label = self.classify(anomaly_score)
        is_anomaly = label in ("Alerta", "Crítico")

        if is_anomaly:
            record = {
                "timestamp": datetime.now().isoformat(),
                "sensor_id": sensor_data.get("sensor_id", "DESCONHECIDO"),
                "sensor_data": {
                    "vib_rms": float(sensor_data.get("vib_rms", sensor_data.get("vibracao", 0)) or 0),
                    "temp":    float(sensor_data.get("temp",    sensor_data.get("temperatura", 0)) or 0),
                    "acc_x":   float(sensor_data.get("acc_x",  0) or 0),
                    "acc_y":   float(sensor_data.get("acc_y",  0) or 0),
                    "acc_z":   float(sensor_data.get("acc_z",  0) or 0),
                    "gyro_x":  float(sensor_data.get("gyro_x", 0) or 0),
                    "gyro_y":  float(sensor_data.get("gyro_y", 0) or 0),
                },
                "anomaly_score": round(anomaly_score, 4),
                "label": label,
            }
            self.anomaly_history.append(record)
            if len(self.anomaly_history) > 200:
                self.anomaly_history = self.anomaly_history[-200:]

        return {
            "label": label,
            "anomaly_score": round(anomaly_score, 4),
            "is_anomaly": is_anomaly,
        }

    def get_recent_anomalies(self, limit: int = 20) -> List[Dict]:
        return list(reversed(self.anomaly_history[-limit:]))

    def get_anomaly_history(self) -> List[Dict]:
        return list(reversed(self.anomaly_history))


ia = VibrationAI()
