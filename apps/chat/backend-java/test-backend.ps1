# Test script for Java backend (PowerShell)

Write-Host "=== Testing Java Backend ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Testing Auth Service Health:" -ForegroundColor Yellow
curl.exe -s http://localhost:8081/actuator/health
Write-Host "`n"

Write-Host "2. Checking if users exist:" -ForegroundColor Yellow
curl.exe -s http://localhost:8081/api/auth/users
Write-Host "`n"

Write-Host "3. Testing user registration:" -ForegroundColor Yellow
$registerBody = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8081/api/auth/register `
    -Method POST `
    -ContentType "application/json" `
    -Body $registerBody
Write-Host "`n"

Write-Host "4. Testing message send (with user ID 1):" -ForegroundColor Yellow
$messageBody = @{
    userId = 1
    content = "Test message from PowerShell"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8082/api/chat/general/messages `
    -Method POST `
    -ContentType "application/json" `
    -Body $messageBody
Write-Host "`n"

Write-Host "5. Fetching messages:" -ForegroundColor Yellow
Invoke-RestMethod -Uri http://localhost:8082/api/chat/general/messages
Write-Host "`n"

Write-Host "=== Test Complete ===" -ForegroundColor Green
