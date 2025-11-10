# Darevel Suite - Docker & Backend Services

Complete guide to running Darevel Suite with automated Docker backend services.

## Overview

The Darevel Suite uses Docker to run essential backend services:
- **PostgreSQL** (Database for Keycloak and apps)
- **Keycloak** (Authentication & SSO)
- **Redis** (Caching & real-time features)

## Prerequisites

### Install Docker Desktop

**Windows/Mac:**
Download and install Docker Desktop:
https://www.docker.com/products/docker-desktop

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

Verify installation:
```bash
docker --version
docker compose version
```

## Quick Start

### One Command to Rule Them All

```bash
npm run dev
```

This automatically:
1. Starts Docker containers (Postgres, Keycloak, Redis)
2. Waits for all services to be ready
3. Starts all 8 Darevel apps with Turborepo

### What You'll See

```
🚀 Darevel Suite - Starting Development Environment
============================================================

📦 Checking Docker...
✅ Docker is installed

🐳 Starting Docker backend services...
   - PostgreSQL (port 5432)
   - Keycloak (port 8080)
   - Redis (port 6379)

⏳ Waiting for services to be ready...
   Checking PostgreSQL...
   ✅ PostgreSQL is ready!
   Checking Redis...
   ✅ Redis is ready!
   Checking Keycloak (this may take a minute)...
   ✅ Keycloak is ready!

============================================================
✅ All backend services are ready!

📍 Backend Services:
   PostgreSQL:  localhost:5432
   Keycloak:    http://localhost:8080 (admin/admin)
   Redis:       localhost:6379

============================================================

🚀 Starting all Darevel apps with Turborepo...

• Packages in scope: auth, chat, drive, excel, mail, notify, slides, suite
• Running dev in 11 packages

suite:dev: ▲ Next.js - http://localhost:3000
...
```

## Available Commands

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | **Full stack start** - Docker + all apps |
| `npm run dev:docker` | Start only Docker services |
| `npm run dev:apps` | Start only apps (assumes Docker is running) |

### Management

| Command | Description |
|---------|-------------|
| `npm run stop` | Stop all Docker services |
| `npm run clean` | Stop and remove all data (⚠️ destroys volumes) |
| `npm run logs` | View all Docker logs |
| `npm run logs:keycloak` | View Keycloak logs |
| `npm run logs:postgres` | View PostgreSQL logs |
| `npm run logs:redis` | View Redis logs |

## Service Details

### PostgreSQL

- **Port:** 5432
- **Database:** keycloak
- **Username:** keycloak
- **Password:** keycloak

**Connection String:**
```
postgresql://keycloak:keycloak@localhost:5432/keycloak
```

**Connect via CLI:**
```bash
docker exec -it darevel_postgres psql -U keycloak
```

### Keycloak

- **Port:** 8080
- **Admin URL:** http://localhost:8080
- **Admin Username:** admin
- **Admin Password:** admin

**Access Admin Console:**
1. Open http://localhost:8080
2. Click "Administration Console"
3. Login with admin/admin

**Create a Realm for Darevel:**
1. Login to Keycloak admin
2. Click dropdown (top left) → "Create realm"
3. Name: `darevel`
4. Click "Create"

### Redis

- **Port:** 6379
- **No password** (development only)

**Connect via CLI:**
```bash
docker exec -it darevel_redis redis-cli
```

**Test connection:**
```bash
docker exec -it darevel_redis redis-cli ping
# Should return: PONG
```

## Docker Compose Configuration

The [docker-compose.yml](docker-compose.yml) file defines all services with:
- Health checks for each service
- Automatic restart policies
- Persistent data volumes
- Proper service dependencies

## Troubleshooting

### Docker not found

**Error:**
```
❌ Docker is not installed or not running!
```

**Solution:**
1. Install Docker Desktop
2. Start Docker Desktop
3. Wait for it to fully start (whale icon in system tray)

### Port already in use

**Error:**
```
Error: Port 5432 is already allocated
```

**Solution:**
```bash
# Stop conflicting services
npm run stop

# Or change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 instead
```

### Keycloak won't start

**Check logs:**
```bash
npm run logs:keycloak
```

**Common issues:**
- Postgres not ready (wait longer)
- Port 8080 in use (change it in docker-compose.yml)
- Not enough memory (increase Docker Desktop resources)

### Postgres won't start

**Check logs:**
```bash
npm run logs:postgres
```

**Reset database:**
```bash
npm run clean
npm run dev
```

⚠️ This will delete all data!

### Services take too long to start

**First time startup:**
- Docker needs to download images (~2-3 GB)
- This only happens once

**Subsequent startups:**
- Should take 10-30 seconds
- Keycloak takes the longest (~20-30 seconds)

**If consistently slow:**
- Increase Docker Desktop memory (Settings → Resources)
- Recommended: 4GB+ RAM

## Data Persistence

### Where is data stored?

Docker volumes:
```
postgres_data    # PostgreSQL data
```

### View volumes

```bash
docker volume ls
```

### Backup database

```bash
docker exec darevel_postgres pg_dump -U keycloak keycloak > backup.sql
```

### Restore database

```bash
cat backup.sql | docker exec -i darevel_postgres psql -U keycloak keycloak
```

### Delete all data

```bash
npm run clean
```

⚠️ This removes all Docker volumes and data!

## Production Considerations

### Security

The current setup is for **development only**. For production:

1. **Change all passwords** in docker-compose.yml
2. **Enable SSL/TLS** for Postgres and Keycloak
3. **Set Redis password:**
   ```yaml
   command: redis-server --requirepass yourpassword
   ```
4. **Use environment variables** instead of hardcoded values
5. **Enable Keycloak production mode:**
   ```yaml
   command: start --optimized
   ```

### Environment Variables

For production, use `.env` file:

```env
# .env
POSTGRES_PASSWORD=secure_password_here
KEYCLOAK_ADMIN_PASSWORD=admin_password_here
REDIS_PASSWORD=redis_password_here
```

Then reference in docker-compose.yml:
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

### Backups

Set up automated backups:

```bash
# Add to crontab
0 2 * * * docker exec darevel_postgres pg_dump -U keycloak keycloak > /backups/$(date +\%Y\%m\%d).sql
```

## Development Workflow

### Typical Daily Usage

**Morning:**
```bash
npm run dev
```

**Working:**
- All apps run with hot reload
- Make changes, see them instantly
- Backend services stay running

**End of day:**
```bash
# Press Ctrl+C to stop apps
npm run stop  # Stop Docker services
```

### Restart Just Apps

If Docker is already running:
```bash
npm run dev:apps
```

### Restart Just Docker

Without starting apps:
```bash
npm run dev:docker
```

### View Logs While Developing

In a separate terminal:
```bash
npm run logs           # All services
npm run logs:keycloak  # Just Keycloak
```

## Integration with Apps

### Auth App

Configure in `apps/auth/.env`:
```env
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=darevel
KEYCLOAK_CLIENT_ID=darevel-auth
```

### Database Connection

Configure in your apps:
```env
DATABASE_URL=postgresql://keycloak:keycloak@localhost:5432/keycloak
```

### Redis Connection

Configure in your apps:
```env
REDIS_URL=redis://localhost:6379
```

## Next Steps

1. **Configure Keycloak:**
   - Create Darevel realm
   - Create clients for each app
   - Set up user roles

2. **Set up databases:**
   - Create separate databases for each app if needed
   - Run migrations

3. **Configure apps:**
   - Update `.env` files with connection strings
   - Test authentication flow

4. **Build features:**
   - All backend services ready
   - Start developing!

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

**Quick Reference:**

```bash
# Start everything
npm run dev

# Stop everything
npm run stop

# Reset everything
npm run clean && npm run dev

# View logs
npm run logs
```
