@echo off
echo ================================================
echo   Darevel - Starting All Services
echo ================================================
echo.

set ROOT_DIR=%~dp0

echo [1/6] Starting Infrastructure (Keycloak + PostgreSQL)...
cd /d "%ROOT_DIR%infrastructure"
docker-compose up -d
echo    Infrastructure started

echo.
echo [2/6] Starting All Application Databases...
cd /d "%ROOT_DIR%apps\slides\backend"
docker-compose -f postgres-compose.yml up -d
echo    - Slides Database started (port 5435)

cd /d "%ROOT_DIR%apps\suite\backend"
docker-compose -f postgres-compose.yml up -d
echo    - Suite Database started (port 5436)

cd /d "%ROOT_DIR%apps\mail\backend"
docker-compose -f postgres-compose.yml up -d
echo    - Mail Database started (port 5437)

cd /d "%ROOT_DIR%apps\sheet\backend"
docker-compose -f postgres-compose.yml up -d
echo    - Sheet Database started (port 5438)

echo.
echo [3/6] Waiting for databases to initialize (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo [4/6] Starting All Backend Services...
cd /d "%ROOT_DIR%apps\slides\backend"
docker-compose up -d --build
echo    - Slides Backend started (port 8084)

cd /d "%ROOT_DIR%apps\suite\backend"
docker-compose up -d --build
echo    - Suite Backend started (port 8085)

cd /d "%ROOT_DIR%apps\mail\backend"
docker-compose up -d --build
echo    - Mail Backend started (port 8086)

cd /d "%ROOT_DIR%apps\sheet\backend"
docker-compose up -d --build
echo    - Sheet Backend started (port 8089)

echo.
echo [5/6] Waiting for backends to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo [6/6] Starting All Frontend Applications...
cd /d "%ROOT_DIR%apps\slides"
start "Slides Frontend" cmd /k "npm run dev"

cd /d "%ROOT_DIR%apps\mail"
start "Mail Frontend" cmd /k "npm run dev"

cd /d "%ROOT_DIR%apps\sheet"
start "Sheet Frontend" cmd /k "npm run dev"

echo.
echo ================================================
echo   All Darevel Services Started!
echo ================================================
echo.
echo   Infrastructure:
echo     - Keycloak:      http://localhost:8180
echo     - Postgres:      localhost:5433 (Keycloak)
echo.
echo   Slides:
echo     - Frontend:      http://localhost:3000
echo     - Backend:       http://localhost:8084
echo     - Database:      localhost:5435
echo.
echo   Suite:
echo     - Backend:       http://localhost:8085
echo     - Database:      localhost:5436
echo.
echo   Mail:
echo     - Frontend:      http://localhost:3008
echo     - Backend:       http://localhost:8086
echo     - Database:      localhost:5437
echo.
echo   Sheet:
echo     - Frontend:      http://localhost:3004
echo     - Backend:       http://localhost:8089
echo     - Database:      localhost:5438
echo.
echo   Login: alice/password or bob/password
echo.
echo   To stop all: Run stop-all.bat
echo.
pause
