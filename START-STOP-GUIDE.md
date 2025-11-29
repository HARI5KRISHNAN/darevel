# Darevel Applications - Start/Stop Guide

## Overview

This guide explains how to start and stop all Darevel applications. Each application consists of three components:
- **PostgreSQL Database** (Docker container)
- **Spring Boot Backend** (Java 17, Docker container)
- **React Frontend** (Node.js, Vite dev server)

## Prerequisites

### 1. Start Infrastructure First

Before starting any application, you MUST start the infrastructure services:

```bash
start-infrastructure.bat
```

This starts:
- **Keycloak** (Authentication server) on port 8180
- Other shared infrastructure services

### 2. Required Software

- **Docker Desktop** - Must be running
- **Java 17** - For backend services
- **Node.js 18+** - For frontend development
- **Maven 3.8+** - Included via Maven Wrapper
- **curl** - For health checks (included in Windows 10+)

---

## Quick Start Commands

### Starting Applications

From the `darevel-main` folder, run:

```bash
# Start Docs application
start-docs.bat

# Start Mail application
start-mail.bat

# Start Sheet application
start-sheet.bat

# Start Dashboard application
start-dashboard.bat

# Start Slides application
start-slides.bat

# Start Notification Center
start-notification.bat
```

### Stopping Applications

From the `darevel-main` folder, run:

```bash
# Stop Docs application
stop-docs.bat

# Stop Mail application
stop-mail.bat

# Stop Sheet application
stop-sheet.bat

# Stop Dashboard application
stop-dashboard.bat

# Stop Slides application
stop-slides.bat

# Stop Notification Center
stop-notification.bat
```

---

## Port Reference

| Application | Frontend | Backend | Database | Database Port |
|-------------|----------|---------|----------|---------------|
| **Docs**    | 3009     | 8087    | darevel_docs | 5439 |
| **Mail**    | 3008     | 8083    | darevel_mail | 5432 |
| **Sheet**   | 3004     | 8089    | darevel_sheet | 5438 |
| **Slides**  | 3000     | 8084    | darevel_slides | 5435 |
| **Dashboard** | 3007   | 9410    | dashboard | 5443 |
| **Notification** | 3011 | 9495    | notification | 5445 |
| **Keycloak** | -       | 8180    | keycloak_db | 5433 |

---

## Startup Process (What Each Script Does)

Each `start-{app}.bat` script follows this sequence:

### Step 1: Infrastructure Check
```
✓ Checks if Keycloak is running at http://localhost:8180
✗ If not running, exits with error message
```

### Step 2: Start Database
```
✓ Starts PostgreSQL container via docker-compose
✓ Database runs on app-specific port (see table above)
✗ If fails, stops script and shows error
```
> **Dashboard-only add-on**: `start-dashboard.bat` also runs `docker-compose -f redis-compose.yml up -d` right after Postgres so the Redis cache on port 6379 is ready before the backend boots.
>
> **Notification add-on**: `start-notification.bat` provisions Postgres (5445) and Redis (6385) via the same compose file before building the Spring Boot service.

### Step 3: Start Backend
```
✓ Starts Spring Boot backend in separate window
✓ Builds Docker image if needed
✓ Backend runs on app-specific port (see table above)
```

### Step 4: Wait for Backend Initialization
```
✓ Waits 30 seconds for backend to initialize
✓ Database connections, schema creation, etc.
```

### Step 5: Health Check
```
✓ Checks if backend is responding
✓ If fails, waits additional 15 seconds and retries
✗ If still fails, stops script WITHOUT starting frontend
```

### Step 6: Start Frontend
```
✓ Only runs if backend is healthy
✓ Starts Vite dev server in separate window
✓ Frontend runs on app-specific port (see table above)
```

---

## Shutdown Process (What Each Script Does)

Each `stop-{app}.bat` script follows this sequence:

### Step 1: Stop Backend
```
✓ Runs docker-compose down in backend directory
✓ Stops Spring Boot container gracefully
```

### Step 2: Stop Database
```
✓ Runs docker-compose down for PostgreSQL
✓ Stops database container gracefully
```
> **Dashboard-only add-on**: `stop-dashboard.bat` also executes `docker-compose -f redis-compose.yml down` before shutting down the Postgres container so cache + DB stay in sync.
>
> **Notification add-on**: `stop-notification.bat` issues `docker-compose down` inside `apps/notification/backend`, which tears down the Spring Boot container along with its Postgres + Redis dependencies before killing the Vite dev server port 3011.

### Step 3: Kill Frontend
```
✓ Finds process listening on frontend port
✓ Kills the Node.js process forcefully
```

---

## Error Handling

### Error: "Keycloak is not running!"
**Cause**: Infrastructure not started
**Solution**:
```bash
start-infrastructure.bat
```

### Error: "Failed to start database!"
**Cause**: Docker not running or port conflict
**Solution**:
1. Check Docker Desktop is running
2. Check if port is already in use:
   ```bash
   netstat -ano | findstr :{port}
   ```
3. Stop conflicting process or change port in `postgres-compose.yml`

### Error: "Backend failed to start properly!"
**Cause**: Database not ready, build failed, or port conflict
**Solution**:
1. Check the backend window for error details
2. Verify database is running:
   ```bash
   docker ps
   ```
3. Check if backend port is available:
   ```bash
   netstat -ano | findstr :{port}
   ```
4. Review backend logs in the separate console window

### Frontend doesn't start automatically
**Cause**: Backend health check failed
**This is intentional** - frontend won't start if backend is unhealthy
**Solution**:
1. Check backend window for errors
2. Fix backend issues
3. Run start script again

---

## Manual Operations

### Start Components Individually

If you need more control, you can start components manually:

#### Database Only
```bash
cd apps/{app-name}/backend
docker-compose -f postgres-compose.yml up -d
```

#### Backend Only
```bash
cd apps/{app-name}/backend
docker-compose up --build
```

#### Frontend Only
```bash
cd apps/{app-name}
npm install  # First time only
npm run dev
```

---

## Access URLs

### Docs Application
- Frontend: http://localhost:3009
- Backend API: http://localhost:8087/api/docs
- Database: localhost:5439

### Mail Application
- Frontend: http://localhost:3008
- Backend API: http://localhost:8083/api/mail
- Database: localhost:5432

### Sheet Application
- Frontend: http://localhost:3004
- Backend API: http://localhost:8089/api/sheets
- Database: localhost:5438

### Slides Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8084/api/slides
- Database: localhost:5435

### Dashboard Application
- Frontend: http://localhost:3007
- Backend API: http://localhost:9410/api/dashboard
- Database: localhost:5443 (Postgres)
- Cache: localhost:6379 (Redis)

### Notification Center
- Frontend: http://localhost:3011
- Backend API: http://localhost:9495/api/notifications
- Database: localhost:5445 (Postgres, db/user/password `notification`)
- Cache: localhost:6385 (Redis pub/sub and unread cache)

### Infrastructure
- Keycloak Admin: http://localhost:8180/admin
  - Username: admin
  - Password: admin
- Keycloak User Login: http://localhost:8180/realms/darevel/account
  - Test users: alice/password, bob/password

---

## Troubleshooting

### Docker Issues

**Check if Docker is running:**
```bash
docker ps
```

**View all containers (including stopped):**
```bash
docker ps -a
```

**View container logs:**
```bash
docker logs {container-name}
```

**Restart Docker Desktop:**
- Right-click Docker Desktop tray icon
- Click "Restart Docker Desktop"

### Port Conflicts

**Find process using a port:**
```bash
netstat -ano | findstr :{port}
```

**Kill process by PID:**
```bash
taskkill /F /PID {pid}
```

### Database Connection Issues

**Test PostgreSQL connection:**
```bash
docker ps  # Get container name
docker exec -it {container-name} psql -U postgres -d {database-name}
```

**Reset database:**
```bash
cd apps/{app-name}/backend
docker-compose -f postgres-compose.yml down -v  # -v removes volumes
docker-compose -f postgres-compose.yml up -d
```

### Backend Won't Start

1. **Check Java version:**
   ```bash
   java -version  # Should be 17+
   ```

2. **Check Maven:**
   ```bash
   cd apps/{app-name}/backend
   mvnw --version
   ```

3. **Manual rebuild:**
   ```bash
   cd apps/{app-name}/backend
   mvnw clean package -DskipTests
   docker-compose build --no-cache
   docker-compose up
   ```

### Frontend Issues

1. **Clear node_modules:**
   ```bash
   cd apps/{app-name}
   rmdir /s /q node_modules
   npm install
   ```

2. **Check backend connectivity:**
   ```bash
   curl http://localhost:{backend-port}/actuator/health
   ```

3. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files

---

## Development Workflow

### Making Changes

**Backend changes:**
1. Edit Java code in `apps/{app-name}/backend/src`
2. Stop backend: Close backend console window
3. Rebuild: `cd apps/{app-name}/backend && mvnw clean package`
4. Restart: Run start script or `docker-compose up --build`

**Frontend changes:**
1. Edit React code in `apps/{app-name}/src`
2. Changes auto-reload via Vite HMR
3. No restart needed!

**Database changes:**
1. Update JPA entities in `backend/src/main/java/.../entity`
2. Restart backend - Hibernate auto-updates schema (ddl-auto: update)
3. For Docs app: Create Flyway migration in `backend/src/main/resources/db/migration`

---

## Complete Startup Sequence

For a fresh start of the entire system:

```bash
# 1. Start Docker Desktop (if not running)

# 2. Start infrastructure
start-infrastructure.bat

# 3. Start applications (in any order)
start-docs.bat
start-mail.bat
start-sheet.bat
start-slides.bat

# Wait for all windows to complete...
# You'll see success messages when ready
```

---

## Complete Shutdown Sequence

To stop everything:

```bash
# 1. Stop all applications
stop-docs.bat
stop-mail.bat
stop-sheet.bat
stop-slides.bat

# 2. Stop infrastructure (if desired)
stop-infrastructure.bat

# 3. Stop Docker Desktop (optional)
# Right-click Docker icon → Quit Docker Desktop
```

---

## Common Scenarios

### Scenario 1: Quick Dev Session
```bash
start-infrastructure.bat  # Once per day/session
start-slides.bat          # Work on Slides today
# ... do your work ...
stop-slides.bat           # Done for now
```

### Scenario 2: Testing Integration
```bash
start-infrastructure.bat
start-docs.bat
start-slides.bat
# Test document → presentation workflow
stop-docs.bat
stop-slides.bat
```

### Scenario 3: Fresh Start After Errors
```bash
# Stop everything
stop-docs.bat
stop-mail.bat
stop-sheet.bat
stop-slides.bat

# Clean Docker
docker system prune -f

# Restart Docker Desktop

# Start fresh
start-infrastructure.bat
start-{app}.bat
```

---

## Tips

1. **Keep backend windows open** - You'll see logs and errors in real-time
2. **Frontend auto-reloads** - Just save your files, no restart needed
3. **Use stop scripts** - Don't just close windows; orphaned containers waste resources
4. **Check health before debugging** - Backend window shows most errors clearly
5. **One app at a time** - Start only what you're actively developing
6. **Infrastructure stays up** - You can restart apps without restarting infrastructure

---

## Summary

✅ **Always start infrastructure first** (`start-infrastructure.bat`)
✅ **Use provided scripts** - They have error handling built-in
✅ **Check backend window** - Most errors appear there
✅ **Frontend won't start if backend fails** - This is intentional and protective
✅ **Stop properly** - Use stop scripts to clean up containers
✅ **Read error messages** - Scripts provide clear guidance on what went wrong

**Need Help?**
- Check backend console window for detailed errors
- Review `apps/{app-name}/BACKEND-SETUP.md` for app-specific details
- See `BACKENDS-OVERVIEW.md` for complete system architecture
