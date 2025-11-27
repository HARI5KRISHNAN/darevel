# Darevel SSO Setup Guide

## Overview

This guide explains how to set up and test the Keycloak SSO integration across all Darevel applications.

## Architecture

```
                    ┌─────────────────────────────┐
                    │     Keycloak (8180)         │
                    │     Realm: darevel          │
                    └─────────────┬───────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
   React Apps              Next.js Apps              Spring Boot APIs
   (keycloak-js)           (NextAuth)               (OAuth2 Resource Server)
        │                         │                         │
   ┌────┴────┐               ┌────┴────┐               ┌────┴────┐
   │ Chat    │               │ Slides  │               │ Auth    │
   │ (3003)  │               │ (3000)  │               │ (8081)  │
   ├─────────┤               ├─────────┤               ├─────────┤
   │ Mail    │               │ Suite   │               │ Mail    │
   │ (3008)  │               │ (3002)  │               │ (8081)  │
   ├─────────┤               └─────────┘               ├─────────┤
  │ Sheet   │                                         │ Sheet   │
   │ (3004)  │                                         │ (8083)  │
   └─────────┘                                         └─────────┘
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- Java 17+ and Maven (for backends)

## Quick Start

### 1. Start Infrastructure (Keycloak + PostgreSQL)

```bash
cd infrastructure
docker-compose up -d
```

Wait for Keycloak to start (~30-60 seconds). Check status:
```bash
docker ps -a --filter name=darevel
```

### 2. Verify Keycloak is Running

- Open http://localhost:8180
- Login with: `admin` / `admin`
- Verify the `darevel` realm exists with 5 clients

### 3. Install Frontend Dependencies

```bash
# From project root
npm install
```

### 4. Start All Frontend Apps

```bash
npm run dev
```

Or start individually:
```bash
cd apps/chat && npm run dev
cd apps/mail && npm run dev
cd apps/sheet && npm run dev
cd apps/slides && npm run dev
cd apps/suite && npm run dev
```

### 5. Start Backends (Optional - for full functionality)

```bash
# Chat/Auth service
cd apps/chat/backend-java
mvn spring-boot:run -pl auth-service

# Mail service
cd apps/mail/backend/mail-service
mvn spring-boot:run

# Sheet service
cd apps/sheet/backend
mvn spring-boot:run
```

## Test Users

Pre-configured test users (all passwords: `password`):

| Username | Email | Roles |
|----------|-------|-------|
| alice | alice@darevel.local | user |
| bob | bob@darevel.local | user |
| admin | admin@darevel.local | user, admin |

## Testing SSO Flow

### Test 1: Suite App SSO

1. Open http://localhost:3002
2. Click "Sign in with Keycloak"
3. Login with `alice` / `password`
4. Verify redirect to dashboard

### Test 2: Cross-App SSO

1. While logged into Suite (from Test 1)
2. Open http://localhost:3003 (Chat)
3. Should auto-login via SSO (same session)
4. Open http://localhost:3008 (Mail) - should also be logged in

### Test 3: Slides App SSO

1. Open http://localhost:3000/login
2. Click "Sign in with Darevel SSO"
3. Should use existing Keycloak session

### Test 4: Logout Flow

1. Logout from any app
2. Verify logout from Keycloak
3. Other apps should require re-login

## Troubleshooting

### Keycloak Won't Start

```bash
# Check logs
docker logs darevel-keycloak

# Restart
docker-compose down && docker-compose up -d
```

### CORS Errors

Ensure Keycloak clients have correct Web Origins configured:
- darevel-chat: http://localhost:3003
- darevel-mail: http://localhost:3008
- darevel-sheet: http://localhost:3004
- darevel-slides: http://localhost:3000
- darevel-suite: http://localhost:3002

### Token Validation Errors

Check backend application.yml has correct issuer-uri:
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/darevel
```

## Port Reference

| Service | Port |
|---------|------|
| Keycloak | 8180 |
| PostgreSQL | 5432 |
| Chat Frontend | 3003 |
| Mail Frontend | 3008 |
| Sheet Frontend | 3004 |
| Slides Frontend | 3000 |
| Suite Frontend | 3002 |
| Auth Service | 8081 |
| Chat Service | 8082 |
| Sheet Service | 8083 |

## Security Notes

- All client secrets are development-only values
- Change `NEXTAUTH_SECRET` in production
- Use HTTPS in production
- Configure proper CORS origins for production domains
