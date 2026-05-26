from enum import Enum

class StatusSensor(str, Enum):
    OK = "OK"
    ATENCAO = "ATENCAO"
    ALERTA = "ALERTA"
    CRITICO = "CRITICO"