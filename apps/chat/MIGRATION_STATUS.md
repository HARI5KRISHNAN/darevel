# Chat App Migration Status - Node.js to Java/Spring Boot

## Overview

The chat app backend has been **partially migrated** from Node.js/Express to Java/Spring Boot microservices.

## What's Working ✅

### 1. Authentication (Port 8081)
- ✅ User registration
- ✅ User login
- ✅ JWT token generation
- ✅ User management

**Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/users`
- `GET /api/auth/users/{id}`

### 2. Chat (Port 8082)
- ✅ Send messages
- ✅ Get messages by channel
- ✅ Delete messages
- ✅ Basic WebSocket support (Spring WebSocket)

**Endpoints:**
- `GET /api/chat/{channelId}/messages`
- `POST /api/chat/{channelId}/messages`
- `DELETE /api/chat/messages`
- `WS /ws` - WebSocket endpoint

### 3. Permissions (Port 8083)
- ✅ Ansible-based permission management
- ✅ Member management
- ✅ Role updates

**Endpoints:**
- `POST /api/permissions/update`
- `GET /api/permissions/members`
- `POST /api/permissions/members`
- `PUT /api/permissions/members/role`
- `DELETE /api/permissions/members/{id}`

## What's Missing ❌

The following features from the old Node.js backend are **NOT yet implemented** in the Java backend:

### 1. Kubernetes Pod Management
- ❌ `/api/pods` - List and manage pods
- ❌ Pod metrics and monitoring
- ❌ Pod status updates
- ❌ Real-time pod updates via Socket.IO

### 2. Alerts System
- ❌ `/api/alerts` - Pod alerts
- ❌ Alert acknowledgment
- ❌ Alert notifications

### 3. Incidents Management
- ❌ `/api/incidents` - Incident tracking
- ❌ Incident creation and updates
- ❌ Incident resolution

### 4. AI Integration
- ❌ `/api/ai/summary` - AI-powered summaries
- ❌ Meeting transcript analysis
- ❌ Alert analysis

### 5. Email Service
- ❌ `/api/email` - Email management
- ❌ Calendar events
- ❌ Meeting scheduling

### 6. Auto-Healing
- ❌ `/api/autoheal` - Automatic pod healing
- ❌ Healing logs and history

## Frontend Changes

### Updated Files:
1. **`apps/chat/.env`** - Added microservice URLs
2. **`apps/chat/services/api.ts`** - Updated to use separate microservice endpoints
3. **`apps/chat/components/PodAlertsPanel.tsx`** - Disabled (alerts API not available)
4. **`apps/chat/hooks/useRealTimeK8s.ts`** - Disabled (Socket.IO not available)

### What Works in Frontend:
- ✅ User authentication (login/register)
- ✅ Chat messaging
- ✅ Basic permissions management

### What's Disabled in Frontend:
- ⚠️ Kubernetes pod monitoring
- ⚠️ Pod alerts panel
- ⚠️ Real-time K8s updates
- ⚠️ AI summaries
- ⚠️ Email integration
- ⚠️ Incident management

## Running the Application

### Start Java Backend:
```bash
cd apps/chat/backend-java
npm install
npm run dev
```

This starts:
- Auth Service on port 8081
- Chat Service on port 8082
- Permissions Service on port 8083
- PostgreSQL database
- Prometheus (port 9090)
- Grafana (port 3001)

### Start Frontend:
```bash
cd apps/chat
npm run dev
```

Frontend runs on: `http://localhost:3003`

## Next Steps

### Option 1: Complete Migration (Recommended)
Implement missing features in Java backend:
1. Add Kubernetes client integration
2. Implement alerts API
3. Add AI service integration
4. Migrate email/calendar features
5. Implement auto-healing logic

### Option 2: Hybrid Approach
Keep both backends running:
- Java backend for auth, chat, permissions
- Node.js backend for K8s monitoring, alerts, AI

### Option 3: Mock Missing Features
Create mock implementations for missing features to allow frontend development to continue.

## Configuration

### Environment Variables (`.env` file):
```env
VITE_AUTH_SERVICE_URL=http://localhost:8081
VITE_CHAT_SERVICE_URL=http://localhost:8082
VITE_PERMISSIONS_SERVICE_URL=http://localhost:8083
VITE_WEBSOCKET_URL=http://localhost:8082
```

## Known Issues

1. **CORS Errors**: May need to configure CORS in Java services if accessing from different domains
2. **WebSocket Protocol**: Frontend uses Socket.IO, backend uses Spring WebSocket - needs migration
3. **Response Format**: Java backend wraps responses in `ApiResponse<T>` format
4. **Missing Features**: Many Kubernetes and monitoring features not implemented

## Testing

### Test Auth Service:
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Test Chat Service:
```bash
curl http://localhost:8082/api/chat/general/messages
```

### Test Health:
```bash
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
curl http://localhost:8083/actuator/health
```

## Migration Progress: 30%

- ✅ Auth Service (100%)
- ✅ Chat Service (80% - WebSocket needs migration)
- ✅ Permissions Service (100%)
- ❌ Kubernetes Integration (0%)
- ❌ Alerts System (0%)
- ❌ AI Integration (0%)
- ❌ Email Service (0%)
- ❌ Incidents Management (0%)
