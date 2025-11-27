@echo off
REM Reset Keycloak realm data to force fresh import

echo Stopping Keycloak container...
docker stop darevel-keycloak 2>nul

echo Removing Keycloak container...
docker rm darevel-keycloak 2>nul

echo Connecting to PostgreSQL and dropping Keycloak database...
docker exec darevel-postgres psql -U postgres -c "DROP DATABASE IF EXISTS keycloak;"
docker exec darevel-postgres psql -U postgres -c "CREATE DATABASE keycloak;"

echo Restarting infrastructure...
cd /d "%~dp0"
docker-compose up -d

echo Waiting for Keycloak to start (60 seconds)...
timeout /t 60 /nobreak

echo.
echo ================================================
echo Keycloak has been reset!
echo ================================================
echo The darevel realm should now be imported fresh.
echo.
echo Access Keycloak Admin Console at: http://localhost:8180
echo Admin credentials: admin / admin
echo.
echo You can now restart your apps.
echo ================================================
pause
