<#
.SYNOPSIS
  Reset & deploy minimal Darevel local stack (Postgres + Keycloak + Nginx)
  Writes nginx configs and docker-compose.yml, starts containers and imports realm if present.

.NOTES
  - Run as Administrator.
  - Place optional darevel-realm.json in the same folder to auto-import it.
#>

# -------------------------
# Configuration (edit if needed)
# -------------------------
$ProjectRoot      = Split-Path -Parent $MyInvocation.MyCommand.Definition
$NginxDir         = Join-Path $ProjectRoot 'nginx'
$NginxConfDir     = Join-Path $NginxDir 'conf.d'
$DockerComposeYml = Join-Path $ProjectRoot 'docker-compose.yml'
$RealmFileLocal   = Join-Path $ProjectRoot 'darevel-realm.json'   # optional, will be imported if present
$TimeoutSeconds   = 240                # max wait for containers to become healthy / running
$KeycloakName     = 'darevel_keycloak'
$NginxName        = 'darevel_nginx'
$PostgresName     = 'darevel_postgres'

# -------------------------
# Helper functions
# -------------------------
function Assert-Admin {
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Write-Error "This script must be run as Administrator. Right-click PowerShell -> Run as Administrator and re-run."
        exit 1
    }
}

function Write-Header($text) {
    Write-Host "`n========================================"
    Write-Host $text
    Write-Host "========================================`n"
}

function Write-Info($m) { Write-Host "[INFO]  $m" -ForegroundColor Cyan }
function Write-Warn($m) { Write-Host "[WARN]  $m" -ForegroundColor Yellow }
function Write-Err($m)  { Write-Host "[ERROR] $m" -ForegroundColor Red }

function Wait-For-ContainerRunning($name, $timeoutSec) {
    $start = Get-Date
    while ((Get-Date) - $start).TotalSeconds -lt $timeoutSec {
        try {
            $running = & docker inspect -f '{{.State.Running}}' $name 2>$null
            if ($LASTEXITCODE -eq 0 -and $running -eq 'true') {
                Write-Info "Container '$name' is running."
                return $true
            }
        } catch { }
        Start-Sleep -Seconds 2
    }
    Write-Warn "Timeout waiting for container '$name' to run (waited $timeoutSec s)."
    return $false
}

function Wait-For-ContainerHealthy($name, $timeoutSec) {
    $start = Get-Date
    while ((Get-Date) - $start).TotalSeconds -lt $timeoutSec {
        try {
            $state = & docker inspect -f '{{.State.Health.Status}}' $name 2>$null
            if ($LASTEXITCODE -eq 0 -and $state -eq 'healthy') {
                Write-Info "Container '$name' is healthy."
                return $true
            }
            # If no healthcheck, fallback to running check
            $running = & docker inspect -f '{{.State.Running}}' $name 2>$null
            if ($LASTEXITCODE -eq 0 -and $running -eq 'true') {
                Write-Info "Container '$name' is running (no healthcheck)."
                return $true
            }
        } catch { }
        Start-Sleep -Seconds 2
    }
    Write-Warn "Timeout waiting for container '$name' to become healthy (waited $timeoutSec s)."
    return $false
}

# -------------------------
# Validate environment
# -------------------------
Write-Header "Darevel: Reset & Deploy (Option 2 - minimal stack, realm import enabled)"
Assert-Admin

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Err "Docker CLI not found. Install Docker Desktop and ensure 'docker' command is available in PATH."
    exit 1
}

# Create nginx directories
if (-not (Test-Path $NginxConfDir)) {
    New-Item -ItemType Directory -Path $NginxConfDir -Force | Out-Null
    Write-Info "Created directory: $NginxConfDir"
} else {
    Write-Info "Using existing directory: $NginxConfDir"
}

# -------------------------
# Write nginx/conf.d/default.conf (single-quoted here-string to avoid PowerShell variable expansion)
# -------------------------
$defaultConfPath = Join-Path $NginxConfDir 'default.conf'
$defaultConfContent = @'
# === Keycloak reverse proxy ===
server {
    listen 80;
    server_name keycloak.darevel.local;

    location / {
        proxy_pass http://darevel_keycloak:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# === Subdomain ??? App port mapping ===
map $host $app_port {
    suite.darevel.local     3002;
    auth.darevel.local      3005;
    chat.darevel.local      3003;
    excel.darevel.local     3004;
    drive.darevel.local     3006;
    notify.darevel.local    3007;
    mail.darevel.local      3008;
    slides.darevel.local    3000;
    status.darevel.local    3010;
    default                 3000;
}

server {
    listen 80;
    server_name ~^(?<subdomain>suite|auth|chat|excel|drive|notify|mail|slides|status)\.darevel\.local$;

    # host app runs on host; inside container use host.docker.internal (Docker Desktop feature)
    set $backend host.docker.internal;

    location / {
        proxy_pass http://$backend:$app_port;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 90;
    }
}

# Root redirect
server {
    listen 80;
    server_name darevel.local;
    return 302 http://suite.darevel.local;
}

server {
    listen 80 default_server;
    return 404;
}
'@

# Write as ASCII (avoids BOM characters that broke nginx before)
try {
    $defaultConfContent | Out-File -FilePath $defaultConfPath -Encoding Ascii -Force
    Write-Info "Wrote: $defaultConfPath (ASCII)"
} catch {
    Write-Err "Failed writing $defaultConfPath: $_"
    exit 1
}

# -------------------------
# Write nginx/nginx.conf (simple wrapper - single-quoted here-string)
# -------------------------
$nginxConfPath = Join-Path $NginxDir 'nginx.conf'
$nginxConfContent = @'
worker_processes auto;

error_log /var/log/nginx/error.log warn;
pid       /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout 65;

    resolver 127.0.0.11 ipv6=off;

    include /etc/nginx/conf.d/*.conf;
}
'@

try {
    $nginxConfContent | Out-File -FilePath $nginxConfPath -Encoding Ascii -Force
    Write-Info "Wrote: $nginxConfPath (ASCII)"
} catch {
    Write-Err "Failed writing $nginxConfPath: $_"
    exit 1
}

# -------------------------
# Write docker-compose.yml (exact requested content; variables expanded)
# -------------------------
$composeContent = @"
services:
  postgres:
    image: postgres:15
    container_name: $PostgresName
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: keycloak
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: [""CMD"", ""pg_isready"", ""-U"", ""keycloak"", ""-d"", ""keycloak""]
      interval: 5s
      timeout: 5s
      retries: 20
    ports:
      - ""5432:5432""

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: $KeycloakName
    command: start-dev --http-enabled=true
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL_HOST: postgres
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - ""8080:8080""

  nginx:
    image: nginx:1.25
    container_name: $NginxName
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - ""80:80""
    depends_on:
      - keycloak

volumes:
  postgres_data:
"@

try {
    $composeContent | Out-File -FilePath $DockerComposeYml -Encoding Utf8 -Force
    Write-Info "Wrote docker-compose: $DockerComposeYml (UTF8)"
} catch {
    Write-Err "Failed writing $DockerComposeYml: $_"
    exit 1
}

# -------------------------
# Docker: Tear down and bring up
# -------------------------
Write-Header "Docker compose: down -> up (recreate)"
Push-Location $ProjectRoot

try {
    Write-Info "Stopping any existing compose stack..."
    & docker compose down -v 2>&1 | Write-Host
} catch {
    Write-Warn "docker compose down returned an error (continuing)."
}

Write-Info "Pruning unused networks and volumes (non-destructive to named volumes used elsewhere)..."
& docker network prune -f | Out-Null
& docker volume prune -f | Out-Null

Write-Info "Starting fresh with docker compose up -d --build"
$up = & docker compose up -d --build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "docker compose up failed:`n$up"
    Pop-Location
    exit 2
}
Write-Info "Docker compose started."

# Give containers a few seconds
Start-Sleep -Seconds 5

# Validate nginx configuration inside container (best-effort; container may restart if config invalid)
Write-Info "Testing nginx config inside container (nginx -t)..."
try {
    & docker exec $NginxName nginx -t 2>&1 | Write-Host
} catch {
    Write-Warn "Unable to run nginx -t inside container (container may not be up): $_"
}

# -------------------------
# Wait for Keycloak container to be running/healthy
# -------------------------
Write-Header "Waiting for Keycloak container to be running"
$okRun = Wait-For-ContainerRunning -name $KeycloakName -timeoutSec $TimeoutSeconds
if (-not $okRun) {
    Write-Warn "Keycloak container failed to start. Check 'docker logs $KeycloakName'."
} else {
    Write-Info "Keycloak container is running. Waiting for healthy state (if healthcheck available)..."
    Wait-For-ContainerHealthy -name $KeycloakName -timeoutSec $TimeoutSeconds | Out-Null
}

# -------------------------
# Import realm if present
# -------------------------
if (Test-Path $RealmFileLocal) {
    Write-Header "Importing realm from $RealmFileLocal into Keycloak"

    Write-Info "Copying $RealmFileLocal -> $KeycloakName:/tmp/darevel-realm.json"
    & docker cp $RealmFileLocal "$KeycloakName:/tmp/darevel-realm.json"
    if ($LASTEXITCODE -ne 0) {
        Write-Err "docker cp failed. Aborting realm import."
    } else {
        Write-Info "Configuring kcadm credentials..."
        # use sh -c with single quotes so PowerShell does not expand pipes or characters
        & docker exec -i $KeycloakName sh -c '/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin' 2>&1 | Write-Host

        Write-Info 'Deleting existing realm named "darevel" (if exists)...'
        # ignore non-zero from delete
        & docker exec -i $KeycloakName sh -c '/opt/keycloak/bin/kcadm.sh delete realms/darevel || true' 2>&1 | Write-Host

        Write-Info "Creating new realm from uploaded JSON..."
        & docker exec -i $KeycloakName sh -c '/opt/keycloak/bin/kcadm.sh create realms -f /tmp/darevel-realm.json' 2>&1 | Write-Host

        if ($LASTEXITCODE -eq 0) {
            Write-Info "Realm import attempted. Please open Keycloak admin console to verify clients, redirectUris and web origins."
        } else {
            Write-Warn "Realm import reported a non-zero exit code; check container logs and kcadm output above."
        }
    }
} else {
    Write-Warn "No realm JSON found at $RealmFileLocal. Skipping realm import."
}

# -------------------------
# Quick connectivity tests
# -------------------------
Write-Header "Quick connectivity checks (from inside nginx container)"
Write-Info "Testing Keycloak via nginx proxy (http://keycloak.darevel.local):"
& docker exec $NginxName sh -c "curl -I --max-time 5 http://keycloak.darevel.local || echo CURL_FAIL" 2>&1 | Write-Host

Write-Header "Done"
Write-Host "Next steps:"
Write-Host "- Open browser to: http://suite.darevel.local and http://keycloak.darevel.local"
Write-Host "- Default Keycloak admin credentials (dev only): admin / admin"
Write-Host "- If logins redirect back to Keycloak admin UI, verify client redirectUris and web origins inside Keycloak admin (realm 'darevel')."
Write-Host "- If host.docker.internal does not resolve in your environment, edit nginx/conf.d/default.conf to replace host.docker.internal with your Windows host IP (e.g. 192.168.29.101) and re-run."
Pop-Location

