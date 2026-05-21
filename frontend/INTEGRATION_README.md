# 🔴 Sentrya - Sistema de Monitoramento de Vibração em Tempo Real

Integração entre **Frontend (Next.js)** e **Backend (FastAPI)** para monitoramento em tempo real de sensores de vibração.

## 📋 Estrutura do Projeto

```
sentrya/
├── src/                          # Frontend (Next.js)
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
├── Sentrya-backend/              # Backend (FastAPI)
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   ├── core/
│   │   └── enum/
│   ├── main.py
│   └── requirements.txt
├── docker-compose.yml
├── Dockerfile
├── .env.local
└── package.json
```

## 🚀 Quick Start

### Opção 1: Com Docker (Recomendado)

```bash
# 1. Clonar/Entrar na pasta
cd sentrya

# 2. Executar ambos os serviços
docker-compose up --build

# 3. Acessar
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Backend Docs: http://localhost:8000/docs
```

### Opção 2: Desenvolvimento Local

#### Backend (FastAPI)

```bash
# 1. Entrar na pasta do backend
cd Sentrya-backend

# 2. Criar ambiente virtual
python -m venv venv

# 3. Ativar ambiente
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 4. Instalar dependências
pip install -r requirements.txt

# 5. Executar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (Next.js)

```bash
# 1. Em outra aba do terminal, na raiz (sentrya/)
cd ..

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
# Verificar .env.local com as URLs corretas

# 4. Executar desenvolvimento
npm run dev
```

## ⚙️ Configuração

### Frontend (.env.local)

```env
# URL da API REST do Backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# URL do WebSocket do Backend
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Intervalo de polling (ms) - se usar polling em vez de WebSocket
NEXT_PUBLIC_POLL_INTERVAL=3000
```

### Backend (Sentrya-backend/.env)

```env
APP_NAME=Sentrya API
DEBUG=true
HOST=0.0.0.0
PORT=8000
SIMULATION_INTERVAL=5

# Limiares de vibração (em g)
VIBRATION_ATENCAO=0.8
VIBRATION_ALERTA=1.5
VIBRATION_CRITICO=3.0
```

## 🔌 Comunicação Backend ↔ Frontend

### WebSocket - Dados em Tempo Real

**Endpoint:** `/ws`

**Formato de dados enviado pelo backend:**

```json
{
  "vibracao": 450.5,
  "temperatura": 35.2,
  "energia": 1250,
  "sensor_id": "MOTOR_1",
  "status": "ok",
  "timestamp": "2024-04-30T10:30:45.123Z",
  "events": [
    {
      "id": "evt_MOTOR_1",
      "tipo": "info",
      "mensagem": "Status: OK",
      "timestamp": "2024-04-30T10:30:45.123Z"
    }
  ]
}
```

### REST API

#### Listar Sensores

```bash
GET /sensores
```

Resposta:

```json
{
  "status": "ok",
  "count": 3,
  "data": [
    {
      "sensor_id": "MOTOR_1",
      "vib_rms": 0.5,
      "temp": 42.0,
      "status": "ok",
      "timestamp": "2024-04-30T10:30:45.123Z",
      "alert_level": 0
    }
  ]
}
```

#### Obter Sensor Específico

```bash
GET /sensores/{sensor_id}
```

#### Listar Alertas

```bash
GET /alertas
```

#### Health Check

```bash
GET /health
```

#### Receber Dados de ESP32

```bash
POST /receber
Content-Type: application/json

{
  "id": "MOTOR_1",
  "vib": 0.5,
  "temp": 42.0
}
```

## 📊 Fluxo de Dados

```
Backend (Simulação de Sensor)
    ↓
Backend (WebSocket Broadcast)
    ↓
Frontend (Hook useSensorData)
    ↓
Frontend (Componentes UI)
    ↓
Gráfico em Tempo Real ✨
```

## 🔍 Verificação de Funcionamento

### 1. Backend está rodando?

```bash
curl http://localhost:8000/health
```

Resposta esperada:

```json
{
  "status": "healthy",
  "sensores_ativos": 3
}
```

### 2. Frontend está conectado?

- Abrir http://localhost:3000
- Verificar se mostra "✓ Conectado em tempo real" (barra verde no topo)
- Abrir DevTools (F12) → Console
- Verificar se há mensagem "✅ WebSocket conectado"

### 3. Dados chegando?

- No Console do DevTools, você deve ver dados de vibração sendo recebidos
- O gráfico deve estar atualizando em tempo real

## 🐛 Troubleshooting

### "Desconectado do servidor"

1. Verificar se backend está rodando

   ```bash
   curl http://localhost:8000/health
   ```

2. Verificar URL do WebSocket em `.env.local`

   ```env
   NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
   ```

3. Verificar CORS no backend (deve estar liberado para todos `["*"]`)

### Backend não inicia

1. Verificar se porta 8000 já está em uso

   ```bash
   # Windows
   netstat -ano | findstr :8000

   # Linux/Mac
   lsof -i :8000
   ```

2. Reinstalar dependências
   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

### Frontend não conecta ao WebSocket

1. Verificar se backend está respondendo em `http://localhost:8000`
2. Verificar console do navegador para mensagens de erro
3. Verificar firewall/antivírus bloqueando conexões

## 📈 Estrutura de Dados do Sensor

### Modelo no Backend

```python
{
    "sensor_id": str,           # ID único do sensor
    "vib_rms": float,          # Vibração em G
    "temp": float,             # Temperatura em °C
    "status": StatusSensor,    # OK, ATENCAO, ALERTA, CRITICO
    "timestamp": datetime,     # Quando foi medido
}
```

### Formato Enviado ao Frontend

```json
{
    "vibracao": float,         # Vibração em mm/s (convertida de G)
    "temperatura": float,      # Temperatura em °C
    "energia": float,          # Energia em W (simulada)
    "sensor_id": string,       # ID do sensor
    "status": string,          # Status em formato legível
    "timestamp": string,       # ISO 8601
    "events": []              # Array de eventos/alertas
}
```

## 🔒 Segurança para Produção

- [ ] Usar HTTPS/WSS (SSL/TLS)
- [ ] Implementar autenticação no WebSocket
- [ ] Validar todos os dados recebidos
- [ ] Rate limiting nos endpoints
- [ ] CORS configurado com domínios específicos
- [ ] Variáveis sensíveis em secrets/vault
- [ ] Logs e monitoramento ativo

## 📚 Documentação Adicional

- [Frontend - Real Time Setup](./REAL_TIME_SETUP.md)
- [Backend API - Swagger](http://localhost:8000/docs)
- [Chart.js Documentation](https://www.chartjs.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contribuindo

1. Criar branch para feature: `git checkout -b feature/nova-feature`
2. Commit das mudanças: `git commit -am 'Add nova feature'`
3. Push para branch: `git push origin feature/nova-feature`
4. Abrir Pull Request

## 📝 License

MIT License

## 📞 Suporte

Para problemas ou dúvidas:

1. Verificar console do navegador (F12)
2. Verificar logs do backend
3. Consultar documentação citada acima
4. Abrir issue no repositório

---

**Status:** ✅ Integração Completa - Pronto para Desenvolvimento

**Última atualização:** 30/04/2026
