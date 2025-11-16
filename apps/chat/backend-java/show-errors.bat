@echo off
echo === Checking Auth Service Error Logs ===
docker logs darevel-auth-service --tail 100 2>&1 | findstr /C:"Exception" /C:"Error" /C:"ERROR" /C:"Caused by"
echo.
echo.

echo === Checking Chat Service Error Logs ===
docker logs darevel-chat-service --tail 100 2>&1 | findstr /C:"Exception" /C:"Error" /C:"ERROR" /C:"Caused by"
echo.
echo.

echo === Full Auth Service Logs (Last 30 lines) ===
docker logs darevel-auth-service --tail 30
echo.
echo.

echo === Full Chat Service Logs (Last 30 lines) ===
docker logs darevel-chat-service --tail 30

pause
