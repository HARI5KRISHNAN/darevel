@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo   Darevel Mail - Full Stack Startup Script
echo ============================================
echo.

:: Configuration
set MAIL_DIR=%~dp0
set BACKEND_JAR=%MAIL_DIR%backend\mail-service\target\mail-service-1.0.0.jar
set INFRA_DIR=%MAIL_DIR%..\..\infrastructure

:: Check if Java is installed
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)

:: Check if Docker is running
docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running
    echo Please start Docker Desktop first
    pause
    exit /b 1
)

echo [1/5] Starting Infrastructure (Keycloak + PostgreSQL)...
cd /d "%INFRA_DIR%"
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Infrastructure may already be running or failed to start
)

echo.
echo [2/5] Waiting for PostgreSQL to be ready...
:wait_postgres
docker exec darevel-postgres-infra pg_isready -U postgres >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   Waiting for PostgreSQL...
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)
echo   PostgreSQL is ready!

:: Create the darevel_mail database if it doesn't exist
echo Creating mail database (if not exists)...
docker exec darevel-postgres-infra psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='darevel_mail'" | findstr "1" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    docker exec darevel-postgres-infra psql -U postgres -c "CREATE DATABASE darevel_mail;" >nul 2>nul
    echo   Database darevel_mail created!
    :: Initialize tables with correct schema
    echo   Initializing tables...
    type "%MAIL_DIR%postgres-init\01-create-tables.sql" | docker exec -i darevel-postgres-infra psql -U postgres -d darevel_mail >nul 2>nul
    echo   Tables initialized!
) else (
    echo   Database darevel_mail already exists.
    :: Check if tables need to be initialized
    docker exec darevel-postgres-infra psql -U postgres -d darevel_mail -c "SELECT 1 FROM mails LIMIT 1" >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo   Initializing tables...
        type "%MAIL_DIR%postgres-init\01-create-tables.sql" | docker exec -i darevel-postgres-infra psql -U postgres -d darevel_mail >nul 2>nul
        echo   Tables initialized!
    )
)

echo.
echo [3/5] Waiting for Keycloak to be ready...
:wait_keycloak
curl -s -o nul http://localhost:8180/realms/darevel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo   Waiting for Keycloak (this may take 1-2 minutes)...
    timeout /t 5 /nobreak >nul
    goto wait_keycloak
)
echo   Keycloak is ready!

echo.
echo [4/5] Starting Backend Mail Service...
cd /d "%MAIL_DIR%"

:: Check if JAR exists
if not exist "%BACKEND_JAR%" (
    echo ERROR: Backend JAR not found at %BACKEND_JAR%
    echo Please build the backend first with: cd backend\mail-service ^&^& mvn package -DskipTests
    pause
    exit /b 1
)

:: Kill any existing backend process on port 8081
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do (
    echo Stopping existing process on port 8081...
    taskkill /F /PID %%a >nul 2>nul
)

:: Start the backend in a new window with correct database URL (let Hibernate manage schema)
start "Darevel Mail Backend" cmd /c "java -jar "%BACKEND_JAR%" --spring.datasource.url=jdbc:postgresql://localhost:5432/darevel_mail --spring.jpa.hibernate.ddl-auto=update && pause"

echo   Backend starting on port 8081...
timeout /t 8 /nobreak >nul

echo.
echo [5/5] Starting Frontend...
:: Kill any existing frontend process on port 5173
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

:: Start frontend in a new window
start "Darevel Mail Frontend" cmd /c "cd /d "%MAIL_DIR%" && npm run dev"

echo.
echo ============================================
echo   All services started!
echo ============================================
echo.
echo   Services:
echo   - Keycloak:     http://localhost:8180 (admin/admin)
echo   - Backend API:  http://localhost:8081
echo   - Frontend:     http://localhost:5173
echo   - MailHog UI:   http://localhost:8025 (if running)
echo.
echo   Test Users (password: password):
echo   - alice@darevel.local
echo   - bob@darevel.local
echo.
echo   Press any key to exit (services will keep running)
echo ============================================
pause >nul
