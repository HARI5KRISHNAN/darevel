@echo off
echo ================================================
echo   Stopping Jitsi Meet
echo ================================================
echo.

cd /d "%~dp0apps\shared\jitsi"

echo Stopping Jitsi containers...
docker-compose down

echo.
echo ================================================
echo   Jitsi Meet Stopped!
echo ================================================
echo.
pause
