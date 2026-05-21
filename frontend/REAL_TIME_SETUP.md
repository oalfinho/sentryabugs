# 📊 Guia de Configuração - Gráfico em Tempo Real

## 🎯 O que foi implementado

O sistema foi atualizado para exibir os dados de vibração do sensor em **tempo real** no gráfico, com as seguintes melhorias:

### ✨ Recursos Implementados

1. **WebSocket em Tempo Real**
   - Conexão persistente com o servidor via WebSocket
   - Reconexão automática com exponential backoff
   - Máximo de 10 segundos entre tentativas de reconexão

2. **Histórico Expandido**
   - Antes: 8 leituras
   - Agora: 60 leituras (aproximadamente 1 minuto com dados a cada segundo)

3. **Melhor Performance**
   - Throttling de atualizações do gráfico (máximo 100ms entre updates)
   - Animações suaves sem travamentos
   - Otimização de renderização

4. **Indicadores Visuais**
   - Status de conexão em tempo real (verde/vermelho)
   - Valores máximo, mínimo e média exibidos
   - Cores indicam se valor está acima do limite seguro

5. **Melhor UX**
   - Tooltip com informações mais detalhadas
   - Legenda no gráfico
   - Maior altura do gráfico para melhor visualização
   - Formatos numéricos com 2 casas decimais

## ⚙️ Configuração Necessária

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Para desenvolvimento local
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws

# Para produção
# NEXT_PUBLIC_WS_URL=wss://seu-dominio.com/ws
```

ou copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

### 2. Backend - WebSocket Server

Seu backend precisa:

1. **Servir um WebSocket** na URL configurada (ex: `ws://localhost:5000/ws`)
2. **Enviar dados JSON** com este formato a cada atualização:

```json
{
  "vibracao": 450.5,
  "temperatura": 35.2,
  "energia": 1250,
  "events": [
    {
      "id": "evt_001",
      "tipo": "alerta",
      "mensagem": "Vibração acima do limite",
      "timestamp": "2024-04-30T10:30:45Z"
    }
  ]
}
```

**Campos obrigatórios:**

- `vibracao` (número): valor em mm/s

**Campos opcionais:**

- `temperatura` (número): em °C
- `energia` (número): em watts
- `events` (array): lista de eventos/alertas

### 3. Iniciar o Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar desenvolvimento
npm run dev
```

O app estará em `http://localhost:3000`

## 🔍 Verificação de Funcionamento

### ✅ Checklist

- [ ] `.env.local` configurado com URL do WebSocket
- [ ] Backend rodando e servindo WebSocket
- [ ] No console do navegador (F12):
  - [ ] Ver `✅ WebSocket conectado`
  - [ ] Ver dados chegando regularmente
  - [ ] Ver indicador verde de conexão
- [ ] Gráfico atualizando em tempo real
- [ ] Novos valores aparecem no final da linha
- [ ] Cores mudam quando valor > limite seguro

### 🐛 Troubleshooting

**Problema: "Desconectado do servidor"**

- Verificar se WebSocket URL está correta em `.env.local`
- Verificar se backend está rodando
- Verificar se CORS está configurado corretamente no backend

**Problema: Gráfico não está atualizando**

- Abrir DevTools (F12) → Console
- Verificar se há mensagens de erro
- Confirmar que dados estão chegando via WebSocket

**Problema: Conexão dropping frequentemente**

- Aumentar `RECONNECT_MAX_DELAY` em `useSensorData.js` se necessário
- Verificar estabilidade da conexão de rede

## 📈 Otimizações Futuras

1. **Compressão de dados**: Implementar compressão de histórico após certo tempo
2. **LocalStorage**: Salvar histórico localmente para persistência
3. **Dados adicionais**: Gráficos para temperatura e energia
4. **Alertas**: Sistema de notificações para anomalias detectadas
5. **Export**: Funcionalidade para exportar dados em CSV

## 📝 Documentação do Código

### Hook `useSensorData`

```javascript
const { data, history, loading, error, isConnected } = useSensorData();
```

**Retorna:**

- `data`: Dados atuais do sensor
- `history`: Array com últimas 60 leituras
- `loading`: Booleano indicando carregamento inicial
- `error`: Mensagem de erro (se houver)
- `isConnected`: Status da conexão WebSocket

### Componente `VibrationChart`

```javascript
<VibrationChart history={history} isAnomaly={anomaly} />
```

**Props:**

- `history`: Array de { label, value, timestamp, ... }
- `isAnomaly`: Booleano para indicar estado de anomalia

## 🔒 Segurança para Produção

1. **Usar WSS (WebSocket Seguro)** com SSL/TLS
2. **Implementar autenticação** no WebSocket
3. **Validar dados** no frontend
4. **Rate limiting** no backend
5. **CORS configurado** apropriadamente

## 📞 Suporte

Para problemas ou dúvidas, verifique:

- [Chart.js Docs](https://www.chartjs.org/)
- [WebSocket API MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- Logs do console do navegador
- Logs do servidor backend
