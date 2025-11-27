@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   Darevel - Starting Infrastructure
echo   (Keycloak + PostgreSQL)
echo ================================================
echo.

set ROOT_DIR=%~dp0

:: Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [1/2] Starting Infrastructure containers...
cd /d "%ROOT_DIR%infrastructure"
docker-compose up -d

if errorlevel 1 (
    echo [ERROR] Failed to start infrastructure
    pause
    exit /b 1
)

echo.
echo [2/2] Waiting for Keycloak to be ready (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo ================================================
echo   Infrastructure Started!
echo ================================================
echo.
echo   Services:
echo     - Keycloak:    http://localhost:8180 (admin/admin)
echo     - PostgreSQL:  localhost:5432
echo.
echo   Test Users: alice/password, bob/password
echo.
echo   You can now start any app:
echo     - start-mail.bat
echo     - start-chat.bat
echo     - start-slides.bat
echo     - start-sheet.bat
echo.
echo   Press any key to close this window...
pause >nul
