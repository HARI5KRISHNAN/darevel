@echo off
echo ================================================
echo   Darevel - Stopping Mail App
echo ================================================
echo.

set ROOT_DIR=%~dp0

echo Stopping Mail Backend...
cd /d "%ROOT_DIR%apps\mail\backend"
docker-compose down

echo Stopping Mail Database...
docker-compose -f postgres-compose.yml down

echo Killing Mail Frontend (port 3008)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3008 ^| findstr LISTENING 2^>nul') do (
    echo   Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo   Mail App Stopped!
echo.
pause
