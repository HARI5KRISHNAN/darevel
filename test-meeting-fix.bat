@echo off
REM Quick test script for meeting scheduling fix

echo ========================================
echo Testing Meeting Scheduling Fix
echo ========================================
echo.

echo [1/4] Checking if PostgreSQL is running...
docker ps | findstr postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL is running
) else (
    echo ✗ PostgreSQL is not running
    echo   Run: start-infrastructure.bat
    exit /b 1
)
echo.

echo [2/4] Checking Chat Backend (port 8081)...
curl -s http://localhost:8081/actuator/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Chat Backend is running on port 8081
) else (
    echo ✗ Chat Backend is not running
    echo   Run: start-chat.bat
    exit /b 1
)
echo.

echo [3/4] Testing Meeting API Endpoint...
curl -X POST http://localhost:8081/api/meetings ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Test Meeting\",\"startTime\":\"2025-11-25T10:00:00Z\",\"endTime\":\"2025-11-25T11:00:00Z\",\"participantEmails\":[\"test@example.com\"]}" ^
  2>nul
echo.
if %errorlevel% equ 0 (
    echo ✓ Meeting API is responding
) else (
    echo ✗ Meeting API request failed
)
echo.

echo [4/4] Checking Frontend (port 3003)...
curl -s http://localhost:3003 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Chat Frontend is running on port 3003
) else (
    echo ✗ Chat Frontend is not running
    echo   Run: start-chat.bat
)
echo.

echo ========================================
echo Test Complete!
echo.
echo Next steps:
echo 1. Open http://localhost:3003 in browser
echo 2. Try creating a meeting via the UI
echo 3. Check the response and console logs
echo.
echo For detailed setup, see: MEETING_SCHEDULING_FIX.md
echo ========================================
pause
