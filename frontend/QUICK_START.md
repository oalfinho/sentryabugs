# ⚡ GUIA RÁPIDO - Sentrya Frontend + Backend

## 🎯 Objetivo

Monitorar sensores de vibração em **tempo real** com:

- ✅ Gráfico dinâmico atualizando a cada segundo
- ✅ Reconexão automática se servidor cair
- ✅ Backend simulando dados de sensores
- ✅ WebSocket para comunicação em tempo real

---

## 🚀 Início Rápido (5 minutos)

### Windows

```bash
# Na pasta sentrya/
setup.bat
```

### Linux/Mac

```bash
# Na pasta sentrya/
chmod +x setup.sh
./setup.sh
```

### Com Docker (Ainda mais rápido!)

```bash
docker-compose up --build
```

---

## 📖 Depois do Setup

### Terminal 1 - Backend

```bash
cd Sentrya-backend
source venv/bin/activate  # ou venv\Scripts\activate (Windows)
uvicorn app.main:app --reload
```

Você deve ver:

```
✨ Uvicorn running on http://0.0.0.0:8000
Application startup complete
```

### Terminal 2 - Frontend

```bash
npm run dev
```

Você deve ver:

```
▲ Next.js 14.2.3
✓ Ready in 2.3s
```

---

## ✅ Verificação

### 1. Backend está respondendo?

```bash
curl http://localhost:8000/health
```

Esperado: `{"status":"healthy","sensores_ativos":3}`

### 2. Frontend está conectado?

- Abrir: http://localhost:3000
- Deve aparecer barra verde no topo: **"✓ Conectado em tempo real"**
- DevTools (F12) → Console deve mostrar: **"✅ WebSocket conectado"**

### 3. Gráfico está atualizando?

- Deve haver uma linha se movendo para a direita
- Novos pontos aparecem a cada segundo
- Valores mostram máximo, mínimo e média

---

## 🔧 Configuração (Se Necessário)

### Se o Backend está em outra máquina

Editar `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://192.168.56.1:8000
NEXT_PUBLIC_WS_URL=ws://192.168.56.1:8000/ws
```

Editar `Sentrya-backend/.env`:

```env
HOST=0.0.0.0  # Ouvir em todas as interfaces
PORT=8000
```

---

## 📊 O que você vai ver

### Dashboard com:

1. **Status do Sensor** - OK/ALERTA/CRÍTICO
2. **Gráfico em Tempo Real** - Vibração ao longo do tempo
3. **Métricas** - Temperatura, Energia, Vibração atual
4. **Eventos** - Lista de alertas e anomalias

### Dados fluindo assim:

```
Backend (Simula dados)
    ↓ (WebSocket)
Frontend (Recebe dados)
    ↓
Gráfico atualiza
    ↓
Interface mostra status
```

---

## 🐛 Se Algo Não Funcionar

### "Desconectado do servidor"

1. Verificar se backend está rodando (Terminal 1)
2. Verificar `.env.local` tem URL correta
3. Abrir DevTools (F12) → Console para ver erros

### "Conexão recusada"

1. Backend está em porta 8000? (`lsof -i :8000`)
2. Firewall bloqueando?
3. Tentar acessar `http://localhost:8000` direto no navegador

### "Gráfico não atualiza"

1. DevTools → Network → WS (filtrar por WebSocket)
2. Deve ver mensagens chegando periodicamente
3. Se não houver, backend não está enviando

---

## 📚 Próximas Etapas

### Desenvolvimento

- [ ] Adicionar mais gráficos (temperatura, energia)
- [ ] Integrar dados reais de ESP32
- [ ] Implementar autenticação
- [ ] Adicionar export de dados em CSV

### Produção

- [ ] Usar HTTPS/WSS
- [ ] Implementar autenticação JWT
- [ ] Rate limiting
- [ ] Configurar CORS com domínios específicos
- [ ] Docker/Kubernetes

---

## 🔗 Links Úteis

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs ← Muito útil!
- Arquivo README completo: [INTEGRATION_README.md](INTEGRATION_README.md)

---

## 💡 Dicas

### Ver dados chegando em tempo real

```javascript
// No console do navegador (F12):
const ws = new WebSocket("ws://localhost:8000/ws");
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

### Testar a API com curl

```bash
# Listar sensores
curl http://localhost:8000/sensores

# Ver alertas
curl http://localhost:8000/alertas

# Documentação completa
open http://localhost:8000/docs
```

### Logs do Backend

Abra `Sentrya-backend/` e veja os logs de inicialização e conexões WebSocket

---

## 🎓 Como Funciona a Integração

```
┌─────────────────────────────────────────────┐
│           Frontend (Next.js)                 │
│  ┌──────────────────────────────────────┐  │
│  │  src/hooks/useSensorData.js          │  │
│  │  - Conecta ao WebSocket              │  │
│  │  - Reconecta automaticamente         │  │
│  │  - Mantém histórico de 60 leituras   │  │
│  └──────────────────────────────────────┘  │
│              ↓ (WebSocket)                  │
│  ┌──────────────────────────────────────┐  │
│  │  src/components/VibrationChart.jsx   │  │
│  │  - Recebe dados em tempo real        │  │
│  │  - Atualiza gráfico Chart.js         │  │
│  │  - Mostra max/min/média              │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
           ↑ Dados JSON
           │
┌─────────────────────────────────────────────┐
│           Backend (FastAPI)                  │
│  ┌──────────────────────────────────────┐  │
│  │  app/services/vibration.py           │  │
│  │  - Simula dados de sensores          │  │
│  │  - Atualiza a cada 5 segundos        │  │
│  │  - Verifica limiares de alerta       │  │
│  └──────────────────────────────────────┘  │
│              ↓ (Broadcast)                  │
│  ┌──────────────────────────────────────┐  │
│  │  app/api/routes.py                   │  │
│  │  - Endpoint /ws (WebSocket)   │  │
│  │  - Envia dados para todos os clientes│  │
│  │  - Reconecta automaticamente         │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## ✨ Status

**Setup:** ✅ Completo
**Frontend-Backend:** ✅ Comunicando
**Tempo Real:** ✅ Funcionando
**Pronto para desenvolvimento:** ✅ SIM

---

**Dúvidas?** Abra DevTools (F12) e veja os logs no console e aba Network!
