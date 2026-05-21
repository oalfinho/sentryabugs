#!/bin/bash

# 🚀 Script de Setup - Sentrya Frontend + Backend
# Este script configura e inicia ambos os projetos

set -e  # Exit se algum comando falhar

echo "================================================"
echo "🔴 SENTRYA - Setup Desenvolvimento"
echo "================================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar se está na pasta correta
if [ ! -d "Sentrya-backend" ] || [ ! -d "src" ]; then
    print_error "Este script deve ser executado na raiz do projeto (pasta sentrya)"
    exit 1
fi

print_status "Pasta correta detectada"

# ===================================
# SETUP BACKEND
# ===================================
echo ""
echo "📦 Configurando BACKEND..."
echo ""

cd Sentrya-backend

# Verificar Python
if ! command -v python3 &> /dev/null; then
    print_error "Python3 não encontrado. Instale Python 3.11+"
    exit 1
fi
print_status "Python encontrado: $(python3 --version)"

# Criar venv se não existir
if [ ! -d "venv" ]; then
    print_warning "Criando virtual environment..."
    python3 -m venv venv
fi

# Ativar venv
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
fi
print_status "Virtual environment ativado"

# Instalar dependências
print_warning "Instalando dependências do backend..."
pip install -q -r requirements.txt
print_status "Dependências do backend instaladas"

# Criar .env se não existir
if [ ! -f ".env" ]; then
    print_warning "Criando arquivo .env do backend..."
    cp .env.example .env 2>/dev/null || echo "APP_NAME=Sentrya API" > .env
fi
print_status "Arquivo .env do backend configurado"

cd ..

# ===================================
# SETUP FRONTEND
# ===================================
echo ""
echo "📦 Configurando FRONTEND..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Instale Node.js 18+"
    exit 1
fi
print_status "Node.js encontrado: $(node --version)"

# Instalar dependências
if [ ! -d "node_modules" ]; then
    print_warning "Instalando dependências do frontend..."
    npm install --silent
    print_status "Dependências do frontend instaladas"
else
    print_status "node_modules já existe"
fi

# Criar .env.local se não existir
if [ ! -f ".env.local" ]; then
    print_warning "Criando arquivo .env.local do frontend..."
    cat > .env.local << EOF
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Polling interval (ms)
NEXT_PUBLIC_POLL_INTERVAL=3000
EOF
fi
print_status "Arquivo .env.local do frontend configurado"

# ===================================
# RESUMO E PRÓXIMOS PASSOS
# ===================================
echo ""
echo "================================================"
echo -e "${GREEN}✓ Setup Concluído com Sucesso!${NC}"
echo "================================================"
echo ""
echo "📋 Próximas etapas:"
echo ""
echo "1️⃣  Abra dois terminais diferentes:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   $ cd Sentrya-backend"
echo "   $ source venv/bin/activate  # ou venv\\Scripts\\activate (Windows)"
echo "   $ uvicorn app.main:app --reload"
echo ""
echo "   Terminal 2 - Frontend:"
echo "   $ npm run dev"
echo ""
echo "2️⃣  Acesse:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:8000"
echo "   API Docs:     http://localhost:8000/docs"
echo ""
echo "3️⃣  Verifique a conexão:"
echo "   - Abra http://localhost:3000 no navegador"
echo "   - Pressione F12 para abrir DevTools"
echo "   - Veja se aparece 'Conectado em tempo real' (barra verde)"
echo ""
echo "💡 Ou execute tudo com Docker:"
echo "   $ docker-compose up --build"
echo ""
echo "================================================"
