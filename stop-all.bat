@echo off
echo ================================================
echo   Darevel - Stopping All Services
echo ================================================
echo.

set ROOT_DIR=%~dp0

echo [1/4] Stopping All Backend Services...
cd /d "%ROOT_DIR%apps\slides\backend"
docker-compose down
echo    - Slides Backend stopped

cd /d "%ROOT_DIR%apps\suite\backend"
docker-compose down
echo    - Suite Backend stopped

cd /d "%ROOT_DIR%apps\mail\backend"
docker-compose down
echo    - Mail Backend stopped

cd /d "%ROOT_DIR%apps\sheet\backend"
docker-compose down
echo    - Sheet Backend stopped

echo.
echo [2/4] Stopping All Application Databases...
cd /d "%ROOT_DIR%apps\slides\backend"
docker-compose -f postgres-compose.yml down
echo    - Slides Database stopped

cd /d "%ROOT_DIR%apps\suite\backend"
docker-compose -f postgres-compose.yml down
echo    - Suite Database stopped

cd /d "%ROOT_DIR%apps\mail\backend"
docker-compose -f postgres-compose.yml down
echo    - Mail Database stopped

cd /d "%ROOT_DIR%apps\sheet\backend"
docker-compose -f postgres-compose.yml down
echo    - Sheet Database stopped

echo.
echo [3/4] Stopping Infrastructure...
cd /d "%ROOT_DIR%infrastructure"
docker-compose down
echo    - Infrastructure stopped

echo.
echo [4/4] Stopping All Frontend Applications...
echo Killing Frontend processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3004 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3008 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
echo    - All frontends stopped

echo.
echo ================================================
echo   All Darevel Services Stopped!
echo ================================================
echo.
pause
