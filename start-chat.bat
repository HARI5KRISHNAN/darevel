@echo off

echo ================================================
echo   Darevel Chat - Complete Startup Script
echo ================================================
echo.
echo   This script will start:
echo     - PostgreSQL Database
echo     - Keycloak Authentication
echo     - Auth Service and Chat Service (Docker)
echo     - Jitsi Video Calls
echo     - Chat Frontend
echo.
echo ================================================
echo.

set ROOT_DIR=%~dp0

:: ========================================
:: STEP 1: Check Prerequisites
:: ========================================
echo [STEP 1/7] Checking prerequisites...

docker info >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo   [OK] Docker is running

node --version >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] Node.js is not installed.
    pause
    exit /b 1
)
echo   [OK] Node.js is installed

echo.

:: ========================================
:: STEP 2: Start Infrastructure
:: ========================================
echo [STEP 2/7] Starting Infrastructure (PostgreSQL + Keycloak)...

cd /d "%ROOT_DIR%infrastructure"
docker-compose up -d
if errorlevel 1 (
    echo   [ERROR] Failed to start infrastructure
    pause
    exit /b 1
)
echo   [OK] Infrastructure starting...

echo   Waiting for Keycloak (30 seconds)...
timeout /t 30 /nobreak >nul
echo   [OK] Keycloak should be ready

echo.

:: ========================================
:: STEP 3: Create Docker Network
:: ========================================
echo [STEP 3/7] Setting up Docker network...

docker network create darevel-network >nul 2>&1
echo   [OK] Network ready

echo.

:: ========================================
:: STEP 4: Start Backend Services
:: ========================================
echo [STEP 4/7] Starting Backend Services (Docker)...

cd /d "%ROOT_DIR%apps\chat\backend-java"
echo   Building and starting services (this may take a few minutes)...
docker-compose up -d auth-service chat-service docker-service
if errorlevel 1 (
    echo   [ERROR] Failed to start backend services
    pause
    exit /b 1
)

echo   Waiting for services to start (60 seconds)...
timeout /t 60 /nobreak >nul

echo   Verifying services...
curl -s http://localhost:8081/actuator/health >nul 2>&1
if errorlevel 1 (
    echo   [WARN] Auth Service 8081 may still be starting
) else (
    echo   [OK] Auth Service running on port 8081
)

curl -s http://localhost:8082/actuator/health >nul 2>&1
if errorlevel 1 (
    echo   [WARN] Chat Service 8082 may still be starting
) else (
    echo   [OK] Chat Service running on port 8082
)

curl -s http://localhost:8089/actuator/health >nul 2>&1
if errorlevel 1 (
    echo   [WARN] Docker Service 8089 may still be starting
) else (
    echo   [OK] Docker Service running on port 8089
)

echo.

:: ========================================
:: STEP 5: Start Jitsi
:: ========================================
echo [STEP 5/7] Starting Jitsi Video Service...

cd /d "%ROOT_DIR%apps\shared\jitsi"
docker-compose up -d
if errorlevel 1 (
    echo   [WARN] Jitsi failed to start - video calls may not work
) else (
    echo   [OK] Jitsi starting...
)

echo.

:: ========================================
:: STEP 6: Frontend Dependencies
:: ========================================
echo [STEP 6/7] Checking Frontend dependencies...

cd /d "%ROOT_DIR%apps\chat"
if not exist "node_modules" (
    echo   Installing npm dependencies...
    call npm install
)
echo   [OK] Frontend dependencies ready

echo.

:: ========================================
:: STEP 7: Start Frontend
:: ========================================
echo [STEP 7/7] Starting Chat Frontend...

cd /d "%ROOT_DIR%apps\chat"
start "Chat Frontend" cmd /k "npm run dev"
echo   [OK] Frontend starting...

echo.

:: ========================================
:: DONE
:: ========================================
echo ================================================
echo   Darevel Chat - Started Successfully!
echo ================================================
echo.
echo   SERVICES:
echo   -------------------------------------------------
echo   PostgreSQL:     localhost:5432
echo   Keycloak:       http://localhost:8180 (admin/admin)
echo   Auth Service:   http://localhost:8081
echo   Chat Service:   http://localhost:8082
echo   Docker Service: http://localhost:8089
echo   Jitsi:          http://localhost:8000
echo   Chat Frontend:  http://localhost:3003
echo   -------------------------------------------------
echo.
echo   TEST USERS: alice/password, bob/password
echo.
echo   To stop: Run stop-chat.bat
echo.
echo ================================================
pause
