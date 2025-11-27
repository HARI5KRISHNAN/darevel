@echo off
echo ============================================
echo   Darevel Mail - Stop All Services
echo ============================================
echo.

set MAIL_DIR=%~dp0
set INFRA_DIR=%MAIL_DIR%..\..\infrastructure

echo [1/3] Stopping Backend (port 8081)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo   Stopped backend process
)

echo.
echo [2/3] Stopping Mail Docker Services...
cd /d "%MAIL_DIR%"
docker-compose -f docker-compose.services.yml down

echo.
echo [3/3] Stopping Infrastructure (Keycloak)...
cd /d "%INFRA_DIR%"
docker-compose down

echo.
echo ============================================
echo   All services stopped!
echo ============================================
pause
