# Sentrya — Predictive Maintenance Dashboard

AI-powered industrial machine monitoring platform. Built with **Next.js 14**, **Tailwind CSS**, and **Chart.js**.

## Project Structure

```
sentrya/
├── src/
│   ├── app/
│   │   ├── layout.jsx          # Root layout (fonts, metadata)
│   │   ├── page.jsx            # Main dashboard page
│   │   └── globals.css         # Global styles + Tailwind directives
│   │
│   ├── components/
│   │   ├── ui/                 # Reusable primitives
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── IconBox.jsx
│   │   │   └── Skeleton.jsx
│   │   │
│   │   ├── dashboard/          # Feature components
│   │   │   ├── StatusCard.jsx
│   │   │   ├── InsightCard.jsx
│   │   │   ├── VibrationChart.jsx
│   │   │   ├── MetricsCard.jsx
│   │   │   └── EventsList.jsx
│   │   │
│   │   └── layout/
│   │       └── TopNav.jsx
│   │
│   ├── hooks/
│   │   ├── useSensorData.js    # Polling hook with fallback
│   │   ├── useClock.js         # Live timestamp
│   │   └── useNavTab.js        # Tab state
│   │
│   ├── services/
│   │   └── sensorApi.js        # Fetch + mock fallback
│   │
│   ├── lib/
│   │   └── utils.js            # Helpers, constants, color maps
│   │
│   └── types/
│       └── index.ts            # Shared TypeScript types
│
├── public/
├── .env.local.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL to your Flask/FastAPI backend
```

### 3. Run the dev server
```bash
npm run dev
# → http://localhost:3000
```

## Backend Integration

The frontend polls `GET /dados` every **3 seconds**.

### Expected JSON response:
```json
{
  "vibracao":    1020,
  "temperatura": 34,
  "energia":     203,
  "status":      "anomalia",
  "ultima_falha": 11,
  "risk_pct":    72,
  "events": [
    { "level": "danger", "title": "Risco de falha em curto prazo", "desc": "+60% nos últimos 5 min" },
    { "level": "warn",   "title": "Vibração elevada",              "desc": "+20% nos últimos 15 min" },
    { "level": "safe",   "title": "Vibração Estável",              "desc": "Média estável na última hora" }
  ]
}
```

### Flask example (minimal):
```python
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/dados")
def dados():
    return jsonify({
        "vibracao": 950,
        "temperatura": 32,
        "energia": 200,
        "status": "anomalia",
        "ultima_falha": 10,
        "risk_pct": 72,
        "events": [
            {"level": "danger", "title": "Risco de falha", "desc": "+60% nos últimos 5min"},
            {"level": "warn",   "title": "Temperatura alta", "desc": "Acima da média em 4°C"},
            {"level": "safe",   "title": "Energia Estável",  "desc": "Leituras normais"},
        ]
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
```

> If the backend is unreachable, the frontend automatically falls back to simulated data so the UI always stays live.

## Polling & Data Flow

```
useSensorData (hook)
  └── fetchSensorData (service)
        ├── fetch("http://localhost:5000/dados")  ← live backend
        └── buildMockData()                       ← fallback if fetch fails
  └── updates: data, history (rolling 8-point chart), loading, error
        └── passed as props to dashboard components
```

## Scripts

| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start dev server         |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |
