@echo off
echo ================================================
echo   Darevel - Stopping Sheet App
echo ================================================
echo.

set ROOT_DIR=%~dp0

echo Stopping Sheet Backend...
cd /d "%ROOT_DIR%apps\sheet\backend"
docker-compose down

echo Stopping Sheet Database...
docker-compose -f postgres-compose.yml down

echo Killing Sheet Frontend (port 3004)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3004 ^| findstr LISTENING 2^>nul') do (
    echo   Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo   Sheet App Stopped!
echo.
pause
