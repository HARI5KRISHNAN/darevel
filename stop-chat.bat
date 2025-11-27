@echo off

echo ================================================
echo   Darevel Chat - Complete Shutdown Script
echo ================================================
echo.

set ROOT_DIR=%~dp0

:: ========================================
:: STEP 1: Stop Frontend
:: ========================================
echo [STEP 1/5] Stopping Chat Frontend (port 3003)...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3003" ^| findstr "LISTENING"') do (
    echo   Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo   [OK] Frontend stopped

echo.

:: ========================================
:: STEP 2: Stop Backend Services
:: ========================================
echo [STEP 2/5] Stopping Backend Services...

cd /d "%ROOT_DIR%apps\chat\backend-java"
docker-compose stop auth-service chat-service docker-service >nul 2>&1
docker stop darevel-auth-service >nul 2>&1
docker stop darevel-chat-service >nul 2>&1
docker stop darevel-docker-service >nul 2>&1
echo   [OK] Backend services stopped

echo.

:: ========================================
:: STEP 3: Stop Jitsi
:: ========================================
echo [STEP 3/5] Stopping Jitsi Video Service...

cd /d "%ROOT_DIR%apps\shared\jitsi"
docker-compose stop >nul 2>&1
docker stop jitsi-jvb-1 jitsi-jicofo-1 jitsi-prosody-1 jitsi-jitsi-web-1 >nul 2>&1
echo   [OK] Jitsi stopped

echo.

:: ========================================
:: STEP 4: Ask about Infrastructure
:: ========================================
echo [STEP 4/5] Infrastructure (PostgreSQL + Keycloak)...
echo.
echo   Infrastructure is shared by all Darevel apps.
choice /C YN /M "Stop Infrastructure too"
if errorlevel 2 goto skip_infra

cd /d "%ROOT_DIR%infrastructure"
docker-compose stop >nul 2>&1
docker stop darevel-keycloak-infra darevel-postgres-infra >nul 2>&1
echo   [OK] Infrastructure stopped
goto done_infra

:skip_infra
echo   [OK] Infrastructure kept running

:done_infra
echo.

:: ========================================
:: STEP 5: Show Status
:: ========================================
echo [STEP 5/5] Final Status...
echo.
echo   Running containers:
docker ps --format "table {{.Names}}\t{{.Status}}" 2>nul

echo.
echo ================================================
echo   Shutdown Complete!
echo ================================================
echo.
echo   To restart: Run start-chat.bat
echo.
pause
