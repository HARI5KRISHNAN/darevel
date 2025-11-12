<#
  Darevel patch script (PowerShell)
  - Finds .env and .env.local recursively
  - Backs up each file to .bak
  - Replaces pilot180 -> darevel and localhost:8080 -> keycloak.darevel.local:8080
  - Deletes itself at end
#>

Write-Host "Running Darevel patch (PowerShell) from $(Get-Location)" -ForegroundColor Cyan

$files = Get-ChildItem -Path . -Recurse -File -Include ".env", ".env.local" -ErrorAction SilentlyContinue

if (-not $files) {
    Write-Host "No .env or .env.local files found. Exiting." -ForegroundColor Yellow
    # self remove
    $self = $MyInvocation.MyCommand.Definition
    Remove-Item -Path $self -Force -ErrorAction SilentlyContinue
    exit 0
}

$patched = 0
foreach ($file in $files) {
    Write-Host "Processing $($file.FullName)" -ForegroundColor Gray
    $text = Get-Content -Raw -Path $file.FullName -ErrorAction Stop
    $orig = $text
    $text = $text -replace "pilot180","darevel"
    $text = $text -replace "localhost:8080","keycloak.darevel.local:8080"
    # replace common issuer / realms patterns
    $text = [regex]::Replace($text, "(https?://)(localhost|127\.0\.0\.1)(:8080)?(/realms/)[^/\s]+", '$1keycloak.darevel.local:8080$4darevel')
    if ($text -ne $orig) {
        Copy-Item -Path $file.FullName -Destination ($file.FullName + ".bak") -Force
        Set-Content -Path $file.FullName -Value $text -Force
        Write-Host "Patched: $($file.FullName)" -ForegroundColor Green
        $patched++
    } else {
        Write-Host "No change: $($file.FullName)" -ForegroundColor Yellow
    }
}

Write-Host "Patched $patched file(s). Backups saved as *.bak" -ForegroundColor Cyan

# Self-delete
$self = $MyInvocation.MyCommand.Definition
Write-Host "Deleting script: $self" -ForegroundColor Gray
Start-Sleep -Seconds 1
Remove-Item -Path $self -Force -ErrorAction SilentlyContinue
