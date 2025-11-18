@echo off
REM Darevel Suite - Backend Build & Startup Script (Windows PowerShell)
REM This script builds all microservices and starts the infrastructure

setlocal enabledelayedexpansion

set WORKSPACE_ROOT=%~dp0..
set INFRASTRUCTURE_DIR=%WORKSPACE_ROOT%\infrastructure

echo =========================================
echo Darevel Suite - Backend Build and Startup
echo =========================================
echo.

REM Step 1: Check if Docker is running
echo Step 1: Checking Docker daemon...
docker ps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker daemon is not running. Please start Docker Desktop.
    exit /b 1
)
echo OK: Docker is running
echo.

REM Step 2: Start infrastructure (PostgreSQL + Keycloak)
echo Step 2: Starting infrastructure services (PostgreSQL + Keycloak)...
cd /d "%INFRASTRUCTURE_DIR%"
docker-compose up -d
if errorlevel 1 (
    echo ERROR: Failed to start infrastructure services
    exit /b 1
)
echo OK: Infrastructure started
echo.

REM Step 3: Wait for PostgreSQL
echo Step 3: Waiting for PostgreSQL to be ready...
for /L %%i in (1,1,30) do (
    docker exec darevel-postgres pg_isready -U postgres >nul 2>&1
    if errorlevel 0 (
        echo OK: PostgreSQL is ready
        goto :postgresready
    )
    echo Waiting... %%i/30
    timeout /t 2 /nobreak >nul
)
echo ERROR: PostgreSQL failed to start
exit /b 1

:postgresready
echo.

REM Step 4: Build all backend services
echo Step 4: Building backend microservices...
cd /d "%WORKSPACE_ROOT%"

for %%S in (chat excel mail slides suite) do (
    echo Building apps\%%S\backend...
    cd /d "%WORKSPACE_ROOT%\apps\%%S\backend"
    call mvn clean package -DskipTests -q
    if errorlevel 1 (
        echo ERROR: Failed to build %%S backend
        exit /b 1
    )
)
echo OK: All services built successfully
echo.

REM Step 5: Create logs directory
if not exist "%WORKSPACE_ROOT%\logs" mkdir "%WORKSPACE_ROOT%\logs"
echo.

REM Step 6: Start all backend services in background
echo Step 5: Starting all backend microservices...
cd /d "%WORKSPACE_ROOT%"

set JAVA_TOOL_OPTIONS=-Duser.timezone=UTC

for %%S in (chat:8081 excel:8082 mail:8083 slides:8084 suite:8085) do (
    for /f "tokens=1,2 delims=:" %%A in ("%%S") do (
        set SERVICE=%%A
        set PORT=%%B
        set JAR_FILE=apps\%%A\backend\target\darevel-%%A-backend-1.0.0.jar
        
        if exist "!JAR_FILE!" (
            echo Starting !SERVICE! service on port !PORT!...
            start /b java ^
                -DSERVER_PORT=!PORT! ^
                -DDB_HOST=localhost ^
                -DDB_PORT=5432 ^
                -DPOSTGRES_USER=postgres ^
                -DPOSTGRES_PASSWORD=postgres ^
                -DKEYCLOAK_ISSUER=http://localhost:8080/realms/darevel ^
                -jar "!JAR_FILE!" > "logs\!SERVICE!-service.log" 2>&1
        ) else (
            echo WARNING: JAR not found for !SERVICE!: !JAR_FILE!
        )
    )
)
echo OK: All services started (check logs folder for details)
echo.

echo =========================================
echo OK: Darevel Suite is ready!
echo =========================================
echo.
echo Available services:
echo   - Dashboard: http://localhost:3000
echo   - Chat API: http://localhost:8081/api
echo   - Sheet API: http://localhost:8082/api
echo   - Mail API: http://localhost:8083/api
echo   - Slides API: http://localhost:8084/api
echo   - Dashboard API: http://localhost:8085/api
echo   - Keycloak: http://localhost:8080
echo.
pause
