# Darevel Sheet - Backend Setup Guide

## Overview

The Darevel Sheet application consists of:
- **Frontend**: React 19.2.0 + Vite (Port 3004)
- **Backend**: Spring Boot 3.2.1 + Java 17 (Port 8089)
- **Database**: PostgreSQL 15 (Port 5432)

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React App     │ ───────>│  Spring Boot API │ ───────>│   PostgreSQL    │
│   Port 3004     │  HTTP   │    Port 8089     │  JDBC   │   Port 5432     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │
        │                            │
        └────────── WebSocket ───────┘
          (Real-time Collaboration)
```

## Prerequisites

1. **Java 17** - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/#java17) or use OpenJDK
2. **Maven 3.8+** - Included via Maven Wrapper (`mvnw`)
3. **Docker Desktop** - For running PostgreSQL
4. **Node.js 18+** - For the frontend
5. **Keycloak** (Optional) - For authentication

## Quick Start

### Option 1: Run Everything (Recommended)

```bash
# From apps/sheet directory
start-all-new.bat
```

### Option 2: Run Components Separately

#### Start Backend Only
```bash
# From apps/sheet directory
start-backend-new.bat
```

#### Start Frontend Only
```bash
# From apps/sheet directory
start-frontend.bat
```

### Option 3: Manual Setup

#### 1. Start PostgreSQL

```bash
cd backend
docker-compose -f postgres-compose.yml up -d
```

#### 2. Build Backend

```bash
cd backend
mvnw clean package -DskipTests
```

#### 3. Run Backend

```bash
java -jar target/sheet-service.jar
```

#### 4. Start Frontend

```bash
# From apps/sheet directory
npm install
npm run dev
```

## Database Schema

Tables:
- `sheets` - Spreadsheet metadata
- `cells` - Cell data and formulas
- `versions` - Version history
- `permissions` - Access control
- `collaborators` - Active users

## Configuration

### Backend Configuration (`application.yml`)

```yaml
server:
  port: 8089

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/darevel_sheet
    username: postgres
    password: postgres

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/darevel
```

### Frontend Configuration (`vite.config.ts`)

```typescript
server: {
  port: 3004,
  proxy: {
    '/api': {
      target: 'http://localhost:8089',
      changeOrigin: true,
    },
  },
}
```

## API Endpoints

### Sheet Operations
```
GET    /api/sheets/load                - List all sheets
GET    /api/sheets/{id}                - Get specific sheet
POST   /api/sheets/save                - Create new sheet
PUT    /api/sheets/{id}                - Update sheet
DELETE /api/sheets/{id}                - Delete sheet
```

### Cell Operations
```
PUT    /api/sheets/{id}/cells          - Update cell values
GET    /api/sheets/{id}/cells          - Get cell data
POST   /api/sheets/{id}/calculate      - Recalculate formulas
```

### Collaboration
```
WebSocket: ws://localhost:8089/ws/sheets/{id}
```

## Environment Variables

### Database
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_PASSWORD` - Database password (default: postgres)

### Server
- `SERVER_PORT` - Backend port (default: 8089)

### Authentication
- `KEYCLOAK_ISSUER_URI` - Keycloak issuer URI
- `KEYCLOAK_JWK_SET_URI` - Keycloak JWK URI

## Frontend-Backend Integration

### API Client (`src/services/api.ts`)
```typescript
const client = axios.create({
  baseURL: import.meta.env.VITE_SHEET_API_URL || 'http://localhost:8089/api/sheets'
});

// JWT authentication
client.interceptors.request.use((config) => {
  const token = keycloak.token || localStorage.getItem('kc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Features

### Spreadsheet Features
- ✅ Cell editing with formulas
- ✅ Multiple sheet support
- ✅ Auto-save functionality
- ✅ Real-time collaboration
- ✅ Version history
- ✅ Import/Export (CSV, XLSX)
- ✅ Cell formatting
- ✅ Formula calculations

### Collaboration Features
- ✅ Multi-user editing
- ✅ Live cursor positions
- ✅ Change notifications
- ✅ Conflict resolution
- ✅ Activity tracking

## Troubleshooting

### Backend won't start
1. Check if PostgreSQL is running: `docker ps`
2. Check if port 8089 is available
3. Check logs in console output

### Database connection errors
1. Verify PostgreSQL is running
2. Check connection string in `application.yml`
3. Test with: `psql -h localhost -U postgres -d darevel_sheet`

### Frontend can't connect to backend
1. Verify backend is running at http://localhost:8089
2. Check CORS configuration
3. Check browser console for errors

## Access Points

- **Frontend**: http://localhost:3004
- **Backend API**: http://localhost:8089/api/sheets
- **Database**: localhost:5432

## Development Workflow

1. **Make backend changes** → Rebuild with `mvnw clean package` → Restart backend
2. **Make frontend changes** → Vite hot-reload automatically updates
3. **Database changes** → Update JPA entities → Hibernate auto-updates schema
4. **API changes** → Update both backend controller and frontend `api.ts`

## Summary

✅ **Backend**: Spring Boot 3.2.1 with spreadsheet engine
✅ **Frontend**: React 19.2.0 with Vite
✅ **Database**: PostgreSQL 15
✅ **Authentication**: Keycloak OAuth2/JWT
✅ **Real-time**: WebSocket collaboration
✅ **Ready to use**: Just run `start-all-new.bat`!
