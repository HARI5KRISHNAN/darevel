@echo off
echo === Auth Service Logs (Last 50 lines) ===
docker logs darevel-auth-service --tail 50
echo.
echo.
echo === Chat Service Logs (Last 50 lines) ===
docker logs darevel-chat-service --tail 50
echo.
pause
