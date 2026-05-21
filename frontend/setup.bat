@echo off
REM 🚀 Script de Setup - Sentrya Frontend + Backend (Windows)
REM Este script configura e inicia ambos os projetos

setlocal enabledelayedexpansion

echo.
echo ================================================
echo 🔴 SENTRYA - Setup Desenvolvimento (Windows)
echo ================================================
echo.

REM Verificar se está na pasta correta
if not exist "Sentrya-backend" (
    echo [ERRO] Pasta Sentrya-backend não encontrada
    exit /b 1
)
if not exist "src" (
    echo [ERRO] Pasta src não encontrada
    exit /b 1
)

echo [✓] Pasta correta detectada
echo.

REM ===================================
REM SETUP BACKEND
REM ===================================
echo.
echo 📦 Configurando BACKEND...
echo.

cd Sentrya-backend

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [✗] Python3 não encontrado. Instale Python 3.11+
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo [✓] Python encontrado: %PYTHON_VERSION%

REM Criar venv se não existir
if not exist "venv" (
    echo [⚠] Criando virtual environment...
    python -m venv venv
)

REM Ativar venv
call venv\Scripts\activate.bat
echo [✓] Virtual environment ativado

REM Instalar dependências
echo [⚠] Instalando dependências do backend...
pip install -q -r requirements.txt
echo [✓] Dependências do backend instaladas

REM Criar .env se não existir
if not exist ".env" (
    echo [⚠] Criando arquivo .env do backend...
    copy .env.example .env >nul 2>&1
    if errorlevel 1 (
        (
            echo APP_NAME=Sentrya API
            echo DEBUG=true
            echo HOST=0.0.0.0
            echo PORT=8000
        ) > .env
    )
)
echo [✓] Arquivo .env do backend configurado

cd ..

REM ===================================
REM SETUP FRONTEND
REM ===================================
echo.
echo 📦 Configurando FRONTEND...
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [✗] Node.js não encontrado. Instale Node.js 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [✓] Node.js encontrado: %NODE_VERSION%

REM Instalar dependências
if not exist "node_modules" (
    echo [⚠] Instalando dependências do frontend...
    call npm install --silent
    echo [✓] Dependências do frontend instaladas
) else (
    echo [✓] node_modules já existe
)

REM Criar .env.local se não existir
if not exist ".env.local" (
    echo [⚠] Criando arquivo .env.local do frontend...
    (
        echo # Backend API URL
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
        echo.
        echo # WebSocket URL
        echo NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
        echo.
        echo # Polling interval ^(ms^)
        echo NEXT_PUBLIC_POLL_INTERVAL=3000
    ) > .env.local
)
echo [✓] Arquivo .env.local do frontend configurado

REM ===================================
REM RESUMO E PRÓXIMOS PASSOS
REM ===================================
echo.
echo ================================================
echo [✓] Setup Concluído com Sucesso!
echo ================================================
echo.
echo 📋 Próximas etapas:
echo.
echo 1️⃣  Abra dois terminais (Prompt/PowerShell) diferentes:
echo.
echo    Terminal 1 - Backend:
echo    cd Sentrya-backend
echo    venv\Scripts\activate
echo    uvicorn app.main:app --reload
echo.
echo    Terminal 2 - Frontend:
echo    npm run dev
echo.
echo 2️⃣  Acesse:
echo    Frontend:     http://localhost:3000
echo    Backend API:  http://localhost:8000
echo    API Docs:     http://localhost:8000/docs
echo.
echo 3️⃣  Verifique a conexão:
echo    - Abra http://localhost:3000 no navegador
echo    - Pressione F12 para abrir DevTools
echo    - Veja se aparece "Conectado em tempo real" ^(barra verde^)
echo.
echo 💡 Ou execute tudo com Docker:
echo    docker-compose up --build
echo.
echo ================================================
echo.
pause
