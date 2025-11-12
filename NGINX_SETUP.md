# Nginx Reverse Proxy Setup for Darevel Suite

Complete guide to configuring Nginx reverse proxy for all Darevel apps with proper domain-based routing.

## Overview

The Nginx configuration provides:
- ✅ Fixed 502 Bad Gateway errors
- ✅ Resolved Keycloak 1-second refresh loop
- ✅ Proper routing for all 8 Darevel apps
- ✅ WebSocket support for Next.js Hot Module Replacement
- ✅ Unified `.darevel.local` domain structure

## Architecture

```
Browser Request (*.darevel.local)
         ↓
    Nginx Container (port 80)
         ↓
    ┌────────────────────────────────┐
    │  Domain-based routing:         │
    │  - suite.darevel.local → :3002 │
    │  - auth.darevel.local → :3005  │
    │  - keycloak.darevel.local → :8080 │
    │  - api.darevel.local → :8081   │
    │  - etc.                        │
    └────────────────────────────────┘
         ↓
    Backend Services (Next.js apps, Keycloak, Spring Boot)
```

## Configuration Files

### 1. Main Configuration: `nginx/nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Include modular configuration files
    include /etc/nginx/conf.d/*.conf;
}
```

### 2. App Routing: `nginx/conf.d/darevel.conf`

Contains server blocks for all 8 apps + Keycloak + API Gateway.

## Domain to Port Mapping

| Domain                      | Backend                          | Port |
| --------------------------- | -------------------------------- | ---- |
| suite.darevel.local         | Next.js Frontend                 | 3002 |
| auth.darevel.local          | Next.js Frontend                 | 3005 |
| chat.darevel.local          | Next.js Frontend                 | 3003 |
| drive.darevel.local         | Next.js Frontend                 | 3006 |
| excel.darevel.local         | Next.js Frontend                 | 3004 |
| notify.darevel.local        | Next.js Frontend                 | 3007 |
| mail.darevel.local          | Next.js Frontend                 | 3008 |
| slides.darevel.local        | Next.js Frontend                 | 3000 |
| keycloak.darevel.local      | Keycloak Container (keycloak)    | 8080 |
| api.darevel.local           | API Gateway (api-gateway)        | 8081 |

## Setup Instructions

### Step 1: Update System Hosts File

The hosts file tells your operating system to resolve `.darevel.local` domains to `127.0.0.1` (localhost).

#### Windows

1. Open Notepad as Administrator
2. Open: `C:\Windows\System32\drivers\etc\hosts`
3. Add this line at the end:

```
127.0.0.1 suite.darevel.local auth.darevel.local chat.darevel.local drive.darevel.local excel.darevel.local notify.darevel.local mail.darevel.local slides.darevel.local keycloak.darevel.local api.darevel.local darevel.local
```

4. Save and close

#### Linux / macOS

```bash
sudo nano /etc/hosts
```

Add this line:

```
127.0.0.1 suite.darevel.local auth.darevel.local chat.darevel.local drive.darevel.local excel.darevel.local notify.darevel.local mail.darevel.local slides.darevel.local keycloak.darevel.local api.darevel.local darevel.local
```

Save with `Ctrl+O`, exit with `Ctrl+X`

### Step 2: Verify Nginx Configuration

The configuration files are already in place:
- `nginx/nginx.conf` - Main configuration
- `nginx/conf.d/darevel.conf` - App routing

Verify the files exist:

```bash
ls -la nginx/
ls -la nginx/conf.d/
```

### Step 3: Start Nginx Container

```bash
docker compose up -d nginx
```

Verify it's running:

```bash
docker ps | grep nginx
```

You should see:
```
darevel_nginx   nginx:alpine   "/docker-entrypoint.…"   Up   0.0.0.0:80->80/tcp
```

### Step 4: Check Nginx Logs

```bash
docker logs darevel_nginx
```

You should see:
```
/docker-entrypoint.sh: Configuration complete; ready for start up
```

### Step 5: Test Domain Resolution

```bash
# Test if domains resolve
ping -c 1 suite.darevel.local
ping -c 1 keycloak.darevel.local

# On Windows:
ping -n 1 suite.darevel.local
```

You should see `127.0.0.1` in the response.

### Step 6: Test Web Access

Open in your browser:

1. **Keycloak**: http://keycloak.darevel.local
   - Should show Keycloak welcome page
   - No 502 error
   - No infinite refresh loop

2. **Suite App**: http://suite.darevel.local
   - Should redirect to Keycloak login
   - Login with `demo@darevel.com / demo123`
   - Should redirect back to suite

3. **API Gateway**: http://api.darevel.local
   - Should show Spring Boot response

## Troubleshooting

### Issue: "This site can't be reached"

**Cause**: Hosts file not updated or browser cache.

**Solution**:
1. Verify hosts file has the entry
2. Clear browser cache
3. Try incognito/private mode
4. Restart browser
5. Flush DNS cache:
   - **Windows**: `ipconfig /flushdns`
   - **Linux**: `sudo systemd-resolve --flush-caches`
   - **macOS**: `sudo dscacheutil -flushcache`

### Issue: 502 Bad Gateway

**Cause**: Backend service not running or wrong port mapping.

**Solution**:

1. Check if all services are running:
```bash
docker ps
npm run dev
```

2. Check Nginx error logs:
```bash
docker logs darevel_nginx
```

3. Verify port is correct in `nginx/conf.d/darevel.conf`

4. Restart Nginx:
```bash
docker compose restart nginx
```

### Issue: Keycloak infinite refresh loop

**Cause**: Missing proxy headers.

**Solution**:

1. Verify `nginx/conf.d/darevel.conf` has these headers for Keycloak:
```nginx
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
```

2. Verify Keycloak environment in `docker-compose.yml`:
```yaml
PROXY_ADDRESS_FORWARDING=true
KEYCLOAK_FRONTEND_URL=http://localhost:8080
```

3. Restart both:
```bash
docker compose restart keycloak nginx
```

### Issue: Changes not taking effect

**Cause**: Nginx config cached.

**Solution**:

1. Reload Nginx configuration:
```bash
docker exec darevel_nginx nginx -s reload
```

2. Or restart container:
```bash
docker compose restart nginx
```

3. Verify configuration syntax:
```bash
docker exec darevel_nginx nginx -t
```

### Issue: Permission denied accessing hosts file

**Windows Solution**:
1. Right-click Notepad
2. Select "Run as administrator"
3. Then open the hosts file

**Linux/macOS Solution**:
```bash
sudo nano /etc/hosts
```

## Production Deployment

For production, update the configuration to use HTTPS:

### 1. Obtain SSL Certificates

Use Let's Encrypt with Certbot:

```bash
sudo certbot certonly --standalone -d suite.darevel.com -d auth.darevel.com -d keycloak.darevel.com
```

### 2. Update Nginx Configuration

Add SSL configuration to each server block:

```nginx
server {
  listen 443 ssl http2;
  server_name suite.darevel.local;

  ssl_certificate /etc/letsencrypt/live/suite.darevel.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/suite.darevel.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  location / {
    proxy_pass http://host.docker.internal:3002;
    # ... rest of config
  }
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name suite.darevel.local;
  return 301 https://$host$request_uri;
}
```

### 3. Update Application URLs

Update all `.env.local` files:

```bash
NEXT_PUBLIC_KEYCLOAK_URL=https://keycloak.yourdomain.com
NEXT_PUBLIC_APP_URL=https://suite.yourdomain.com
```

### 4. Update Keycloak

```yaml
KEYCLOAK_FRONTEND_URL=https://keycloak.yourdomain.com
```

Update Valid Redirect URIs in Keycloak admin:
- `https://suite.yourdomain.com/*`
- `https://chat.yourdomain.com/*`
- etc.

## Security Recommendations

1. **Rate Limiting**:
```nginx
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
  location / {
    limit_req zone=mylimit burst=20;
    # ...
  }
}
```

2. **Security Headers**:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

3. **Hide Nginx Version**:
```nginx
http {
  server_tokens off;
}
```

4. **Access Logging**:
```nginx
access_log /var/log/nginx/darevel-access.log combined;
error_log /var/log/nginx/darevel-error.log warn;
```

## Performance Tuning

### 1. Enable Caching

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=darevel_cache:10m max_size=1g inactive=60m;

location / {
  proxy_cache darevel_cache;
  proxy_cache_valid 200 60m;
  proxy_cache_use_stale error timeout http_500 http_502 http_503;
}
```

### 2. Connection Keep-Alive

```nginx
http {
  keepalive_timeout 65;
  keepalive_requests 100;
}
```

### 3. Gzip Compression

Already enabled in `nginx.conf`:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/javascript application/json;
```

## Monitoring

### Check Nginx Status

```bash
# Running processes
docker ps | grep nginx

# Resource usage
docker stats darevel_nginx

# Logs (live)
docker logs -f darevel_nginx

# Access logs
docker exec darevel_nginx cat /var/log/nginx/access.log

# Error logs
docker exec darevel_nginx cat /var/log/nginx/error.log
```

### Health Check Endpoint

Add to nginx configuration:

```nginx
server {
  listen 80;
  server_name localhost;

  location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
  }
}
```

Test:
```bash
curl http://localhost/health
```

## Cleanup

To remove Nginx:

```bash
# Stop container
docker compose stop nginx

# Remove container
docker compose rm nginx

# Remove hosts file entries
# Edit /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
```

---

**Summary**:
- ✅ Nginx proxies all 8 Darevel apps
- ✅ Unified `.darevel.local` domain structure
- ✅ Fixes 502 errors and Keycloak refresh loop
- ✅ WebSocket support for Next.js HMR
- ✅ Production-ready with SSL/TLS support
- ✅ Comprehensive monitoring and troubleshooting

For issues, check:
1. Hosts file configuration
2. Nginx logs: `docker logs darevel_nginx`
3. Backend service status: `docker ps` and `npm run dev`
