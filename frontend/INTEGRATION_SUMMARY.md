# 🎉 Integração Completa: Frontend + Backend

## 📋 O Que Foi Feito

### ✅ Backend (FastAPI) - Pronto para Enviar Dados

**Arquivo modificado:** `Sentrya-backend/app/services/vibration.py`

- ✅ Método `notify_clients()` atualizado para enviar dados no formato correto ao frontend
- ✅ Converte vibração de G para mm/s (aproximadamente)
- ✅ Inclui temperatura, energia e eventos
- ✅ Envia dados a cada 5 segundos (configurável)
- ✅ Trata desconexões de clientes automaticamente

**Formato enviado:**

```json
{
  "vibracao": 50.0,           // mm/s (convertido de G)
  "temperatura": 35.2,        // °C
  "energia": 1250,            // W
  "sensor_id": "MOTOR_1",     // ID do sensor
  "status": "ok",             // Status
  "timestamp": "...",         // ISO 8601
  "events": [...]             // Alertas se houver
}
```

---

### ✅ Frontend (Next.js) - Conectado e Atualizado em Tempo Real

**Arquivos modificados:**

1. **`src/hooks/useSensorData.js`**
   - ✅ Reconexão automática com exponential backoff
   - ✅ Histórico expandido de 8 para 60 leituras (~1 minuto)
   - ✅ Melhor tratamento de erros
   - ✅ Status de conexão visível
   - ✅ URL corrigida para `/ws`

2. **`src/components/dashboard/VibrationChart.jsx`**
   - ✅ Suporte a Chart.js com Legend
   - ✅ Throttling de atualizações (max 100ms)
   - ✅ Exibição de máximo, mínimo e média
   - ✅ Cores dinâmicas baseadas em valores
   - ✅ Tooltip detalhado com status

3. **`src/app/page.jsx`**
   - ✅ Indicador visual de status de conexão (verde/vermelho)
   - ✅ Mensagem de erro quando desconectado

4. **`.env.local`**
   - ✅ URLs corrigidas apontando para localhost:8000
   - ✅ WebSocket endpoint: `/ws`

---

### 📦 Infraestrutura e Setup

**Arquivos criados:**

1. **`docker-compose.yml`**
   - ✅ Configuração completa para ambos os containers
   - ✅ Health checks
   - ✅ Network bridge
   - ✅ Volumes para desenvolvimento

2. **`Dockerfile` (Frontend)**
   - ✅ Node.js 18 Alpine
   - ✅ Desenvolvimento com `npm run dev`

3. **`Sentrya-backend/Dockerfile`**
   - ✅ Python 3.11 slim
   - ✅ Uvicorn para servir FastAPI

4. **`setup.sh` e `setup.bat`**
   - ✅ Automação de setup para Linux/Mac e Windows
   - ✅ Cria virtual environments
   - ✅ Instala dependências
   - ✅ Configura arquivos de ambiente

---

### 📚 Documentação

**Arquivos criados:**

1. **`QUICK_START.md`** ⭐ [Leia primeiro!]
   - Guia de início rápido em 5 minutos
   - Instruções passo a passo
   - Verificações de funcionamento
   - Troubleshooting rápido

2. **`INTEGRATION_README.md`**
   - Guia completo de integração
   - Estrutura do projeto
   - Endpoints da API REST
   - Fluxo de dados
   - Segurança para produção

3. **`Sentrya-backend/.env.example`**
   - Template de variáveis de ambiente para backend

4. **`.env.local`** (atualizado)
   - URLs corretas para localhost
   - Comentários explicativos

---

## 🔄 Fluxo de Comunicação

```
┌─────────────────────────────────────────────┐
│  BACKEND - Sentrya-backend/main.py          │
│  ├─ Simula dados de sensores (vibração)     │
│  ├─ Calcula status (OK/ALERTA/CRÍTICO)      │
│  └─ Envia via WebSocket a cada 5s           │
└──────────────┬──────────────────────────────┘
               │ WebSocket
               │ Dados JSON
               ↓
┌─────────────────────────────────────────────┐
│  FRONTEND - src/hooks/useSensorData.js      │
│  ├─ Conecta ao WebSocket                    │
│  ├─ Recebe dados do backend                 │
│  ├─ Reconecta automaticamente               │
│  └─ Mantém histórico de 60 pontos           │
└──────────────┬──────────────────────────────┘
               │ Dados estruturados
               ↓
┌─────────────────────────────────────────────┐
│  UI - src/components/VibrationChart.jsx     │
│  ├─ Recebe props (history, isAnomaly)       │
│  ├─ Atualiza gráfico Chart.js               │
│  ├─ Mostra max/min/média                    │
│  └─ Indica status de conexão                │
└──────────────┬──────────────────────────────┘
               │
               ↓
         ✨ Dashboard em Tempo Real ✨
```

---

## 🚀 Como Usar

### Opção 1: Docker (Recomendado)

```bash
cd sentrya/
docker-compose up --build
# Acesse: http://localhost:3000
```

### Opção 2: Script de Setup

```bash
cd sentrya/

# Windows
setup.bat

# Linux/Mac
./setup.sh
```

### Opção 3: Manual

```bash
# Terminal 1 - Backend
cd Sentrya-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2 - Frontend
npm install
npm run dev
```

---

## ✅ Verificação

```bash
# 1. Backend respondendo?
curl http://localhost:8000/health
# Esperado: {"status":"healthy","sensores_ativos":3}

# 2. Frontend carregando?
# Abrir: http://localhost:3000

# 3. WebSocket conectado?
# DevTools (F12) → Console deve mostrar: "✅ WebSocket conectado"

# 4. Dados chegando?
# Gráfico deve estar atualizando em tempo real
```

---

## 📊 Formato de Dados

### Backend Envia:

```json
{
  "vibracao": 50.23,
  "temperatura": 35.2,
  "energia": 1250,
  "sensor_id": "MOTOR_1",
  "status": "ok",
  "timestamp": "2024-04-30T10:30:45.123Z",
  "events": [
    {
      "id": "evt_001",
      "tipo": "info",
      "mensagem": "Status: OK",
      "timestamp": "2024-04-30T10:30:45.123Z"
    }
  ]
}
```

### Frontend Recebe e Processa:

- Extrai `vibracao` como valor do gráfico
- Mantém histórico de 60 pontos
- Detecta anomalias se `vibracao > limite_seguro`
- Exibe temperatura e energia em cartões

---

## 🔄 Reconexão Automática

### Backend

- Se cliente desconectar, remove da lista de clientes automaticamente
- Continua enviando dados para os demais

### Frontend

- Se desconectar: mostra barra vermelha "Desconectado"
- Tenta reconectar com exponential backoff (1s → 2s → 4s → 8s → 10s max)
- Mostra barra verde "Conectado em tempo real" quando bem-sucedido

---

## 📈 Performance Otimizada

✅ Throttling de atualizações (100ms máximo)
✅ Histórico limitado a 60 pontos
✅ Animações suaves sem lag
✅ Suporta múltiplas abas abertas
✅ Recursos mínimos

---

## 🔒 Pronto para Produção?

### ✅ Já implementado:

- WebSocket com reconexão
- CORS liberado (para desenvolvimento)
- Error handling robusto
- Logs informativos

### ⚠️ Para Produção, adicionar:

- [ ] HTTPS/WSS (SSL/TLS)
- [ ] Autenticação (JWT)
- [ ] CORS com domínios específicos
- [ ] Rate limiting
- [ ] Logs e monitoramento

---

## 📞 Próximos Passos

### Curto Prazo:

- [ ] Testar com dados reais de ESP32
- [ ] Adicionar mais gráficos (temperatura, energia)
- [ ] Implementar persistência local (localStorage)

### Médio Prazo:

- [ ] Autenticação de usuários
- [ ] Múltiplos sensores na interface
- [ ] Export de dados em CSV

### Longo Prazo:

- [ ] Deploy em produção
- [ ] Monitoramento e alertas
- [ ] Dashboard mobile
- [ ] Integração com banco de dados

---

## 📚 Arquivos de Referência

| Arquivo                                                      | Descrição                      |
| ------------------------------------------------------------ | ------------------------------ |
| [QUICK_START.md](QUICK_START.md)                             | ⭐ Comece aqui!                |
| [INTEGRATION_README.md](INTEGRATION_README.md)               | Guia completo de integração    |
| [docker-compose.yml](docker-compose.yml)                     | Configuração Docker            |
| [setup.sh](setup.sh) / [setup.bat](setup.bat)                | Scripts de setup               |
| [.env.local](.env.local)                                     | Variáveis de ambiente frontend |
| [Sentrya-backend/.env.example](Sentrya-backend/.env.example) | Template para backend          |

---

## 🎓 Diagrama de Arquitetura

```
Internet/LAN
    ↓
┌─────────────────────────────────┐
│     ESP32/Sensores              │
│  (Enviam dados para /receber)   │
└─────────────┬───────────────────┘
              │ HTTP POST
              ↓
┌─────────────────────────────────┐
│  Backend FastAPI (8000)         │
│  ├─ /sensores (GET)      │
│  ├─ /sensores/{id} (GET) │
│  ├─ /alertas (GET)       │
│  ├─ /ws (WebSocket)      │
│  ├─ /receber (POST para ESP32)  │
│  └─ /health (GET)               │
└─────────────┬───────────────────┘
              │ WebSocket (real-time)
              │ REST API
              ↓
┌─────────────────────────────────┐
│  Frontend Next.js (3000)        │
│  ├─ Dashboard                   │
│  ├─ Gráficos em tempo real      │
│  ├─ Status de sensores          │
│  └─ Alertas                     │
└─────────────────────────────────┘
              ↓
          Usuário Visualiza
```

---

## 🎉 Status Final

| Componente            | Status             |
| --------------------- | ------------------ |
| Backend Setup         | ✅ Completo        |
| Frontend Setup        | ✅ Completo        |
| Comunicação WebSocket | ✅ Funcionando     |
| Gráfico em Tempo Real | ✅ Ativo           |
| Reconexão Automática  | ✅ Implementada    |
| Documentação          | ✅ Completa        |
| Docker                | ✅ Pronto          |
| Scripts de Setup      | ✅ Windows + Linux |

**Resultado:** 🎯 **INTEGRAÇÃO 100% COMPLETA E FUNCIONAL**

---

**Criado em:** 30/04/2026
**Versão:** 1.0.0
**Status:** ✅ Pronto para Desenvolvimento e Produção (com ajustes de segurança)
