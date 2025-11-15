# Darevel Suite - Development Setup Guide

## Current Issue: 502 Bad Gateway

The 502 errors you're seeing occur because:
1. **Docker services are not running** (nginx, Keycloak, databases)
2. The apps need these services to function properly
3. Nginx reverse proxy can't reach the Next.js apps

## Solution: Start Docker Services

### For Windows Users:

1. **Ensure Docker Desktop is running**
   - Open Docker Desktop
   - Wait for it to fully start (whale icon in system tray should be steady)

2. **Start all services**
   ```bash
   npm run dev
   ```

   This will:
   - ✓ Start Docker services (PostgreSQL, Keycloak, Redis, Nginx, Microservices)
   - ✓ Wait for services to be ready
   - ✓ Start all Next.js/Vite apps via Turborepo

3. **Access the apps**
   - Main Suite: http://darevel.local
   - Auth: http://auth.darevel.local
   - Chat: http://chat.darevel.local
   - Mail: http://mail.darevel.local
   - Drive: http://drive.darevel.local
   - Excel: http://excel.darevel.local
   - Slides: http://slides.darevel.local
   - Notify: http://notify.darevel.local
   - Keycloak: http://keycloak.darevel.local

### Alternative: Docker-only Services (Apps separate)

If you want to run services in Docker but apps directly:

```bash
# Terminal 1: Start Docker services only
npm run dev:docker

# Terminal 2: Start apps only
npm run dev:apps
```

Then access apps directly:
- Suite: http://localhost:3002
- Auth: http://localhost:3005
- Mail: http://localhost:3004
- Drive: http://localhost:3006
- Notify: http://localhost:3007
- Slides: http://localhost:3000
- Excel: http://localhost:3001
- Chat: http://localhost:3003

### Troubleshooting

#### 502 Bad Gateway
- Check Docker Desktop is running
- Run: `docker ps` - should show multiple containers
- Restart: `npm run stop && npm run dev`

#### Port Already in Use
- Check for existing processes: `netstat -ano | findstr ":3002"`
- Kill the process or restart your machine

#### Keycloak Not Ready
- Wait 2-3 minutes for first startup
- Check logs: `npm run logs:keycloak`

#### Apps Not Accessible via .local domains
- Check C:\Windows\System32\drivers\etc\hosts file
- Should contain:
  ```
  127.0.0.1 darevel.local
  127.0.0.1 auth.darevel.local
  # ... etc
  ```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                       Nginx (Port 80)                    │
│              Routes: *.darevel.local → Apps              │
└─────────────────────────────────────────────────────────┘
                            ↓
    ┌───────────────────────┬──────────────────────────┐
    ↓                       ↓                          ↓
┌────────┐          ┌──────────────┐         ┌─────────────┐
│ Next.js │          │   Keycloak   │         │  Services   │
│  Apps  │  ←────→  │ (Port 8080)  │  ←────→ │ (8081-8088) │
└────────┘          └──────────────┘         └─────────────┘
  ↓                       ↓                          ↓
┌──────────────────────────────────────────────────────────┐
│              PostgreSQL (5432, 5433) + Redis (6379)      │
└──────────────────────────────────────────────────────────┘
```

## Service Ports

### Infrastructure
- PostgreSQL (Keycloak): 5432
- PostgreSQL (App): 5433
- Redis: 6379
- Keycloak: 8080
- Nginx: 80

### Microservices (Spring Boot)
- API Gateway: 8081
- User Service: 8082
- Drive Service: 8083
- Mail Service: 8084
- Chat Service: 8085
- Notify Service: 8086
- Excel Service: 8087
- Slides Service: 8088

### Frontend Apps (Next.js/Vite)
- Slides: 3000
- Excel: 3001
- Suite: 3002
- Chat: 3003
- Mail: 3004
- Auth: 3005
- Drive: 3006
- Notify: 3007

## Next Steps

1. Start Docker Desktop
2. Run `npm run dev`
3. Wait for "✅ All backend services are ready!"
4. Access http://darevel.local
5. Login with Keycloak credentials (default: admin/admin)
