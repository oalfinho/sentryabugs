import sqlite3
from pathlib import Path
from typing import Dict, List, Optional
from app.log.logger import log


class SQLiteStorage:
    def __init__(self, db_path: str | Path = "data/sensor_data.db"):
        self.db_path = Path(db_path)

        print("DB_PATH:", self.db_path.resolve())

        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.ensure_database()

    def _connect(self):
        return sqlite3.connect(self.db_path)

    def ensure_database(self):
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS sensor_data (
                    id            INTEGER PRIMARY KEY AUTOINCREMENT,
                    sensor_id     TEXT NOT NULL,
                    timestamp     TEXT NOT NULL,
                    acc_x         REAL,
                    acc_y         REAL,
                    acc_z         REAL,
                    gyro_x        REAL,
                    gyro_y        REAL,
                    gyro_z        REAL,
                    vibration_rms REAL,
                    energia       REAL,
                    temp          REAL,
                    status        TEXT,
                    is_anomaly    INTEGER,
                    anomaly_score REAL,
                    label         TEXT DEFAULT 'Normal'
                )
                """
            )
            # Migração: adiciona colunas faltantes em bancos antigos
            cursor = conn.execute("PRAGMA table_info(sensor_data)")
            existing = {row[1] for row in cursor.fetchall()}
            migrations = {
                "energia":       "REAL",
                "is_anomaly":    "INTEGER",
                "anomaly_score": "REAL",
                "label":         "TEXT DEFAULT 'Normal'",
            }
            for col, col_type in migrations.items():
                if col not in existing:
                    conn.execute(f"ALTER TABLE sensor_data ADD COLUMN {col} {col_type}")
                    log.info(f"Migração: coluna '{col}' adicionada ao banco.")

    def insert_sensor_record(self, record: Dict) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO sensor_data (
                    sensor_id, timestamp,
                    acc_x, acc_y, acc_z,
                    gyro_x, gyro_y, gyro_z,
                    vibration_rms, energia, temp,
                    status, is_anomaly, anomaly_score, label
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record.get("sensor_id"),
                    record.get("timestamp"),
                    record.get("acc_x"),
                    record.get("acc_y"),
                    record.get("acc_z"),
                    record.get("gyro_x"),
                    record.get("gyro_y"),
                    record.get("gyro_z"),
                    record.get("vibration_rms"),
                    record.get("energia"),
                    record.get("temp"),
                    record.get("status"),
                    record.get("is_anomaly"),
                    record.get("anomaly_score"),
                    record.get("label", "Normal"),
                ),
            )

    def query_sensor_records(
        self,
        limit: int = 100,
        sensor_id: Optional[str] = None,
        only_anomalies: bool = False,
    ) -> List[Dict]:
        query = (
            "SELECT id, sensor_id, timestamp, acc_x, acc_y, acc_z, "
            "gyro_x, gyro_y, gyro_z, vibration_rms, energia, temp, "
            "status, is_anomaly, anomaly_score, label "
            "FROM sensor_data"
        )
        params: list = []
        conditions = []

        if sensor_id:
            conditions.append("sensor_id = ?")
            params.append(sensor_id)
        if only_anomalies:
            conditions.append("is_anomaly = 1")

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY id DESC LIMIT ?"
        params.append(limit)

        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(query, tuple(params))
            rows = cursor.fetchall()

        return [dict(row) for row in rows]


sqlite_storage = SQLiteStorage()
