# Darevel Mail - Backend Setup Guide

## Overview

The Darevel Mail application consists of:
- **Frontend**: React 19.2.0 + Vite (Port 3008)
- **Backend**: Spring Boot 3.2.1 + Java 17 (Port 8083)
- **Database**: PostgreSQL 15 (Port 5432)
- **Mail Server**: Dovecot IMAP + Postfix SMTP

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React App     │ ───────>│  Spring Boot API │ ───────>│   PostgreSQL    │
│   Port 3008     │  HTTP   │    Port 8083     │  JDBC   │   Port 5432     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     ├─────> Dovecot IMAP (Port 143)
                                     └─────> Postfix SMTP (Port 25)
```

## Prerequisites

1. **Java 17** - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/#java17) or use OpenJDK
2. **Maven 3.8+** - Included via Maven Wrapper (`mvnw`)
3. **Docker Desktop** - For running PostgreSQL and mail servers
4. **Node.js 18+** - For the frontend
5. **Keycloak** (Optional) - For authentication

## Quick Start

### Option 1: Run Everything (Coming Soon)

```bash
# From apps/mail directory
start-all.bat
```

### Option 2: Run Components Separately

#### Start Backend Only
```bash
# From apps/mail directory
start-backend.bat
```

#### Start Frontend Only
```bash
# From apps/mail directory
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
cd backend/mail-service
mvnw clean package -DskipTests
```

#### 3. Run Backend

```bash
java -jar target/mail-service.jar
```

#### 4. Start Frontend

```bash
# From apps/mail directory
npm install
npm run dev
```

## Configuration

### Backend Configuration (`application.yml`)

```yaml
server:
  port: 8083

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/darevel_mail
    username: postgres
    password: postgres

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/darevel

# Mail Server Configuration
imap:
  host: localhost
  port: 143
  ssl: false

mail:
  domain: darevel.local
```

### Frontend Configuration (`vite.config.ts`)

```typescript
server: {
  port: 3008,
  proxy: {
    '/api': {
      target: 'http://localhost:8083',
      changeOrigin: true,
    },
  },
}
```

## API Endpoints

### Email Operations
```
GET    /api/emails/folder/{folder}     - Get emails by folder
GET    /api/emails/{id}                - Get specific email
POST   /api/emails/send                - Send email
DELETE /api/emails/{id}                - Delete email
POST   /api/emails/{id}/move           - Move email to folder
```

### Folder Operations
```
GET    /api/folders                    - List all folders
POST   /api/folders                    - Create folder
PUT    /api/folders/{id}               - Update folder
DELETE /api/folders/{id}               - Delete folder
```

### Draft Operations
```
GET    /api/drafts                     - List drafts
POST   /api/drafts                     - Save draft
PUT    /api/drafts/{id}                - Update draft
DELETE /api/drafts/{id}                - Delete draft
```

### Calendar/Meeting Operations
```
GET    /api/meetings                   - List meetings
POST   /api/meetings                   - Create meeting
PUT    /api/meetings/{id}              - Update meeting
DELETE /api/meetings/{id}              - Delete meeting
```

## Environment Variables

### Database
- `PGHOST` - Database host (default: localhost)
- `PGPORT` - Database port (default: 5432)
- `PGDATABASE` - Database name (default: darevel_mail)
- `PGUSER` - Database user (default: postgres)
- `PGPASSWORD` - Database password (default: postgres)

### Server
- `SERVER_PORT` - Backend port (default: 8083)

### Mail Server
- `IMAP_HOST` - IMAP server host (default: localhost)
- `IMAP_PORT` - IMAP port (default: 143)
- `SMTP_HOST` - SMTP server host (default: localhost)
- `SMTP_PORT` - SMTP port (default: 1025)
- `MAIL_DOMAIN` - Mail domain (default: darevel.local)

### Authentication
- `KEYCLOAK_ISSUER_URI` - Keycloak issuer URI
- `KEYCLOAK_JWK_SET_URI` - Keycloak JWK URI

### Jitsi (Video Calls)
- `JITSI_DOMAIN` - Jitsi server domain
- `JITSI_PORT` - Jitsi port (default: 8000)
- `JITSI_APP_ID` - Jitsi app ID
- `JITSI_SECRET` - Jitsi secret key

## Frontend-Backend Integration

### API Client (`src/services/api.ts`)
```typescript
const client = axios.create({
  baseURL: '/api',
});

// JWT authentication
client.interceptors.request.use((config) => {
  const token = window.keycloak?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Database Schema

Tables:
- `emails` - Email messages
- `folders` - Mail folders
- `drafts` - Draft emails
- `meetings` - Calendar meetings
- `contacts` - User contacts
- `attachments` - Email attachments

## Mail Server Setup

The Mail application integrates with:
- **Dovecot** - IMAP server for receiving mail
- **Postfix** - SMTP server for sending mail

Docker services are configured in `docker-compose.yml` and `docker-compose.services.yml`.

## Troubleshooting

### Backend won't start
1. Check if PostgreSQL is running: `docker ps`
2. Check if port 8083 is available
3. Check logs in console output

### Mail server connection issues
1. Verify Dovecot is running: `docker ps | grep dovecot`
2. Test IMAP connection: `telnet localhost 143`
3. Check mail server logs

### Frontend can't connect to backend
1. Verify backend is running at http://localhost:8083
2. Check CORS configuration
3. Check browser console for errors

## Access Points

- **Frontend**: http://localhost:3008
- **Backend API**: http://localhost:8083/api
- **Database**: localhost:5432
- **IMAP**: localhost:143
- **SMTP**: localhost:25

## Summary

✅ **Backend**: Spring Boot 3.2.1 with mail integration
✅ **Frontend**: React 19.2.0 with Vite
✅ **Database**: PostgreSQL 15
✅ **Mail Servers**: Dovecot + Postfix
✅ **Authentication**: Keycloak OAuth2/JWT
✅ **Video Calls**: Jitsi integration
