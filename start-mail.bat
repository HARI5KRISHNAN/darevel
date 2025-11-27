@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   Darevel - Starting Mail App
echo   Frontend: http://localhost:3008
echo   Backend:  http://localhost:8086
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

echo [1/4] Starting Mail Database (port 5437)...
cd /d "%ROOT_DIR%apps\mail\backend"
docker-compose -f postgres-compose.yml up -d
echo    Database started on port 5437

echo.
echo [2/4] Starting Mail Backend (port 8086)...
start "Mail Backend" cmd /k "docker-compose up --build"

echo.
echo [3/4] Waiting for backend to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo [4/4] Starting Mail Frontend (port 3008)...
cd /d "%ROOT_DIR%apps\mail"
start "Mail Frontend" cmd /k "npm run dev"

echo.
echo ================================================
echo   Mail App Started!
echo ================================================
echo.
echo   Access:
echo     - Mail App:  http://localhost:3008
echo     - Mail API:  http://localhost:8086
echo     - Database:  localhost:5437
echo     - Keycloak:  http://localhost:8180
echo.
echo   Login: alice/password or bob/password
echo.
echo   To stop: Run stop-mail.bat
echo.
pause
