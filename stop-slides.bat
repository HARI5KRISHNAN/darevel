@echo off
echo ================================================
echo   Darevel - Stopping Slides App
echo ================================================
echo.

set ROOT_DIR=%~dp0

echo Stopping Slides Backend...
cd /d "%ROOT_DIR%apps\slides\backend"
docker-compose down

echo Stopping Slides Database...
docker-compose -f postgres-compose.yml down

echo Killing Slides Frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo   Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo   Slides App Stopped!
echo.
pause
