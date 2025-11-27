@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   Darevel - Stopping Infrastructure
echo ================================================
echo.

set ROOT_DIR=%~dp0

echo [1/3] Killing all app processes on known ports...

:: Kill frontend processes
for %%p in (3000 3003 3004 3008) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        echo   Killing process on port %%p (PID: %%a)
        taskkill /F /PID %%a >nul 2>&1
    )
)

:: Kill backend processes
for %%p in (8081 8082 8083 8084) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        echo   Killing process on port %%p (PID: %%a)
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo [2/3] Stopping Docker infrastructure...
cd /d "%ROOT_DIR%infrastructure"
docker-compose down

echo.
echo [3/3] Optionally shutting down WSL...
choice /C YN /M "Shutdown WSL to free more memory"
if errorlevel 2 goto skip_wsl
if errorlevel 1 (
    echo Shutting down WSL...
    wsl --shutdown
)
:skip_wsl

echo.
echo ================================================
echo   Infrastructure Stopped!
echo ================================================
echo.
pause
