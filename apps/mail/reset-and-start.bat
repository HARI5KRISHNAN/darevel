@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo   Darevel Mail - Reset and Start Fresh
echo ============================================
echo.
echo WARNING: This will DELETE all data and start fresh!
echo Press Ctrl+C to cancel, or
pause

set MAIL_DIR=%~dp0
set INFRA_DIR=%MAIL_DIR%..\..\infrastructure

echo.
echo [1/6] Stopping all running services...

:: Stop backend
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

:: Stop frontend
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

echo.
echo [2/6] Stopping and removing Docker containers...
cd /d "%MAIL_DIR%"
docker-compose -f docker-compose.services.yml down -v 2>nul
docker-compose -f docker-compose.jitsi.yml down -v 2>nul

cd /d "%INFRA_DIR%"
docker-compose down -v 2>nul

echo.
echo [3/6] Removing old Docker volumes...
docker volume rm darevel-mail-postgres-data 2>nul
docker volume rm darevel-postgres-infra 2>nul
docker volume rm infrastructure_darevel-postgres-infra 2>nul

echo.
echo [4/6] Starting Infrastructure (Keycloak + PostgreSQL)...
cd /d "%INFRA_DIR%"
docker-compose up -d

echo.
echo [5/6] Waiting for services to be ready (this may take 1-2 minutes)...

:wait_postgres
timeout /t 2 /nobreak >nul
docker exec darevel-postgres-infra pg_isready -U postgres >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   Waiting for PostgreSQL...
    goto wait_postgres
)
echo   PostgreSQL is ready!

:: Create the darevel_mail database (init script should do this, but just in case)
echo Creating mail database...
docker exec darevel-postgres-infra psql -U postgres -c "CREATE DATABASE darevel_mail;" 2>nul
echo   Database darevel_mail ensured!

:: Run the init SQL script to create tables with correct schema
echo Initializing mail tables...
type "%MAIL_DIR%postgres-init\01-create-tables.sql" | docker exec -i darevel-postgres-infra psql -U postgres -d darevel_mail >nul 2>nul
echo   Tables initialized!

:wait_keycloak
timeout /t 5 /nobreak >nul
curl -s -o nul http://localhost:8180/realms/darevel
if %ERRORLEVEL% NEQ 0 (
    echo   Waiting for Keycloak...
    goto wait_keycloak
)
echo   Keycloak is ready!

echo.
echo [6/6] Reset complete!
echo ============================================
echo.

:: Now start the application
call "%MAIL_DIR%start-all.bat"
