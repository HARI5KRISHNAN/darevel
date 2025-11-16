@echo off
echo === Debugging Chat Backend ===
echo.

echo 1. Check if Auth Service is running:
curl -s http://localhost:8081/actuator/health
echo.
echo.

echo 2. List all registered users:
curl -s http://localhost:8081/api/auth/users
echo.
echo.

echo 3. Try to send a test message with userId 1:
curl -s -X POST http://localhost:8082/api/chat/test-channel/messages ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\": 1, \"content\": \"Test message\"}"
echo.
echo.

echo 4. Check Chat Service logs for errors
echo Please check the terminal where you ran "npm run dev" for error messages
echo.

pause
