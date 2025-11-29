# Darevel Slides - Backend Setup Guide

## Overview

The Darevel Slides application consists of:
- **Frontend**: React 19.2.0 + Vite (Port 3000)
- **Backend**: Spring Boot 3.2.1 + Java 17 (Port 8084)
- **Database**: PostgreSQL 15 (Port 5432)

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React App     │ ───────>│  Spring Boot API │ ───────>│   PostgreSQL    │
│   Port 3000     │  HTTP   │    Port 8084     │  JDBC   │   Port 5432     │
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
# From apps/slides directory
start-all.bat
```

### Option 2: Run Components Separately

#### Start Backend Only
```bash
# From apps/slides directory
start-backend.bat
```

#### Start Frontend Only
```bash
# From apps/slides directory
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
java -jar target/slides-service.jar
```

#### 4. Start Frontend

```bash
# From apps/slides directory
npm install
npm run dev
```

## Database Schema

Tables:
- `presentations` - Presentation metadata
- `slides` - Individual slides
- `slide_elements` - Text, images, shapes
- `versions` - Version history
- `permissions` - Access control
- `themes` - Presentation themes
- `templates` - Slide templates

## Configuration

### Backend Configuration (`application.yml`)

```yaml
server:
  port: 8084

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/darevel_slides
    username: postgres
    password: postgres

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/darevel

  servlet:
    multipart:
      max-file-size: 10MB  # For image uploads

# File Upload
file:
  upload-dir: ./uploads/slides
  max-size: 10485760  # 10MB

# AI Integration
ai:
  ollama:
    base-url: http://localhost:11434
    model: llama2
  unsplash:
    access-key: YOUR_KEY_HERE
```

### Frontend Configuration (`vite.config.ts`)

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8084',
      changeOrigin: true,
    },
  },
}
```

## API Endpoints

### Presentation Operations
```
GET    /api/slides/presentations              - List presentations
GET    /api/slides/presentations/{id}         - Get presentation
POST   /api/slides/presentations              - Create presentation
PUT    /api/slides/presentations/{id}         - Update presentation
DELETE /api/slides/presentations/{id}         - Delete presentation
```

### Slide Operations
```
GET    /api/slides/presentations/{id}/slides              - List slides
POST   /api/slides/presentations/{id}/slides              - Create slide
PUT    /api/slides/presentations/{id}/slides/{slideId}    - Update slide
DELETE /api/slides/presentations/{id}/slides/{slideId}    - Delete slide
POST   /api/slides/presentations/{id}/slides/reorder      - Reorder slides
```

### Version Operations
```
GET    /api/slides/presentations/{id}/versions              - List versions
POST   /api/slides/presentations/{id}/versions              - Create version
POST   /api/slides/presentations/{id}/versions/{n}/restore  - Restore version
```

### Export Operations
```
GET    /api/slides/presentations/{id}/export/pdf    - Export to PDF
GET    /api/slides/presentations/{id}/export/pptx   - Export to PowerPoint
```

### Image Operations
```
POST   /api/slides/upload/image          - Upload image
GET    /api/slides/images/search         - Search Unsplash images
```

### Collaboration
```
WebSocket: ws://localhost:8084/ws/presentations/{id}
```

## Environment Variables

### Database
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_PASSWORD` - Database password (default: postgres)

### Server
- `SERVER_PORT` - Backend port (default: 8084)

### File Upload
- `FILE_UPLOAD_DIR` - Upload directory (default: ./uploads/slides)

### AI Integration
- `OLLAMA_BASE_URL` - Ollama API URL (default: http://localhost:11434)
- `OLLAMA_MODEL` - AI model (default: llama2)
- `UNSPLASH_ACCESS_KEY` - Unsplash API key

### Authentication
- `KEYCLOAK_ISSUER_URI` - Keycloak issuer URI
- `KEYCLOAK_JWK_SET_URI` - Keycloak JWK URI

## Frontend-Backend Integration

### API Client (`src/services/api.ts`)
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8084/api/slides',
});

// JWT authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const presentationAPI = { ... };
export const slideAPI = { ... };
export const versionAPI = { ... };
```

## Features

### Presentation Features
- ✅ Multiple slide layouts
- ✅ Rich text formatting
- ✅ Image/shape insertion
- ✅ Animations and transitions
- ✅ Master slides and themes
- ✅ Speaker notes
- ✅ Real-time collaboration
- ✅ Version history
- ✅ Export to PDF/PPTX

### Editing Features
- ✅ Drag-and-drop elements
- ✅ Text formatting toolbar
- ✅ Shape tools
- ✅ Image upload and search
- ✅ Alignment guides
- ✅ Copy/paste slides
- ✅ Undo/redo

### AI Features
- ✅ AI-powered design suggestions
- ✅ Image search via Unsplash
- ✅ Content generation with Ollama

### Collaboration Features
- ✅ Multi-user editing
- ✅ Live cursor positions
- ✅ Change notifications
- ✅ Comments and feedback
- ✅ Activity tracking

## Troubleshooting

### Backend won't start
1. Check if PostgreSQL is running: `docker ps`
2. Check if port 8084 is available
3. Check logs in console output

### Image upload fails
1. Check file size limits (10MB max)
2. Verify upload directory exists
3. Check permissions on upload directory

### AI features not working
1. Verify Ollama is running: `curl http://localhost:11434`
2. Check Unsplash API key is configured
3. Check logs for API errors

### Frontend can't connect to backend
1. Verify backend is running at http://localhost:8084
2. Check CORS configuration
3. Check browser console for errors

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8084/api/slides
- **Database**: localhost:5432

## Development Workflow

1. **Make backend changes** → Rebuild with `mvnw clean package` → Restart backend
2. **Make frontend changes** → Vite hot-reload automatically updates
3. **Database changes** → Update JPA entities → Hibernate auto-updates schema
4. **API changes** → Update both backend controller and frontend `api.ts`

## Summary

✅ **Backend**: Spring Boot 3.2.1 with presentation engine
✅ **Frontend**: React 19.2.0 with MS Office-style UI
✅ **Database**: PostgreSQL 15
✅ **Authentication**: Keycloak OAuth2/JWT
✅ **Real-time**: WebSocket collaboration
✅ **AI Integration**: Ollama + Unsplash
✅ **Export**: PDF and PowerPoint
✅ **Ready to use**: Just run `start-all.bat`!
