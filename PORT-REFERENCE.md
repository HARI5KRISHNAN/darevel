# Port Reference Guide

This document lists all port allocations for the Darevel Suite monorepo.

## Quick Reference Table

| Service Type | Port | Service Name | Location | Status |
|-------------|------|--------------|----------|--------|
| **Frontend Apps (Next.js)** | | | | |
| Frontend | 3001 | Slides App | `apps/slides` | ✅ Active |
| Frontend | 3002 | Suite App | `apps/suite` | ✅ Active |
| Frontend | 3003 | Chat App | `apps/chat` | 🔄 Reserved |
| Frontend | 3004 | Excel App | `apps/excel` | 🔄 Reserved |
| Frontend | 3005 | Auth App | `apps/auth` | ✅ Active |
| Frontend | 3006 | Drive App | `apps/drive` | ✅ Active |
| Frontend | 3007 | Notify App | `apps/notify` | ✅ Active |
| Frontend | 3008 | Mail App | `apps/mail` | 🔄 Reserved |
| **Backend Microservices (Spring Boot)** | | | | |
| Backend | 8081 | API Gateway | `microservices/api-gateway` | ✅ Active |
| Backend | 8082 | User Service | `microservices/user-service` | ✅ Active |
| Backend | 8083 | Drive Service | `microservices/drive-service` | ✅ Active |
| Backend | 8084 | Mail Service | `microservices/mail-service` | ✅ Active |
| Backend | 8085 | Chat Service | `microservices/chat-service` | ✅ Active |
| Backend | 8086 | Notify Service | `microservices/notify-service` | ✅ Active |
| Backend | 8087 | Excel Service | `microservices/excel-service` | ✅ Active |
| Backend | 8088 | Slides Service | `microservices/slides-service` | ✅ Active |
| **Infrastructure Services (Docker)** | | | | |
| Database | 5432 | PostgreSQL (Keycloak DB) | Docker | ✅ Active |
| Database | 5433 | PostgreSQL (App DB) | Docker | ✅ Active |
| Auth | 8080 | Keycloak | Docker | ✅ Active |
| Cache | 6379 | Redis | Docker | ✅ Active |
| Backend | 4000 | Node.js Backend | Docker (optional) | 🔄 Optional |

## Frontend Applications (Ports 3001-3008)

### Active Applications

#### Slides App - Port 3001
- **Location**: `apps/slides/`
- **Purpose**: Presentation/Slides application
- **Access**: http://localhost:3001
- **Config**: `apps/slides/package.json`

#### Suite App - Port 3002
- **Location**: `apps/suite/`
- **Purpose**: Main dashboard/suite application
- **Access**: http://localhost:3002
- **Config**: `apps/suite/package.json`
- **Note**: Changed from 3000 to 3002 to avoid conflicts

#### Auth App - Port 3005
- **Location**: `apps/auth/`
- **Purpose**: Authentication service frontend
- **Access**: http://localhost:3005
- **Config**: `apps/auth/package.json`

#### Drive App - Port 3006
- **Location**: `apps/drive/`
- **Purpose**: File storage/drive frontend
- **Access**: http://localhost:3006
- **Config**: `apps/drive/package.json`

#### Notify App - Port 3007
- **Location**: `apps/notify/`
- **Purpose**: Notification service frontend
- **Access**: http://localhost:3007
- **Config**: `apps/notify/package.json`

### Reserved Ports (Future Use)

#### Chat App - Port 3003
- **Location**: `apps/chat/` (currently empty)
- **Purpose**: Chat/messaging application
- **Status**: Reserved for future development

#### Excel App - Port 3004
- **Location**: `apps/excel/` (currently empty)
- **Purpose**: Spreadsheet application
- **Status**: Reserved for future development

#### Mail App - Port 3008
- **Location**: `apps/mail/` (currently empty)
- **Purpose**: Email client application
- **Status**: Reserved for future development

## Backend Microservices (Ports 8081-8088)

### API Gateway - Port 8081
- **Location**: `microservices/api-gateway/`
- **Purpose**: Main API gateway for routing requests to microservices
- **Access**: http://localhost:8081
- **Config**: `microservices/api-gateway/src/main/resources/application.yml`
- **Key Features**:
  - CORS configuration for all frontend apps
  - JWT authentication via Keycloak
  - Routes to all microservices

### User Service - Port 8082
- **Location**: `microservices/user-service/`
- **Purpose**: User management and profile services
- **Access**: http://localhost:8082
- **API Route**: `/api/user/**` (via API Gateway)

### Drive Service - Port 8083
- **Location**: `microservices/drive-service/`
- **Purpose**: File storage and management
- **Access**: http://localhost:8083
- **API Route**: `/api/drive/**` (via API Gateway)

### Mail Service - Port 8084
- **Location**: `microservices/mail-service/`
- **Purpose**: Email sending and management
- **Access**: http://localhost:8084
- **API Route**: `/api/mail/**` (via API Gateway)

### Chat Service - Port 8085
- **Location**: `microservices/chat-service/`
- **Purpose**: Real-time chat and messaging
- **Access**: http://localhost:8085
- **API Route**: `/api/chat/**` (via API Gateway)
- **Dependencies**: Redis for real-time features

### Notify Service - Port 8086
- **Location**: `microservices/notify-service/`
- **Purpose**: Notification system
- **Access**: http://localhost:8086
- **API Route**: `/api/notify/**` (via API Gateway)
- **Dependencies**: Redis for real-time features

### Excel Service - Port 8087
- **Location**: `microservices/excel-service/`
- **Purpose**: Spreadsheet processing
- **Access**: http://localhost:8087
- **API Route**: `/api/excel/**` (via API Gateway)

### Slides Service - Port 8088
- **Location**: `microservices/slides-service/`
- **Purpose**: Presentation/slides backend
- **Access**: http://localhost:8088
- **API Route**: `/api/slides/**` (via API Gateway)

## Infrastructure Services

### PostgreSQL (Keycloak DB) - Port 5432
- **Purpose**: Database for Keycloak authentication server
- **Access**: localhost:5432
- **Credentials**:
  - User: `keycloak`
  - Password: `keycloak`
  - Database: `keycloak`
- **Config**: `docker-compose.yml` (service: `postgres`)

### PostgreSQL (Application DB) - Port 5433
- **Purpose**: Main application database for all microservices
- **Access**: localhost:5433
- **Credentials**:
  - User: `postgres`
  - Password: `postgres`
  - Database: `darevel`
- **Config**: `docker-compose.yml` (service: `postgres-app`)

### Keycloak - Port 8080
- **Purpose**: Authentication and authorization server
- **Access**: http://localhost:8080
- **Admin Console**: http://localhost:8080/admin
- **Credentials**:
  - Username: `admin`
  - Password: `admin`
- **Realm**: `pilot180`
- **Config**: `docker-compose.yml` (service: `keycloak`)

### Redis - Port 6379
- **Purpose**: Caching and real-time features
- **Access**: localhost:6379
- **Used By**: Chat Service, Notify Service
- **Config**: `docker-compose.yml` (service: `redis`)

### Node.js Backend - Port 4000 (Optional)
- **Purpose**: Optional Node.js backend service
- **Access**: http://localhost:4000
- **Status**: Optional/Legacy
- **Config**: `docker-compose.yml` (service: `backend`)

## Starting the Development Environment

### Quick Start
```bash
npm run dev
```

This command will:
1. Start all Docker services (PostgreSQL, Keycloak, Redis)
2. Wait for services to be ready
3. Start all frontend apps in parallel using Turborepo
4. Display all service URLs

### Individual Commands

Start only Docker services:
```bash
npm run dev:docker
# or
docker compose up -d
```

Start only frontend apps:
```bash
npm run dev:apps
# or
turbo run dev --parallel
```

Stop all Docker services:
```bash
npm run stop
# or
docker compose down
```

Clean all Docker volumes:
```bash
npm run clean
# or
docker compose down -v
```

## Port Conflict Resolution

If you encounter port conflicts:

1. **Check what's using the port**:
   ```bash
   # On Linux/Mac
   lsof -i :3000

   # On Windows
   netstat -ano | findstr :3000
   ```

2. **Kill the process or change the port**:
   - For frontend apps: Edit the `package.json` in the app directory
   - For microservices: Edit `application.yml` in `src/main/resources/`
   - For Docker services: Edit `docker-compose.yml` or set environment variables

3. **Update CORS settings** if you change frontend ports:
   - `microservices/api-gateway/src/main/resources/application.yml` (line 75-83)
   - `docker-compose.yml` (line 93) for backend service

## Environment Variables

Port configurations can be overridden using environment variables. See `.env.example` for all available options:

```bash
# Frontend apps don't use env vars for ports (set in package.json)
# Backend microservices
API_GATEWAY_PORT=8081
USER_SERVICE_PORT=8082
DRIVE_SERVICE_PORT=8083
# ... etc

# Infrastructure
POSTGRES_PORT=5432
POSTGRES_APP_PORT=5433
KEYCLOAK_PORT=8080
REDIS_PORT=6379
```

## Troubleshooting

### Suite App Port Conflict (3000)
If you see "EADDRINUSE: address already in use :::3000", this is resolved as the Suite app now uses port 3002.

### Microservice Can't Connect to Database
- Ensure PostgreSQL (App DB) is running on port 5433
- Check connection string in `application.yml` files
- Verify Docker containers are healthy: `docker ps`

### Frontend Can't Reach API
- Ensure API Gateway is running on port 8081
- Check CORS configuration includes your frontend port
- Verify Keycloak is running for authentication

### View Logs
```bash
# All services
npm run logs

# Specific service
npm run logs:keycloak
npm run logs:postgres
npm run logs:redis

# Or use Docker directly
docker logs -f darevel_api_gateway
docker logs -f darevel_user_service
```

## Adding New Services

### Adding a New Frontend App

1. Choose the next available port (3003, 3004, or 3008)
2. Create package.json with dev script:
   ```json
   "dev": "next dev -p 300X"
   ```
3. Update CORS in:
   - `microservices/api-gateway/src/main/resources/application.yml`
   - `docker-compose.yml` (backend service CORS_ORIGINS)
4. Update this PORT-REFERENCE.md

### Adding a New Microservice

1. Choose the next available port (8089+)
2. Configure `application.yml` with:
   ```yaml
   server:
     port: ${SERVER_PORT:808X}
   ```
3. Add route in API Gateway `application.yml`
4. Add service to `docker-compose.yml`
5. Update this PORT-REFERENCE.md

## Architecture Overview

```
Frontend Layer (Ports 3001-3008)
    ↓
API Gateway (Port 8081)
    ↓
Microservices (Ports 8082-8088)
    ↓
Infrastructure (Postgres: 5432/5433, Redis: 6379, Keycloak: 8080)
```

All frontend apps communicate with microservices through the API Gateway on port 8081, which handles authentication via Keycloak and routes requests to the appropriate microservice.
