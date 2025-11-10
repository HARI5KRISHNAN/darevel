# Darevel Suite - Port Cleanup Script
# Run this if you get "address already in use" errors

Write-Host "Checking for processes using Darevel Suite ports (3000-3007)..." -ForegroundColor Cyan

$ports = 3000..3007

foreach ($port in $ports) {
    $connections = netstat -ano | findstr ":$port"

    if ($connections) {
        Write-Host "`nPort $port is in use:" -ForegroundColor Yellow
        Write-Host $connections

        # Extract PIDs
        $pids = $connections | ForEach-Object {
            if ($_ -match '\s+(\d+)\s*$') {
                $matches[1]
            }
        } | Select-Object -Unique

        foreach ($pid in $pids) {
            if ($pid) {
                Write-Host "  Killing process $pid..." -ForegroundColor Red
                taskkill /PID $pid /F 2>&1 | Out-Null
            }
        }

        Write-Host "  Port $port cleared!" -ForegroundColor Green
    }
}

Write-Host "`nAll Darevel Suite ports are now free!" -ForegroundColor Green
Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
