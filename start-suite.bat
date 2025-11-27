@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   Darevel - Starting Suite/Dashboard App
echo   Backend:  http://localhost:8085
echo ================================================
echo.

set ROOT_DIR=%~dp0

:: Check if Keycloak is running
curl -s http://localhost:8180 >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Keycloak is not running!
    echo         Please run start-infrastructure.bat first.
    pause
    exit /b 1
)

echo [1/2] Starting Suite Database (port 5436)...
cd /d "%ROOT_DIR%apps\suite\backend"
docker-compose -f postgres-compose.yml up -d
echo    Database started on port 5436

echo.
echo [2/2] Starting Suite Backend (port 8085)...
start "Suite Backend" cmd /k "docker-compose up --build"

echo.
echo Waiting for backend to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo ================================================
echo   Suite/Dashboard Started!
echo ================================================
echo.
echo   Access:
echo     - Suite API:   http://localhost:8085
echo     - Health:      http://localhost:8085/api/health
echo     - Dashboard:   http://localhost:8085/api/dashboard/stats
echo     - Database:    localhost:5436
echo     - Keycloak:    http://localhost:8180
echo.
echo   Login: alice/password or bob/password
echo.
echo   To stop: Run stop-suite.bat
echo.
pause
