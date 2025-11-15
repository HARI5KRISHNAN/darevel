<#
.SYNOPSIS
  Minimal Darevel redeploy script.
  Does NOT write docker-compose.yml or nginx files.
  Only controls containers.

.REQUIREMENTS
  - docker-compose.yml already exists and is correct
  - nginx.conf + conf.d/default.conf already exist and mounted correctly
  - Run in normal PowerShell (Admin NOT required)
#>

Write-Host "`n=== Darevel Minimal Reset & Deploy ===`n"

function Write-Info($msg) { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Container names
$KeycloakName = "darevel_keycloak"
$NginxName    = "darevel_nginx"
$PostgresName = "darevel_postgres"

# Wait for container to be running
function Wait-Running($name, $timeout) {
    $start = Get-Date
    while (((Get-Date) - $start).TotalSeconds -lt $timeout) {
        $running = docker inspect -f '{{.State.Running}}' $name 2>$null
        if ($running -eq "true") {
            Write-Info "Container '$name' is running."
            return $true
        }
        Start-Sleep -Seconds 2
    }
    Write-Warn "Timeout waiting for '$name' to run."
    return $false
}

Write-Info "Stopping existing compose stack..."
docker compose down -v 2>&1 | Write-Host

Write-Info "Pruning unused networks..."
docker network prune -f | Out-Null

Write-Info "Starting compose stack..."
$up = docker compose up -d 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "docker compose up failed:`n$up"
    exit 1
}

Write-Info "Waiting for Keycloak container..."
$ok = Wait-Running $KeycloakName 180
if (-not $ok) {
    Write-Warn "Keycloak didn't start. Check logs: docker logs $KeycloakName"
} else {
    Write-Info "Keycloak running at http://localhost:8080 and http://keycloak.darevel.local"
}

Write-Info "Validating nginx config..."
docker exec $NginxName nginx -t 2>&1 | Write-Host

Write-Host "`nDone."
Write-Host "Open:"
Write-Host " - http://suite.darevel.local"
Write-Host " - http://keycloak.darevel.local"
Write-Host "`n"
