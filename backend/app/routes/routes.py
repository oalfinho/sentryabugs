from datetime import datetime
from fastapi import APIRouter, WebSocket
from fastapi.websockets import WebSocketState
from typing import Optional
from app.services.vibration import vibration
from app.ia.ia import ia
from app.log.logger import log

router = APIRouter(prefix="", tags=["sensores"])


# ------------------------------------------------------------------
# Recebimento de dados do ESP32
# ------------------------------------------------------------------

@router.post("/receber")
async def receber_dados(dados: dict):
    result = await vibration.process_reading(dados)
    return {"status": "ok", "classification": result["label"], "sensor_id": result["sensor_id"]}


# ------------------------------------------------------------------
# Consultas
# ------------------------------------------------------------------

@router.get("/sensores")
async def listar_sensores():
    return {
        "status": "ok",
        "count": len(vibration.get_all_sensors()),
        "data": vibration.get_all_sensors(),
    }

@router.get("/dados/sqlite")
async def listar_registros_sqlite(limit: int = 100, sensor_id: Optional[str] = None):
    registros = vibration.get_sqlite_records(limit=limit, sensor_id=sensor_id)
    return {"status": "ok", "count": len(registros), "data": registros}


@router.get("/eventos")
async def listar_eventos(limit: int = 100):
    eventos = vibration.get_event_log(limit=limit)
    return {"status": "ok", "count": len(eventos), "data": eventos}


@router.get("/anomalias/historico")
async def listar_historico_anomalias(limit: int = 20):
    anomalias = ia.get_recent_anomalies(limit=limit)
    return {"status": "ok", "count": len(anomalias), "data": anomalias}


@router.post("/ia/treinar")
async def treinar_ia(limit: int = 500):
    vibration.train_ia_from_sqlite(limit=limit)
    return {"status": "ok", "ia_treinada": ia.is_trained}


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    vibration.websocket_clients.append(websocket)
    log.info(f"WebSocket conectado: {websocket.client}")
    try:
        while True:
            await websocket.receive_text()   # keepalive ping
    except Exception:
        pass
    finally:
        if websocket in vibration.websocket_clients:
            vibration.websocket_clients.remove(websocket)
        log.info(f"WebSocket desconectado: {websocket.client}")
