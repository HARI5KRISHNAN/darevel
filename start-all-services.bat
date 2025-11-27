@echo off
echo ================================================
echo   Darevel - Starting All Services
echo ================================================

echo.
echo [1/4] Creating databases...
docker exec darevel-postgres psql -U postgres -c "CREATE DATABASE darevel_chat;" 2>nul
docker exec darevel-postgres psql -U postgres -c "CREATE DATABASE darevel_slides;" 2>nul
docker exec darevel-postgres psql -U postgres -c "CREATE DATABASE darevel_suite;" 2>nul
docker exec darevel-postgres psql -U postgres -c "CREATE DATABASE darevel_mail;" 2>nul
docker exec darevel-postgres psql -U postgres -c "CREATE DATABASE darevel_sheet;" 2>nul
echo    Databases created (or already exist)

echo.
echo [2/4] Starting Slides Service (Port 8084)...
cd "%~dp0apps\slides\backend"
docker-compose up -d --build
echo    Slides service starting...

echo.
echo [3/4] Starting Suite Service (Port 8085)...
cd "%~dp0apps\suite\backend"
docker-compose up -d --build
echo    Suite service starting...

echo.
echo [4/4] Waiting for services to be ready...
timeout /t 20 /nobreak >nul

echo.
echo ================================================
echo   All Services Started!
echo ================================================
echo.
echo   Infrastructure:
echo   - Keycloak:     http://localhost:8180
echo   - PostgreSQL:   localhost:5432 (apps)
echo   - PostgreSQL:   localhost:5433 (keycloak)
echo.
echo   Backend Services:
echo   - Slides:       http://localhost:8084
echo   - Suite:        http://localhost:8085
echo.
echo Checking health...
echo.
curl -s http://localhost:8084/api/health
echo.
curl -s http://localhost:8085/api/health
echo.
echo.
echo ================================================
echo   Ready for testing!
echo ================================================
echo.
pause
