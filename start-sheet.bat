@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   Darevel - Starting Sheet App
echo   Frontend: http://localhost:3004
echo   Backend:  http://localhost:8089
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

echo [1/4] Starting Sheet Database (port 5438)...
cd /d "%ROOT_DIR%apps\sheet\backend"
docker-compose -f postgres-compose.yml up -d
echo    Database started on port 5438

echo.
echo [2/4] Starting Sheet Backend (port 8089)...
start "Sheet Backend" cmd /k "docker-compose up --build"

echo.
echo [3/4] Waiting for backend to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo [4/4] Starting Sheet Frontend (port 3004)...
cd /d "%ROOT_DIR%apps\sheet"
start "Sheet Frontend" cmd /k "npm run dev"

echo.
echo ================================================
echo   Sheet App Started!
echo ================================================
echo.
echo   Access:
echo     - Sheet App:  http://localhost:3004
echo     - Sheet API:  http://localhost:8089
echo     - Database:   localhost:5438
echo     - Keycloak:   http://localhost:8180
echo.
echo   Login: alice/password or bob/password
echo.
echo   To stop: Run stop-sheet.bat
echo.
pause
