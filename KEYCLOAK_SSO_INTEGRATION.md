# Keycloak SSO Integration for Darevel Suite

## Overview

This document outlines the complete Keycloak Single Sign-On (SSO) integration architecture for the Darevel Suite ecosystem, consisting of 8 applications with unified authentication.

---

## 🌐 Domain Architecture

### Production Domains
```
darevel.com           → Suite (Main Dashboard - Entry Point)
auth.darevel.com      → Auth Service (Keycloak Gateway)
chat.darevel.com      → Chat Application
mail.darevel.com      → Mail Application
drive.darevel.com     → Drive Application
excel.darevel.com     → Excel Application
slides.darevel.com    → Slides Application
notify.darevel.com    → Notify Application
```

### Local Development Domains
```
darevel.local         → Suite (Port 3002)
auth.darevel.local    → Auth Service (Port 3005)
chat.darevel.local    → Chat (Port 3003)
mail.darevel.local    → Mail (Port 3004)
drive.darevel.local   → Drive (Port 3006)
excel.darevel.local   → Excel (Port 3001)
slides.darevel.local  → Slides (Port 3000)
notify.darevel.local  → Notify (Port 3007)
```

---

## 🔐 Authentication Flow

### High-Level SSO Flow

```
┌─────────────────────────────────────────────────┐
│          1. User visits darevel.local            │
│             (Suite - Main Entry)                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │  Session exists?     │
      └──────┬───────────────┘
             │
     ┌───────┴────────┐
     │ NO             │ YES
     ▼                ▼
┌─────────────┐  ┌─────────────────┐
│ Redirect to │  │ Show Dashboard  │
│ auth.local  │  │ with User Info  │
└──────┬──────┘  └─────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ auth.darevel.local forwards  │
│ to Keycloak Login Page       │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ User logs in via Keycloak    │
│ (localhost:8080)             │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Keycloak returns token       │
│ to auth service              │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Auth service creates         │
│ session cookie               │
│ Domain: .darevel.local       │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ Redirect back to Suite       │
│ Cookie shared across all     │
│ *.darevel.local subdomains   │
└──────────────────────────────┘
```

---

## 🏗️ Application Roles

| App       | Port | Auth Type                  | Description                                    |
|-----------|------|----------------------------|------------------------------------------------|
| **Suite** | 3002 | NextAuth Client + Gateway  | Main dashboard & SSO entry point               |
| **Auth**  | 3005 | NextAuth + Keycloak        | Centralized authentication service             |
| **Chat**  | 3003 | Protected (Bearer Token)   | Requires logged-in user session                |
| **Mail**  | 3004 | Protected (Bearer Token)   | Email management with Keycloak user ID         |
| **Drive** | 3006 | Protected (Bearer Token)   | File storage with ownership tracking           |
| **Excel** | 3001 | Optional Service Auth      | Spreadsheet app, workspace-based access        |
| **Slides**| 3000 | Optional Service Auth      | Presentation app, workspace-based access       |
| **Notify**| 3007 | Service-level Client       | Notification service, trusts Keycloak tokens   |

---

## 📋 Keycloak Configuration

### Realm Details
- **Realm Name**: `pilot180`
- **Display Name**: Pilot180 (Darevel Suite)
- **Keycloak Version**: 25.0.0
- **Database**: PostgreSQL 16

### Client Applications

#### 1. darevel-suite (Main Dashboard)
```json
{
  "clientId": "darevel-suite",
  "rootUrl": "http://darevel.local",
  "redirectUris": [
    "http://localhost:3002/*",
    "http://localhost:3002/api/auth/callback/keycloak",
    "http://darevel.local/*",
    "http://darevel.local/api/auth/callback/keycloak"
  ],
  "publicClient": false,
  "secret": "darevel-suite-secret-2025"
}
```

#### 2. darevel-auth (Auth Service)
```json
{
  "clientId": "darevel-auth",
  "rootUrl": "http://auth.darevel.local",
  "redirectUris": [
    "http://localhost:3005/*",
    "http://localhost:3005/api/auth/callback/keycloak",
    "http://auth.darevel.local/*",
    "http://auth.darevel.local/api/auth/callback/keycloak"
  ],
  "publicClient": false,
  "secret": "darevel-auth-secret-2025"
}
```

#### 3. darevel-chat
```json
{
  "clientId": "darevel-chat",
  "rootUrl": "http://chat.darevel.local",
  "secret": "darevel-chat-secret-2025"
}
```

#### 4. ai-email-assistant (Mail)
```json
{
  "clientId": "ai-email-assistant",
  "rootUrl": "http://mail.darevel.local",
  "secret": "darevel-mail-secret-2025"
}
```

#### 5. darevel-drive
```json
{
  "clientId": "darevel-drive",
  "rootUrl": "http://drive.darevel.local",
  "secret": "darevel-drive-secret-2025"
}
```

#### 6. darevel-excel
```json
{
  "clientId": "darevel-excel",
  "rootUrl": "http://excel.darevel.local",
  "secret": "darevel-excel-secret-2025"
}
```

#### 7. darevel-slides
```json
{
  "clientId": "darevel-slides",
  "rootUrl": "http://slides.darevel.local",
  "secret": "darevel-slides-secret-2025"
}
```

#### 8. darevel-notify
```json
{
  "clientId": "darevel-notify",
  "rootUrl": "http://notify.darevel.local",
  "secret": "darevel-notify-secret-2025"
}
```

### Demo Users
```
demo@darevel.com    / demo123  (Role: user)
admin@darevel.com   / admin123 (Roles: user, admin)
```

---

## 🔧 Infrastructure Components

### Nginx Reverse Proxy
- **Purpose**: Routes domain-based requests to correct application ports
- **Location**: `/nginx/nginx.conf`
- **Port**: 80 (HTTP)
- **Features**:
  - WebSocket support for Next.js HMR
  - CORS headers
  - Gzip compression

### Docker Services
- **Keycloak**: Port 8080 (Internal: 9000 for health checks)
- **PostgreSQL (Keycloak)**: Port 5432
- **PostgreSQL (Apps)**: Port 5433
- **Redis**: Port 6379
- **API Gateway**: Port 8081
- **Nginx**: Port 80

---

## 🔐 Session Management

### Cookie Configuration

```javascript
// NextAuth cookie settings for SSO
{
  name: "darevel-session",
  options: {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false, // true in production with HTTPS
    domain: ".darevel.local" // Enables sharing across all subdomains
  }
}
```

### Session Sharing Strategy

All apps under `*.darevel.local` share the same session cookie by setting:
```
domain: ".darevel.local"
```

This allows:
- **Single Login** → Access all apps
- **Single Logout** → Logout from all apps
- **No repeated authentication** across subdomains

---

## 📦 Environment Variables

### Suite App (.env.local)
```bash
NEXTAUTH_URL=http://darevel.local
NEXTAUTH_SECRET=wNeHmZtLNiKOgDFOi5pEPc74I/FzdRRKkZDXYckZHxUGOHVMMgettSGWErcjIDht
KEYCLOAK_CLIENT_ID=darevel-suite
KEYCLOAK_CLIENT_SECRET=darevel-suite-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
```

### Auth Service (.env.local)
```bash
NEXTAUTH_URL=http://auth.darevel.local
NEXTAUTH_SECRET=wNeHmZtLNiKOgDFOi5pEPc74I/FzdRRKkZDXYckZHxUGOHVMMgettSGWErcjIDht
KEYCLOAK_CLIENT_ID=darevel-auth
KEYCLOAK_CLIENT_SECRET=darevel-auth-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
```

### Chat App (.env.local)
```bash
NEXTAUTH_URL=http://chat.darevel.local
NEXTAUTH_SECRET=wNeHmZtLNiKOgDFOi5pEPc74I/FzdRRKkZDXYckZHxUGOHVMMgettSGWErcjIDht
KEYCLOAK_CLIENT_ID=darevel-chat
KEYCLOAK_CLIENT_SECRET=darevel-chat-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
```

### Mail App (.env.local)
```bash
NEXTAUTH_URL=http://mail.darevel.local
NEXTAUTH_SECRET=wNeHmZtLNiKOgDFOi5pEPc74I/FzdRRKkZDXYckZHxUGOHVMMgettSGWErcjIDht
KEYCLOAK_CLIENT_ID=ai-email-assistant
KEYCLOAK_CLIENT_SECRET=darevel-mail-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
```

### Drive App (.env.local)
```bash
NEXTAUTH_URL=http://drive.darevel.local
NEXTAUTH_SECRET=wNeHmZtLNiKOgDFOi5pEPc74I/FzdRRKkZDXYckZHxUGOHVMMgettSGWErcjIDht
KEYCLOAK_CLIENT_ID=darevel-drive
KEYCLOAK_CLIENT_SECRET=darevel-drive-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
```

### Excel App (.env.local)
```bash
NEXTAUTH_URL=http://excel.darevel.local
NEXTAUTH_SECRET=wNeHmZtLNiKOgDFOi5pEPc74I/FzdRRKkZDXYckZHxUGOHVMMgettSGWErcjIDht
KEYCLOAK_CLIENT_ID=darevel-excel
KEYCLOAK_CLIENT_SECRET=darevel-excel-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
```

### Slides App (.env.local)
```bash
NEXTAUTH_URL=http://slides.darevel.local
NEXTAUTH_SECRET=wNeHmZtLNiKOgDFOi5pEPc74I/FzdRRKkZDXYckZHxUGOHVMMgettSGWErcjIDht
KEYCLOAK_CLIENT_ID=darevel-slides
KEYCLOAK_CLIENT_SECRET=darevel-slides-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
```

### Notify App (.env.local)
```bash
NEXTAUTH_URL=http://notify.darevel.local
NEXTAUTH_SECRET=wNeHmZtLNiKOgDFOi5pEPc74I/FzdRRKkZDXYckZHxUGOHVMMgettSGWErcjIDht
KEYCLOAK_CLIENT_ID=darevel-notify
KEYCLOAK_CLIENT_SECRET=darevel-notify-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
```

---

## 🚀 Setup Instructions

### 1. Configure Local DNS
Add these entries to `/etc/hosts`:

```bash
127.0.0.1 darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 notify.darevel.local
127.0.0.1 api.darevel.local
127.0.0.1 keycloak.darevel.local
```

### 2. Start Infrastructure Services
```bash
docker-compose up -d postgres keycloak redis postgres-app nginx
```

### 3. Verify Keycloak
```bash
curl http://localhost:8080/realms/pilot180/.well-known/openid-configuration
```

### 4. Start Application Services
```bash
cd apps/suite && npm run dev &
cd apps/auth && npm run dev &
cd apps/chat && npm run dev &
cd apps/mail && npm run dev &
cd apps/drive && npm run dev &
cd apps/excel && npm run dev &
cd apps/slides && npm run dev &
cd apps/notify && npm run dev &
```

### 5. Test SSO Flow
1. Open browser to `http://darevel.local`
2. You should be redirected to `http://auth.darevel.local`
3. Login with `demo@darevel.com` / `demo123`
4. After login, you should be redirected back to Suite
5. Navigate to `http://chat.darevel.local` - you should be automatically logged in
6. Navigate to `http://mail.darevel.local` - you should be automatically logged in

---

## 🛡️ Security Considerations

### Current Setup (Development)
- **HTTP Only**: Using HTTP for local development
- **Shared Secret**: Same `NEXTAUTH_SECRET` across all apps for session sharing
- **Public Keycloak**: Accessible on localhost:8080

### Production Recommendations
1. **HTTPS Everywhere**: Use SSL/TLS certificates
2. **Secure Cookies**: Set `secure: true` in cookie options
3. **Private Keycloak**: Place Keycloak behind VPN or firewall
4. **Rotate Secrets**: Use different secrets for each environment
5. **CORS Policies**: Restrict CORS to known domains
6. **Rate Limiting**: Implement rate limiting on auth endpoints
7. **Session Timeout**: Configure appropriate session timeouts
8. **MFA**: Enable multi-factor authentication in Keycloak
9. **Audit Logs**: Enable Keycloak audit logs
10. **Secret Management**: Use environment-specific secrets (not committed to git)

---

## 🔍 Troubleshooting

### Session Not Shared Across Apps
**Problem**: Login in Suite, but Chat requires re-login

**Solution**:
1. Verify cookie domain is set to `.darevel.local`
2. Check that all apps use the same `NEXTAUTH_SECRET`
3. Ensure all apps are accessed via `*.darevel.local` (not localhost:PORT)
4. Clear browser cookies and try again

### Redirect Loop
**Problem**: Redirects between suite and auth infinitely

**Solution**:
1. Check `NEXTAUTH_URL` is correct in both apps
2. Verify Keycloak redirect URIs include both localhost:PORT and domain
3. Clear browser cookies
4. Check Keycloak client configuration

### CORS Errors
**Problem**: Browser blocks requests due to CORS

**Solution**:
1. Verify Nginx `proxy_set_header` includes correct origins
2. Check Keycloak client's `webOrigins` includes requesting domain
3. Ensure API Gateway CORS configuration includes all app domains

### Keycloak Connection Refused
**Problem**: Apps can't connect to Keycloak

**Solution**:
1. Verify Keycloak is running: `docker ps | grep keycloak`
2. Check health: `curl http://localhost:8080/health/ready`
3. Verify `KEYCLOAK_ISSUER` URL is correct
4. Check docker network connectivity

---

## 📚 API Endpoints

### Keycloak Endpoints
```
# OpenID Configuration
GET http://localhost:8080/realms/pilot180/.well-known/openid-configuration

# Token Endpoint
POST http://localhost:8080/realms/pilot180/protocol/openid-connect/token

# User Info
GET http://localhost:8080/realms/pilot180/protocol/openid-connect/userinfo

# JWKS (Public Keys)
GET http://localhost:8080/realms/pilot180/protocol/openid-connect/certs

# Logout
POST http://localhost:8080/realms/pilot180/protocol/openid-connect/logout
```

### NextAuth Endpoints (All Apps)
```
# Sign In
GET /api/auth/signin

# Sign Out
GET /api/auth/signout

# Session
GET /api/auth/session

# Callback
GET /api/auth/callback/keycloak

# CSRF Token
GET /api/auth/csrf
```

---

## 📊 Testing Checklist

- [ ] User can login at `darevel.local`
- [ ] Session persists when navigating to `chat.darevel.local`
- [ ] Session persists when navigating to `mail.darevel.local`
- [ ] Session persists when navigating to `drive.darevel.local`
- [ ] Session persists when navigating to `excel.darevel.local`
- [ ] Session persists when navigating to `slides.darevel.local`
- [ ] Session persists when navigating to `notify.darevel.local`
- [ ] Logout from Suite logs out from all apps
- [ ] Session expiry works correctly
- [ ] Token refresh works without re-login
- [ ] Protected API endpoints require valid JWT
- [ ] Invalid/expired tokens are rejected
- [ ] Admin role can access admin-only features
- [ ] Regular user cannot access admin features

---

## 📖 Next Steps

### Phase 1: Complete NextAuth Integration
- [ ] Update Suite app with NextAuth configuration
- [ ] Update Auth service with proper middleware
- [ ] Implement session cookie sharing
- [ ] Add authentication guards to protected routes

### Phase 2: Integrate All Apps
- [ ] Add NextAuth to Chat app
- [ ] Add NextAuth to Mail app
- [ ] Add NextAuth to Drive app
- [ ] Add NextAuth to Excel app
- [ ] Add NextAuth to Slides app
- [ ] Add NextAuth to Notify app

### Phase 3: API Protection
- [ ] Configure API Gateway JWT validation
- [ ] Add JWT middleware to backend services
- [ ] Implement role-based access control (RBAC)
- [ ] Add service-to-service authentication

### Phase 4: Production Readiness
- [ ] Enable HTTPS
- [ ] Configure production Keycloak
- [ ] Set up secret management
- [ ] Enable audit logging
- [ ] Configure backup/recovery
- [ ] Load testing
- [ ] Security audit

---

## 🤝 Support

For questions or issues:
1. Check Keycloak logs: `docker logs darevel_keycloak`
2. Check app logs: `npm run dev` output
3. Review Nginx logs: `docker logs darevel_nginx`
4. Verify configuration in this document

---

**Last Updated**: 2025-11-11
**Version**: 1.0.0
**Maintainer**: Darevel Team
