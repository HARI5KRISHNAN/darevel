# PowerShell script to configure hosts file for Darevel Suite
# Run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Darevel Suite - Hosts File Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell" -ForegroundColor Yellow
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$hostsBackup = "$env:SystemRoot\System32\drivers\etc\hosts.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "Creating backup of hosts file..." -ForegroundColor Yellow
Copy-Item $hostsPath $hostsBackup
Write-Host "Backup created: $hostsBackup" -ForegroundColor Green
Write-Host ""

# Darevel domains to add
$domains = @(
    "suite.darevel.local",
    "auth.darevel.local",
    "mail.darevel.local",
    "chat.darevel.local",
    "excel.darevel.local",
    "slides.darevel.local",
    "drive.darevel.local",
    "notify.darevel.local"
)

Write-Host "Checking existing hosts file..." -ForegroundColor Yellow
$hostsContent = Get-Content $hostsPath

# Check if Darevel entries already exist
$existingEntries = $hostsContent | Where-Object { $_ -match "darevel.local" }

if ($existingEntries) {
    Write-Host ""
    Write-Host "Found existing Darevel entries:" -ForegroundColor Yellow
    $existingEntries | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host ""
    $overwrite = Read-Host "Do you want to overwrite them? (y/n)"

    if ($overwrite -ne "y") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }

    # Remove existing Darevel entries
    Write-Host "Removing existing Darevel entries..." -ForegroundColor Yellow
    $hostsContent = $hostsContent | Where-Object { $_ -notmatch "darevel.local" }
}

Write-Host ""
Write-Host "Adding Darevel Suite domains..." -ForegroundColor Yellow
Write-Host ""

# Add header comment
$newEntries = @()
$newEntries += ""
$newEntries += "# Darevel Suite - Local Development"
$newEntries += "# Added on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Add each domain
foreach ($domain in $domains) {
    $entry = "127.0.0.1 $domain"
    $newEntries += $entry
    Write-Host "  + $entry" -ForegroundColor Green
}

# Combine and save
$finalContent = $hostsContent + $newEntries
Set-Content -Path $hostsPath -Value $finalContent -Force

Write-Host ""
Write-Host "Flushing DNS cache..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SUCCESS! Hosts file configured." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Testing DNS resolution..." -ForegroundColor Yellow
Write-Host ""

foreach ($domain in $domains) {
    try {
        $result = Test-Connection -ComputerName $domain -Count 1 -Quiet
        if ($result) {
            Write-Host "  OK  $domain" -ForegroundColor Green
        } else {
            Write-Host "  FAIL $domain" -ForegroundColor Red
        }
    } catch {
        Write-Host "  FAIL $domain" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your development server: npm run dev" -ForegroundColor White
Write-Host "2. Visit: http://suite.darevel.local:3000" -ForegroundColor White
Write-Host "3. You'll be redirected to: http://auth.darevel.local:3005/signin" -ForegroundColor White
Write-Host "4. Login with: demo@darevel.com / demo123" -ForegroundColor White
Write-Host ""
Write-Host "All Darevel apps:" -ForegroundColor Cyan
Write-Host "  Suite:  http://suite.darevel.local:3000" -ForegroundColor White
Write-Host "  Auth:   http://auth.darevel.local:3005" -ForegroundColor White
Write-Host "  Mail:   http://mail.darevel.local:3003" -ForegroundColor White
Write-Host "  Chat:   http://chat.darevel.local:3002" -ForegroundColor White
Write-Host "  Excel:  http://excel.darevel.local:3004" -ForegroundColor White
Write-Host "  Slides: http://slides.darevel.local:3001" -ForegroundColor White
Write-Host "  Drive:  http://drive.darevel.local:3006" -ForegroundColor White
Write-Host "  Notify: http://notify.darevel.local:3007" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
