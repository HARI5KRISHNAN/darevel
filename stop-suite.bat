@echo off
echo ================================================
echo   Darevel - Stopping Suite/Dashboard
echo ================================================
echo.

set ROOT_DIR=%~dp0

echo Stopping Suite Backend...
cd /d "%ROOT_DIR%apps\suite\backend"
docker-compose down

echo Stopping Suite Database...
docker-compose -f postgres-compose.yml down

echo.
echo ================================================
echo   Suite/Dashboard Stopped
echo ================================================
echo.
pause
