# Darevel Docs - Backend Setup Guide

## Overview

The Darevel Docs application consists of:
- **Frontend**: React 19.2.0 + Vite (Port 3009)
- **Backend**: Spring Boot 3.2.1 + Java 17 (Port 8087)
- **Database**: PostgreSQL 15 (Port 5439)

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React App     │ ───────>│  Spring Boot API │ ───────>│   PostgreSQL    │
│   Port 3009     │  HTTP   │    Port 8087     │  JDBC   │   Port 5439     │
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
5. **Keycloak** (Optional) - For authentication (can be mocked for development)

## Quick Start

### Option 1: Run Everything (Recommended)

```bash
# From apps/docs directory
start-all.bat
```

This will:
1. Start PostgreSQL database (Port 5439)
2. Build and start Spring Boot backend (Port 8087)
3. Install frontend dependencies
4. Start frontend dev server (Port 3009)

### Option 2: Run Backend Only

```bash
# From apps/docs directory
start-backend.bat
```

Then start frontend separately:
```bash
npm run dev
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
java -jar target/docs-service.jar
```

#### 4. Start Frontend

```bash
# From apps/docs directory
npm install
npm run dev
```

## Database Schema

The backend uses Flyway for automatic database migrations. On first startup, it will create:

### Tables:
- `documents` - Document metadata and content
- `document_permissions` - Role-based access control
- `document_versions` - Version history with snapshots
- `document_comments` - Comments and discussions
- `document_activity` - Audit log
- `active_sessions` - Real-time collaboration tracking

### Migration Files:
Located in `backend/src/main/resources/db/migration/`:
- `V1__init_schema.sql` - Initial database schema

## API Endpoints

### Document Management
```
POST   /api/docs/documents                           - Create document
GET    /api/docs/documents?orgId={id}&search={text}  - List/Search documents
GET    /api/docs/documents/{documentId}              - Get document
PUT    /api/docs/documents/{documentId}              - Update document
DELETE /api/docs/documents/{documentId}              - Delete document
```

### Comments
```
POST   /api/docs/documents/{documentId}/comments              - Create comment
GET    /api/docs/documents/{documentId}/comments              - List comments
PUT    /api/docs/documents/{documentId}/comments/{commentId}  - Update comment
DELETE /api/docs/documents/{documentId}/comments/{commentId}  - Delete comment
POST   /api/docs/documents/{documentId}/comments/{commentId}/resolve  - Resolve
POST   /api/docs/documents/{documentId}/comments/{commentId}/reopen   - Reopen
```

### Versions
```
POST   /api/docs/documents/{documentId}/versions                    - Create version
GET    /api/docs/documents/{documentId}/versions                    - List versions
GET    /api/docs/documents/{documentId}/versions/{versionNumber}    - Get version
POST   /api/docs/documents/{documentId}/versions/{versionNumber}/restore - Restore
```

### Permissions
```
POST   /api/docs/documents/{documentId}/permissions        - Grant permission
GET    /api/docs/documents/{documentId}/permissions        - List permissions
DELETE /api/docs/documents/{documentId}/permissions/{id}   - Revoke permission
```

### Real-time Collaboration
```
WebSocket: ws://localhost:8087/ws/documents/{documentId}
```

## Environment Variables

The backend can be configured via environment variables or `application.properties`:

### Database
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5439)
- `DB_NAME` - Database name (default: darevel_docs)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)

### Server
- `SERVER_PORT` - Backend port (default: 8087)
- `CORS_ORIGINS` - Allowed CORS origins (default: http://localhost:3000,http://localhost:3009)

### Authentication (Keycloak)
- `KEYCLOAK_ISSUER_URI` - Keycloak issuer URI (default: http://localhost:8180/realms/darevel)
- `KEYCLOAK_JWK_URI` - Keycloak JWK URI

### Features
- `MAX_COLLABORATORS` - Max concurrent collaborators (default: 50)
- `AUTO_SAVE_INTERVAL` - Auto-save interval in seconds (default: 30)
- `SNAPSHOT_INTERVAL` - Version snapshot interval (default: 300)

## Frontend-Backend Integration

The frontend is already configured to connect to the backend:

### API Client (`src/services/api.ts`)
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8087/api/docs',
});

// JWT authentication via interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const documentAPI = { ... };
export const commentAPI = { ... };
export const versionAPI = { ... };
```

### Vite Proxy (`vite.config.ts`)
```typescript
server: {
  port: 3009,
  proxy: {
    '/api': {
      target: 'http://localhost:8087',
      changeOrigin: true,
    },
  },
}
```

## Testing

### Backend Tests
```bash
cd backend
mvnw test
```

### Integration Tests
```bash
cd backend
mvnw verify
```

## Troubleshooting

### Backend won't start
1. Check if PostgreSQL is running: `docker ps`
2. Check if port 8087 is available: `netstat -ano | findstr :8087`
3. Check logs in console output

### Database connection errors
1. Verify PostgreSQL is running: `docker-compose -f postgres-compose.yml ps`
2. Check connection: `docker exec -it darevel-postgres-docs psql -U postgres -d darevel_docs`

### Frontend can't connect to backend
1. Verify backend is running at http://localhost:8087
2. Check CORS configuration in `application.properties`
3. Check browser console for errors

### Port conflicts
- Backend: Change `SERVER_PORT` in `application.properties`
- Database: Change port mapping in `postgres-compose.yml`
- Frontend: Change `server.port` in `vite.config.ts`

## Development Workflow

1. **Make backend changes** → Rebuild with `mvnw clean package` → Restart backend
2. **Make frontend changes** → Vite hot-reload automatically updates
3. **Database changes** → Create new migration file `V{N}__description.sql` in `db/migration/`
4. **API changes** → Update both backend controller and frontend `api.ts`

## Production Deployment

### Build Backend
```bash
cd backend
mvnw clean package -DskipTests
```

Output: `target/docs-service.jar`

### Build Frontend
```bash
npm run build
```

Output: `dist/` directory

### Docker Deployment
```bash
cd backend
docker-compose up -d
```

## Additional Resources

- Spring Boot Documentation: https://spring.io/projects/spring-boot
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- React Documentation: https://react.dev/
- Vite Documentation: https://vitejs.dev/

## Support

For issues or questions, check:
1. Backend logs in console
2. Frontend console (F12 in browser)
3. Database logs: `docker logs darevel-postgres-docs`

## Summary

✅ **Backend**: Fully implemented Spring Boot application with all features
✅ **Frontend**: React app with complete API integration
✅ **Database**: PostgreSQL with automatic migrations
✅ **Authentication**: JWT/OAuth2 support via Keycloak
✅ **Real-time**: WebSocket collaboration
✅ **Ready to use**: Just run `start-all.bat`!
