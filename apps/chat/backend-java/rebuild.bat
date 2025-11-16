@echo off
echo === Rebuilding Java Backend Services ===
echo.

echo Stopping all services...
docker-compose down
echo.

echo Rebuilding all images with latest code...
docker-compose build
echo.

echo Starting services...
docker-compose up -d
echo.

echo Waiting for services to start (20 seconds)...
timeout /t 20 /nobreak
echo.

echo Testing Auth Service...
curl http://localhost:8081/api/auth/users/1
echo.
echo.

echo Testing Chat Service...
curl -X POST http://localhost:8082/api/chat/general/messages -H "Content-Type: application/json" -d "{\"userId\": 1, \"content\": \"Test message after rebuild\"}"
echo.
echo.

echo === Rebuild Complete ===
echo If you still see errors, check the logs with: docker logs darevel-auth-service
pause
