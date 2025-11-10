# Darevel Suite - Command Reference

Quick reference for all npm commands in the Darevel Suite monorepo.

## Development Commands

### Start Everything (Recommended)

```bash
npm run dev
```

**What it does:**
1. Starts Docker services (Postgres, Keycloak, Redis)
2. Waits for all services to be healthy
3. Starts all 8 Darevel apps with Turborepo

**When to use:**
- Every morning when starting work
- After a fresh clone
- When you need the full stack

---

### Start Only Apps

```bash
npm run dev:apps
```

**What it does:**
- Starts all 8 apps with Turborepo
- Assumes Docker services are already running

**When to use:**
- Docker is already running
- You only need to restart apps
- Faster restart during development

---

### Start Only Docker

```bash
npm run dev:docker
```

**What it does:**
- Starts only Docker services in background
- Does not start apps

**When to use:**
- Need backend services only
- Testing Docker configuration
- Running apps individually

---

## Stop Commands

### Stop Everything

```bash
npm run stop
```

**What it does:**
- Stops all Docker containers
- Preserves data in volumes

**When to use:**
- End of day
- Switching projects
- Need to free up ports

---

### Stop & Clean Everything

```bash
npm run clean
```

**What it does:**
- Stops all Docker containers
- Removes all volumes and data
- ⚠️ **Destroys all database data!**

**When to use:**
- Fresh start needed
- Database corruption
- Testing clean installation
- **Use with caution!**

---

## Logging Commands

### View All Logs

```bash
npm run logs
```

**What it does:**
- Shows logs from all Docker services
- Follows logs in real-time (Ctrl+C to exit)

---

### View Keycloak Logs

```bash
npm run logs:keycloak
```

**When to use:**
- Authentication issues
- Keycloak won't start
- Setting up realms/clients

---

### View PostgreSQL Logs

```bash
npm run logs:postgres
```

**When to use:**
- Database connection issues
- Migration problems
- Database won't start

---

### View Redis Logs

```bash
npm run logs:redis
```

**When to use:**
- Caching issues
- Redis connection problems

---

## Build Commands

### Build All Apps

```bash
npm run build
```

**What it does:**
- Builds all 8 apps for production
- Uses Turborepo for parallel builds
- Outputs to `.next/` or `dist/` folders

**When to use:**
- Before deployment
- Testing production builds
- Checking for build errors

---

## Port Cleanup Commands

### Kill All Darevel Ports (PowerShell)

```powershell
.\kill-ports.ps1
```

**What it does:**
- Finds processes using ports 3000-3007
- Kills those processes
- Frees up ports for your apps

**When to use:**
- "Address already in use" errors
- After a crash
- Before starting dev server

---

### Kill All Darevel Ports (Git Bash)

```bash
./kill-ports.sh
```

Same as PowerShell version, but for Git Bash.

---

## Docker Direct Commands

### Start Docker Services

```bash
docker compose up -d
```

**Flags:**
- `-d` = detached mode (runs in background)

---

### Stop Docker Services

```bash
docker compose down
```

---

### View Docker Status

```bash
docker compose ps
```

Shows status of all services.

---

### Restart a Service

```bash
docker compose restart keycloak
```

Replace `keycloak` with `postgres` or `redis` as needed.

---

### View Service Logs

```bash
docker compose logs -f keycloak
```

**Flags:**
- `-f` = follow logs in real-time

---

### Execute Command in Container

```bash
# PostgreSQL
docker exec -it darevel_postgres psql -U keycloak

# Redis
docker exec -it darevel_redis redis-cli

# Bash in any container
docker exec -it darevel_postgres bash
```

---

## Individual App Commands

### Run Specific App

```bash
cd apps/suite
npm run dev
```

### Build Specific App

```bash
cd apps/auth
npm run build
```

### Lint Specific App

```bash
cd apps/mail
npm run lint
```

---

## Turborepo Commands

### Run Dev for Specific Apps

```bash
turbo run dev --filter=suite --filter=auth
```

### Clear Turbo Cache

```bash
turbo clean
```

---

## Workspace Commands

### Install Dependencies

```bash
npm install
```

Installs all dependencies for all workspaces.

---

### Install for Specific Workspace

```bash
npm install -w suite
npm install -w excel
```

---

### Add Dependency to Workspace

```bash
npm install axios -w auth
```

Adds `axios` to the auth app.

---

## Diagnostic Commands

### Check Docker Status

```bash
docker --version
docker compose version
docker info
```

### Check Node/NPM

```bash
node --version
npm --version
```

### Check Ports in Use

**Windows:**
```bash
netstat -ano | findstr :3000
```

**Linux/Mac:**
```bash
lsof -i :3000
```

### Check Running Containers

```bash
docker ps
```

### Check All Containers (including stopped)

```bash
docker ps -a
```

---

## Common Workflows

### Morning Startup

```bash
npm run dev
```

Wait for all services to start, then open http://localhost:3000

---

### Restart After Code Changes

Apps auto-reload, but if needed:

```bash
# Press Ctrl+C to stop
npm run dev:apps
```

---

### Restart Docker Services

```bash
npm run stop
npm run dev:docker
```

---

### Fresh Start

```bash
npm run clean
npm run dev
```

⚠️ This deletes all data!

---

### End of Day

```bash
# Press Ctrl+C to stop apps
npm run stop
```

---

### Deploy to Production

```bash
npm run build
# Then deploy each app's build output
```

---

## Troubleshooting Commands

### Reset Everything

```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### Check Service Health

```bash
# PostgreSQL
docker exec darevel_postgres pg_isready -U keycloak

# Redis
docker exec darevel_redis redis-cli ping

# Keycloak
curl http://localhost:8080
```

---

### Database Backup

```bash
docker exec darevel_postgres pg_dump -U keycloak keycloak > backup.sql
```

---

### Database Restore

```bash
cat backup.sql | docker exec -i darevel_postgres psql -U keycloak keycloak
```

---

## Quick Reference Table

| Task | Command |
|------|---------|
| **Start everything** | `npm run dev` |
| **Stop everything** | `npm run stop` |
| **Reset everything** | `npm run clean` |
| **View logs** | `npm run logs` |
| **Build all** | `npm run build` |
| **Start apps only** | `npm run dev:apps` |
| **Start Docker only** | `npm run dev:docker` |
| **Kill stuck ports** | `./kill-ports.sh` |

---

## Environment URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Suite | http://localhost:3000 | - |
| Slides | http://localhost:3001 | - |
| Chat | http://localhost:3002 | - |
| Mail | http://localhost:3003 | - |
| Excel | http://localhost:3004 | - |
| Auth | http://localhost:3005 | - |
| Drive | http://localhost:3006 | - |
| Notify | http://localhost:3007 | - |
| Keycloak | http://localhost:8080 | admin/admin |
| PostgreSQL | localhost:5432 | keycloak/keycloak |
| Redis | localhost:6379 | (no password) |

---

**Pro Tip:** Bookmark this file for quick access to all commands!
