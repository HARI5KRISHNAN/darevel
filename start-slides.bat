@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   Darevel - Starting Slides App
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8084
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

echo [1/4] Starting Slides Database (port 5435)...
cd /d "%ROOT_DIR%apps\slides\backend"
docker-compose -f postgres-compose.yml up -d
echo    Database started on port 5435

echo.
echo [2/4] Starting Slides Backend (port 8084)...
start "Slides Backend" cmd /k "docker-compose up --build"

echo.
echo [3/4] Waiting for backend to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo [4/4] Starting Slides Frontend (port 3000)...
cd /d "%ROOT_DIR%apps\slides"
start "Slides Frontend" cmd /k "npm run dev"

echo.
echo ================================================
echo   Slides App Started!
echo ================================================
echo.
echo   Access:
echo     - Slides App:  http://localhost:3000
echo     - Slides API:  http://localhost:8084
echo     - Database:    localhost:5435
echo     - Keycloak:    http://localhost:8180
echo.
echo   Login: alice/password or bob/password
echo.
echo   To stop: Run stop-slides.bat
echo.
pause
