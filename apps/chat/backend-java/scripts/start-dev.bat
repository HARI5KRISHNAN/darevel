@echo off
setlocal EnableDelayedExpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     Darevel Chat - Java Backend Development Setup     ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is running
echo [33m🔍 Checking Docker...[0m
docker info >nul 2>&1
if errorlevel 1 (
    echo [31m❌ Docker is not running. Please start Docker Desktop and try again.[0m
    pause
    exit /b 1
)
echo [32m✅ Docker is running[0m
echo.

REM Check if Maven is installed
echo [33m🔍 Checking Maven...[0m
where mvn >nul 2>&1
if errorlevel 1 (
    echo [31m❌ Maven is not installed. Please install Maven 3.6+ and try again.[0m
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('mvn -v ^| findstr /r "Apache Maven"') do set MAVEN_VERSION=%%i
echo [32m✅ %MAVEN_VERSION%[0m
echo.

REM Check if Java is installed
echo [33m🔍 Checking Java...[0m
where java >nul 2>&1
if errorlevel 1 (
    echo [31m❌ Java is not installed. Please install Java 17+ and try again.[0m
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('java -version 2^>^&1 ^| findstr /r "version"') do (
    set JAVA_VERSION=%%i
    goto :java_found
)
:java_found
echo [32m✅ %JAVA_VERSION%[0m
echo.

REM Choose development mode
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Choose your development mode:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   [32m1)[0m Docker Compose (Recommended - All services in containers)
echo   [32m2)[0m Local Development (PostgreSQL in Docker, services run locally)
echo.
set /p option="Select option (1 or 2): "
echo.

if "%option%"=="1" (
    echo [33m🐳 Starting services with Docker Compose...[0m
    echo.

    REM Check if services are already running
    docker-compose ps 2>nul | findstr "Up" >nul
    if not errorlevel 1 (
        echo [33m⚠️  Services are already running. Stopping them first...[0m
        docker-compose down
        echo.
    )

    REM Build and start services
    echo [33m📦 Building Docker images...[0m
    docker-compose build
    echo.

    echo [33m🚀 Starting all services...[0m
    docker-compose up -d
    echo.

    REM Wait for services
    echo [33m⏳ Waiting for services to be healthy...[0m
    timeout /t 10 /nobreak >nul
    echo.

    echo [32m✅ All services started![0m
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo [32m  Services are now running:[0m
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo   🔐 Auth Service:        [32mhttp://localhost:8081[0m
    echo   💬 Chat Service:        [32mhttp://localhost:8082[0m
    echo   🔑 Permissions Service: [32mhttp://localhost:8083[0m
    echo   🗄️  PostgreSQL:          [32mlocalhost:5432[0m
    echo   📊 Prometheus:          [32mhttp://localhost:9090[0m
    echo   📈 Grafana:             [32mhttp://localhost:3001[0m ^(admin/admin^)
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo [33m📝 Useful commands:[0m
    echo   - View logs:          [36mdocker-compose logs -f[0m
    echo   - View specific logs: [36mdocker-compose logs -f auth-service[0m
    echo   - Stop services:      [36mdocker-compose down[0m
    echo   - Restart services:   [36mdocker-compose restart[0m
    echo.

) else if "%option%"=="2" (
    echo [33m🛠️  Starting Local Development Mode...[0m
    echo.

    REM Start PostgreSQL
    echo [33m🐘 Starting PostgreSQL...[0m
    docker ps -a | findstr "darevel-postgres" >nul
    if not errorlevel 1 (
        docker start darevel-postgres >nul 2>&1
    ) else (
        docker run -d --name darevel-postgres -e POSTGRES_USER=darevel_chat -e POSTGRES_PASSWORD=darevel_chat123 -e POSTGRES_DB=darevel_chat -p 5432:5432 postgres:15-alpine
    )
    echo.

    REM Wait for PostgreSQL
    echo [33m⏳ Waiting for PostgreSQL to be ready...[0m
    set count=0
    :wait_loop
    docker exec darevel-postgres pg_isready -U darevel_chat >nul 2>&1
    if not errorlevel 1 goto postgres_ready
    set /a count+=1
    if %count% GEQ 30 (
        echo [31m❌ PostgreSQL failed to start[0m
        pause
        exit /b 1
    )
    timeout /t 1 /nobreak >nul
    echo .
    goto wait_loop

    :postgres_ready
    echo [32m✅ PostgreSQL is ready![0m
    echo.

    REM Build services
    echo [33m🔨 Building all services...[0m
    call mvn clean install -DskipTests
    echo.

    echo [32m✅ Services built successfully![0m
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo [33m  Starting services in separate terminals...[0m
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo [33mOpening terminals for each service...[0m
    echo.

    REM Start each service in a new window
    start "Auth Service" cmd /k "cd auth-service && mvn spring-boot:run"
    timeout /t 2 /nobreak >nul
    start "Chat Service" cmd /k "cd chat-service && mvn spring-boot:run"
    timeout /t 2 /nobreak >nul
    start "Permissions Service" cmd /k "cd permissions-service && mvn spring-boot:run"

    echo [32m✅ All services are starting in separate windows![0m
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo [33m📝 Services will be available at:[0m
    echo   - Auth Service:        [32mhttp://localhost:8081[0m
    echo   - Chat Service:        [32mhttp://localhost:8082[0m
    echo   - Permissions Service: [32mhttp://localhost:8083[0m
    echo.

) else (
    echo [31m❌ Invalid option. Please run the script again and choose 1 or 2.[0m
    pause
    exit /b 1
)

pause
