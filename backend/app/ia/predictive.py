# app/ia/predictive.py
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque
from app.log.logger import log

class PredictiveMaintenance:
    """Modelo preditivo para antecipar falhas baseado em tendências"""
    
    def __init__(self):
        self.sensor_models = {}  # Modelos por sensor
        self.sensor_history = defaultdict(lambda: deque(maxlen=500))  # 500 leituras por sensor
        self.scalers = {}  # Padronizadores por sensor
        self.last_training = {}  # Último treinamento por sensor
        
    def add_reading(self, sensor_id: str, features: Dict, timestamp: datetime):
        """Adiciona uma leitura ao histórico do sensor"""
        self.sensor_history[sensor_id].append({
            "timestamp": timestamp,
            "vib_rms": features.get("vib_rms", 0),
            "temp": features.get("temp", 0),
            "acc_x": features.get("acc_x", 0),
            "acc_y": features.get("acc_y", 0),
            "acc_z": features.get("acc_z", 0),
            "gyro_x": features.get("gyro_x", 0),
            "gyro_y": features.get("gyro_y", 0),
            "gyro_z": features.get("gyro_z", 0),
        })
        
        # Treina modelo a cada 50 leituras novas
        if len(self.sensor_history[sensor_id]) >= 30:
            last_train = self.last_training.get(sensor_id)
            current_len = len(self.sensor_history[sensor_id])
            
            if last_train is None or current_len - last_train >= 50:
                self._train_sensor_model(sensor_id)
                self.last_training[sensor_id] = current_len
    
    def _train_sensor_model(self, sensor_id: str):
        """Treina modelo preditivo para um sensor específico"""
        history = list(self.sensor_history[sensor_id])
        if len(history) < 30:
            return
        
        # Cria features temporais
        df = pd.DataFrame(history)
        df['seconds'] = (df['timestamp'] - df['timestamp'].min()).dt.total_seconds()
        
        # Features: tempo, aceleração, giroscópio
        feature_cols = ['seconds', 'acc_x', 'acc_y', 'acc_z', 'gyro_x', 'gyro_y', 'gyro_z']
        X = df[feature_cols].values
        
        # Target: vibração futura (deslocada 10 passos à frente)
        y = df['vib_rms'].shift(-10).dropna().values
        X = X[:-10]  # Remove os últimos 10 que não têm target
        
        if len(X) < 20:
            return
        
        # Padroniza
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Treina modelo de regressão
        model = LinearRegression()
        model.fit(X_scaled, y)
        
        # Salva modelo e scaler
        self.sensor_models[sensor_id] = model
        self.scalers[sensor_id] = scaler
        
        log.info(f"✅ Modelo preditivo treinado para {sensor_id}: {len(X)} amostras")
    
    def predict_failure(self, sensor_id: str, current_features: Dict) -> Optional[Dict]:
        """Prevê risco de falha baseado na tendência atual"""
        if sensor_id not in self.sensor_models:
            return None
        
        history = list(self.sensor_history[sensor_id])
        if len(history) < 20:
            return None
        
        # Análise de tendência simples
        recent_vibs = [h['vib_rms'] for h in history[-20:]]
        
        # Calcula slope da regressão linear
        x = np.arange(len(recent_vibs))
        slope = np.polyfit(x, recent_vibs, 1)[0]
        
        # Calcula taxa de crescimento
        growth_rate = slope / (np.mean(recent_vibs) + 0.001)
        
        # Define thresholds baseados no histórico
        baseline_vib = np.percentile(recent_vibs, 30)  # 30º percentil = operação normal
        current_vib = recent_vibs[-1]
        vib_ratio = current_vib / (baseline_vib + 0.001)
        
        # Predição de tempo até falha (estimativa simples)
        if slope > 0:
            # Quanto tempo até atingir 2x o baseline?
            time_to_double = (baseline_vib * 2 - current_vib) / slope if slope > 0 else float('inf')
            time_to_critical = min(time_to_double, 60)  # Máximo 60 minutos
        else:
            time_to_critical = None
        
        # Classifica risco
        if vib_ratio > 2.5 or growth_rate > 0.1:
            risk = "Crítico"
            hours_to_fail = 1
        elif vib_ratio > 1.8 or growth_rate > 0.05:
            risk = "Alerta"
            hours_to_fail = 4
        elif vib_ratio > 1.3 or growth_rate > 0.02:
            risk = "Atenção"
            hours_to_fail = 24
        else:
            risk = "Normal"
            hours_to_fail = None
        
        return {
            "sensor_id": sensor_id,
            "risk_level": risk,
            "current_vib": round(current_vib, 3),
            "baseline_vib": round(baseline_vib, 3),
            "vib_ratio": round(vib_ratio, 2),
            "growth_rate": round(growth_rate * 100, 1),  # % por leitura
            "slope": round(slope, 4),  # m/s² por leitura
            "time_to_failure_hours": hours_to_fail,
            "recommendation": self._get_recommendation(risk, hours_to_fail)
        }
    
    def _get_recommendation(self, risk: str, hours_to_fail: Optional[int]) -> str:
        """Gera recomendação baseada no risco"""
        if risk == "Crítico":
            return "🔴 PARADA IMEDIATA! Risco de falha iminente"
        elif risk == "Alerta":
            return f"🟠 Programar manutenção URGENTE (nas próximas {hours_to_fail}h)"
        elif risk == "Atenção":
            return f"🟡 Monitorar tendência - manutenção em {hours_to_fail}h"
        else:
            return "✅ Operação normal"

predictive_model = PredictiveMaintenance()