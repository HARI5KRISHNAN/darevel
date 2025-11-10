# Quick hosts file configuration
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$backupPath = "C:\Windows\System32\drivers\etc\hosts.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "Backing up hosts file..." -ForegroundColor Yellow
Copy-Item $hostsPath $backupPath
Write-Host "Backup created: $backupPath" -ForegroundColor Green

Write-Host "`nAdding Darevel domains..." -ForegroundColor Yellow

$entries = @"

# Darevel Suite - Local Development
# Added on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
127.0.0.1 suite.darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 notify.darevel.local
"@

Add-Content -Path $hostsPath -Value $entries

Write-Host "Domains added successfully!" -ForegroundColor Green

Write-Host "`nFlushing DNS cache..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "SUCCESS! DNS configured." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nYou can now visit: http://suite.darevel.local:3000" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to close"
