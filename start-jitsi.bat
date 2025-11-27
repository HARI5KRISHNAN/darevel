@echo off
echo ================================================
echo   Starting Jitsi Meet (Self-Hosted with JWT Auth)
echo   URL: http://localhost:8000
echo ================================================
echo.

cd /d "%~dp0apps\shared\jitsi"

echo [1/2] Starting Jitsi containers...
docker-compose up -d

echo.
echo [2/2] Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo ================================================
echo   Jitsi Meet Started with Keycloak JWT Auth!
echo ================================================
echo.
echo   Web Interface: http://localhost:8000
echo   JWT App ID:    darevel
echo   Auth Type:     JWT (Keycloak SSO)
echo.
echo   Authentication Flow:
echo   1. User logs in via Keycloak SSO
echo   2. Frontend requests JWT from chat-service (port 8081)
echo   3. JWT token is passed to Jitsi for authentication
echo.
echo   Note: Direct access to http://localhost:8000 will
echo   require JWT authentication. Use the app to join calls.
echo.
echo   To stop: run stop-jitsi.bat or docker-compose down
echo.
pause
