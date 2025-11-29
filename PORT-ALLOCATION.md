# Darevel Platform - Port Allocation Reference

**Last Updated:** November 28, 2025

## Quick Reference Table

| Service | Type | Port(s) | Protocol | Status |
|---------|------|---------|----------|--------|
| **Slides Frontend** | Frontend | 3000 | HTTP | Active |
| **Suite Frontend** | Frontend | 3002 | HTTP | Active |
| **Chat Frontend** | Frontend | 3003 | HTTP | Active |
| **Sheet Frontend** | Frontend | 3004 | HTTP | Active |
| **Form Frontend** | Frontend | **3005** | HTTP | **NEW** |
| **Dashboard Frontend** | Frontend | **3007** | HTTP | **NEW** |
| **Mail Frontend** | Frontend | 3008 | HTTP | Active |
| **Docs Frontend** | Frontend | 3009 | HTTP | Active |
| **Wiki Frontend** | Frontend | **3010** | HTTP | **NEW** |
| **Workflow Frontend** | Frontend | **3006** | HTTP | **NEW** |
| **Notification Frontend** | Frontend | **3011** | HTTP | **NEW** |
| **Keycloak** | Auth | 8180 | HTTP | Active |
| **Chat Service** | Backend | 8082 | HTTP | Active |
| **Mail Backend** | Backend | 8083 | HTTP | Active |
| **Slides Backend** | Backend | 8084 | HTTP | Active |
| **Suite Backend** | Backend | 8085 | HTTP | Active |
| **Docs Backend** | Backend | 8087 | HTTP | Active |
| **Sheet Backend** | Backend | 8089 | HTTP | Active |
| **Dashboard Backend** | Backend | **9410** | HTTP | **NEW** |
| **Notification Service** | Backend | **9495** | HTTP | **NEW** |
| **Form Service** | Backend | **8090** | HTTP | **NEW** |
| **Response Service** | Backend | **8091** | HTTP | **NEW** |
| **Public Link Service** | Backend | **8092** | HTTP | **Planned** |
| **Analytics Service** | Backend | **8093** | HTTP | **Planned** |
| **AI Form Service** | Backend | **8094** | HTTP | **Planned** |
| **Wiki Space Service** | Backend | **8100** | HTTP | **Planned** |
| **Wiki Page Service** | Backend | **8101** | HTTP | **Planned** |
| **Wiki Content Service** | Backend | **8102** | HTTP | **Planned** |
| **Wiki Comment Service** | Backend | **8103** | HTTP | **Planned** |
| **Wiki Version Service** | Backend | **8104** | HTTP | **Planned** |
| **Wiki Search Service** | Backend | **8105** | HTTP | **Planned** |
| **Wiki Attachment Service** | Backend | **8106** | HTTP | **Planned** |
| **Wiki Presence Service** | Backend | **8107** | HTTP | **Planned** |
| **Workflow Designer Service** | Backend | **9401** | HTTP | **NEW** |
| **Workflow Engine Service** | Backend | **9402** | HTTP | **NEW** |
| **Workflow Trigger Gateway** | Backend | **9403** | HTTP | **NEW** |
| **Workflow Connector Service** | Backend | **9404** | HTTP | **NEW** |
| **Workflow Run Service** | Backend | **9405** | HTTP | **NEW** |
| **Workflow Connections Service** | Backend | **9406** | HTTP | **NEW** |
| **Workflow Template Service** | Backend | **9407** | HTTP | **NEW** |
| **Workflow Quota Service** | Backend | **9408** | HTTP | **NEW** |
| **Postgres (Keycloak)** | Database | 5433 | TCP | Active |
| **Postgres (Slides)** | Database | 5435 | TCP | Active |
| **Postgres (Suite)** | Database | 5436 | TCP | Active |
| **Postgres (Mail)** | Database | 5437 | TCP | Active |
| **Postgres (Sheet)** | Database | 5438 | TCP | Active |
| **Postgres (Docs)** | Database | 5439 | TCP | Active |
| **Postgres (Form)** | Database | **5440** | TCP | **NEW** |
| **Postgres (Wiki)** | Database | **5441** | TCP | **NEW** |
| **Postgres (Workflow)** | Database | **5442** | TCP | **NEW** |
| **Postgres (Dashboard)** | Database | **5443** | TCP | **NEW** |
| **Postgres (Notification)** | Database | **5445** | TCP | **NEW** |
| **Jitsi Meet** | Video | 8000 | HTTP | Active |
| **Jitsi JVB** | Video | 10000 | UDP | Active |
| **Prometheus** | Monitoring | 9090 | HTTP | Active |
| **Grafana** | Monitoring | 3001 | HTTP | Active |
| **Dashboard Cache (Redis)** | Cache | **6379** | TCP | **NEW** |
| **Notification Cache (Redis)** | Cache | **6385** | TCP | **NEW** |
| **MailHog SMTP** | Mail | 1025 | SMTP | Active |
| **MailHog Web** | Mail | 8025 | HTTP | Active |
| **Ollama** | AI | 11434 | HTTP | Active |
| **Elasticsearch (Wiki Search)** | Search | **9225** | HTTP | **Planned** |
| **MinIO (Wiki Attachments)** | Storage | **9500** | HTTP | **Planned** |

---

## Frontend Applications (3000-3099)

### Active
- **3000** - Slides Frontend (Vite dev server)
- **3001** - Grafana (Monitoring UI)
- **3002** - Suite Frontend (Next.js)
- **3003** - Chat Frontend (Vite dev server)
- **3004** - Sheet Frontend (Vite dev server)
- **3005** - **Form Frontend (Vite dev server)** ✨ NEW
- **3006** - **Workflow Frontend (Vite dev server)** ✨ NEW
- **3007** - **Dashboard Frontend (Vite dev server)** ✨ NEW
- **3008** - Mail Frontend (Vite dev server)
- **3009** - Docs Frontend (Vite dev server)
- **3010** - **Wiki Frontend (Vite dev server)** ✨ NEW
- **3011** - **Notification Center Frontend (Vite dev server)** ✨ NEW

### Reserved for Future Use
- **3011-3099** - Available

---

## Backend Services (8000-8999)

### Infrastructure (8000-8199)
- **8000** - Jitsi Meet Web Interface
- **8025** - MailHog Web UI
- **8180** - Keycloak Authentication Server

### Application Backends (8080-8099)
- **8082** - Chat Service
- **8083** - Mail Backend Service
- **8084** - Slides Backend Service
- **8085** - Suite Backend Service
- **8087** - Docs Backend Service
- **8089** - Sheet Backend Service
- **8090** - **Form Service** ✨ NEW
- **8091** - **Response Service** ✨ NEW
- **8092** - **Public Link Service** (Planned)
- **8093** - **Analytics Service** (Planned)
- **8094** - **AI Form Service** (Planned)
- **8100** - **Wiki Space Service** (Planned)
- **8101** - **Wiki Page Service** (Planned)
- **8102** - **Wiki Content Service** (Planned)
- **8103** - **Wiki Comment Service** (Planned)
- **8104** - **Wiki Version Service** (Planned)
- **8105** - **Wiki Search Service** (Planned)
- **8106** - **Wiki Attachment Service** (Planned)
- **8107** - **Wiki Presence Service** (Optional)
- **8095-8099** and **8108-8199** - Available

### Chat Microservices (8080-8089)
- **8081** - Chat Auth Service (mapped from 8086)
- **8083** - Chat Permissions Service
- **8084** - Chat Kubernetes Service
- **8085** - Chat Alerts Service
- **8086** - Chat Incidents Service
- **8087** - Chat AI Service
- **8088** - Chat Email Service
- **8089** - Chat Docker Service

### Workflow Automation Cluster (9400-9499)
- **9401** - Workflow Designer Service (workflow definitions CRUD)
- **9402** - Workflow Engine Service (run orchestration)
- **9403** - Workflow Trigger Gateway (webhook/schedule ingress)
- **9404** - Workflow Connector Service (action/trigger catalog)
- **9405** - Workflow Run Service (logs, analytics, dashboards)
- **9406** - Workflow Connections Service (credential vault)
- **9407** - Workflow Template Service (blueprints + AI assists)
- **9408** - Workflow Quota Service (usage enforcement)
  - **9409-9499** - Available for future Workflow expansion (AI workers, webhooks, etc.)

### Dashboard Aggregation Service (9410)
- **9410** - Dashboard Service (Spring Boot dashboard-service, aggregates suite metrics)
  - Bridges data from chat/mail/sheet/slides backends through Feign clients
  - Shares the host Docker network with its Postgres (5443) and Redis (6379) companions

### Notification Service (9495)
- **9495** - Notification Service (Spring Boot notification-service)
  - Consumes Redis pub/sub channels (`events.chat`, `events.mail`, etc.) and stores per-user events in Postgres (5445)
  - Exposes REST endpoints for feeds, unread counters, and preferences plus WebSocket broadcasting via `/ws/notifications`
  - Ships with local Redis cache on port 6385 and Flyway migrations for `notifications` + `notification_preferences`

---

## Databases (5432-5499)

### PostgreSQL Instances
- **5432** - Shared PostgreSQL (darevel-postgres-shared)
- **5433** - Keycloak Database (darevel-postgres-infra)
- **5435** - Slides Database (darevel-postgres-slides)
- **5436** - Suite Database (darevel-postgres-suite)
- **5437** - Mail Database (darevel-postgres-mail)
- **5438** - Sheet Database (darevel-postgres-sheet)
- **5439** - Docs Database (darevel-postgres-docs)
- **5440** - **Form Database (darevel-postgres-form)** ✨ NEW
  - Contains: `darevel_form`, `darevel_form_response`
- **5441** - **Wiki Database (darevel-postgres-wiki)** ✨ NEW
  - Contains: `wiki_space`, `wiki_page`, `wiki_content`, `wiki_comment`, `wiki_version`
- **5442** - **Workflow Database (darevel-postgres-workflow)** ✨ NEW
  - Contains: `workflow_designer`, `workflow_engine`, `workflow_runs`, `workflow_connections`, `workflow_connector`, `workflow_template`, `workflow_quota`
- **5443** - **Dashboard Database (darevel-postgres-dashboard)** ✨ NEW
  - Contains: `dashboard_user_configs`, `dashboard_team_configs`, Flyway history
- **5445** - **Notification Database (darevel-postgres-notification)** ✨ NEW
  - Contains: `notifications`, `notification_preferences`
- **5446-5499** - Available

---

## Mail Services (1000-2999)

- **25** - Postfix SMTP (Production)
- **143** - Dovecot IMAP
- **587** - Postfix Submission
- **993** - Dovecot IMAPS
- **1025** - MailHog SMTP (Testing)
- **2525** - Mail Backend SMTP Receiver
- **8891** - OpenDKIM Service

---

## Video Conferencing (Jitsi)

- **8000** - Jitsi Meet Web Interface
- **10000/UDP** - Jitsi Video Bridge (JVB)
- **5222** - Jitsi Prosody XMPP (internal)
- **5280** - Jitsi Prosody BOSH (internal)
- **5347** - Jitsi Prosody Component (internal)

---

## Monitoring & Observability

- **3001** - Grafana Dashboard (mapped from 3000)
- **9090** - Prometheus Metrics Collection
- **5001** - Chat Backend (Node.js alternative)

---

## AI Services

- **11434** - Ollama Local LLM Server

---

## Form Application Details ✨ NEW

### Frontend (Port 3005)
```
Location: apps/form/frontend/
Framework: React 19 + Vite 6
Access: http://localhost:3005
```

### Backend Services

#### Form Service (Port 8090)
```
Location: apps/form/backend/form-service/
Framework: Spring Boot 3.2.1 + Java 17
Purpose: Form management, fields, sections, logic
Database: darevel_form (port 5440)
API Docs: http://localhost:8090/swagger-ui.html
Health: http://localhost:8090/actuator/health
```

#### Response Service (Port 8091)
```
Location: apps/form/backend/response-service/
Framework: Spring Boot 3.2.1 + Java 17
Purpose: Submissions, answers, exports
Database: darevel_form_response (port 5440)
API Docs: http://localhost:8091/swagger-ui.html
Health: http://localhost:8091/actuator/health
```

#### Public Link Service (Port 8092) - Planned
```
Purpose: Anonymous form access via /f/{publicId}
Framework: Spring Boot 3 + WebFlux (reactive)
```

#### Analytics Service (Port 8093) - Planned
```
Purpose: Real-time analytics and aggregation
Framework: Spring Boot 3 + Java 17
Database: PostgreSQL/ClickHouse
```

#### AI Form Service (Port 8094) - Planned
```
Purpose: AI-powered form generation
Framework: Spring Boot 3 + Java 17
AI Provider: Google Generative AI (Gemini)
```

### Database (Port 5440)
```
Container: darevel-postgres-form
Databases:
  - darevel_form (Form Service)
  - darevel_form_response (Response Service)
Access: localhost:5440
User: postgres
Password: postgres
```

## Workflow Application Details ✨ NEW

### Frontend (Port 3006)
```
Location: apps/workflow/
Framework: React 19 + Vite 6
Access: http://localhost:3006 (configurable via WORKFLOW_FRONTEND_PORT)
```

### Backend Microservices (Ports 9401-9408)

| Port | Service | Responsibility |
|------|---------|----------------|
| 9401 | Designer Service | Workflow definition CRUD, validation, versioning |
| 9402 | Engine Service | Executes workflow runs, action orchestration, emits run events |
| 9403 | Trigger Gateway | Authenticates inbound webhooks/schedules, pushes `workflow.triggers` events |
| 9404 | Connector Service | Manages connector manifests and capability metadata |
| 9405 | Run Service | Queryable history/logs/analytics for executions |
| 9406 | Connections Service | Encrypts and stores OAuth/API credentials |
| 9407 | Template Service | Template catalog + AI-generated blueprints |
| 9408 | Quota Service | Workspace usage tracking and enforcement |

All services share the `workflow-shared` module for DTOs, enums, and Kafka topic constants. Each exposes Spring Actuator health/metrics endpoints and ships with Flyway V1 baseline migrations.

### Event Backbone
```
Kafka Topics:
  - workflow.triggers
  - workflow.executions
  - workflow.run-status
  - workflow.audit
```

### Database (Port 5442)
```
Container: darevel-postgres-workflow
Schemas:
  - workflow_designer
  - workflow_engine
  - workflow_runs
  - workflow_connections
  - workflow_connector
  - workflow_template
  - workflow_quota
Access: localhost:5442 (WORKFLOW_POSTGRES_PORT)
User: workflow (override with WORKFLOW_*_DB_USER)
Password: workflow (override with WORKFLOW_*_DB_PASSWORD)
```

---

## Dashboard Experience Details ✨ NEW

### Frontend (Port 3007)
```
Location: apps/dashboard/
Framework: React 19 + Vite 6
Access: http://localhost:3007 (Vite dev server started by start-dashboard.bat)
```

### Backend (Port 9410)
```
Location: apps/dashboard/backend/dashboard-service/
Framework: Spring Boot 3.2.1 + Java 17
Purpose: Aggregates metrics, incidents, and shortcuts across Darevel apps
API Docs: http://localhost:9410/swagger-ui.html (via springdoc)
Health: http://localhost:9410/actuator/health
Metrics: http://localhost:9410/actuator/prometheus
```

### Database (Port 5443)
```
Container: darevel-postgres-dashboard
Schema: dashboard (tables: dashboard_user_configs, dashboard_team_configs)
Access: localhost:5443 / postgres:dashboard
Provisioning: docker-compose -f postgres-compose.yml up -d (runs inside start-dashboard.bat)
```

### Cache (Port 6379)
```
Container: darevel-dashboard-redis
Persistence: AOF enabled, volume mounted under .docker/dashboard-redis
Access: localhost:6379 (REDIS_HOST / REDIS_PORT envs)
Provisioning: docker-compose -f redis-compose.yml up -d
```

### Startup Script
```
Script: start-dashboard.bat (Windows root)
Sequence: Keycloak check ➜ Redis up ➜ Postgres up ➜ Backend up ➜ Health probe ➜ Vite dev server on 3007
Stopper: stop-dashboard.bat tears down containers and kills the dev server port.
```

## Notification Center Details ✨ NEW

### Frontend (Port 3011)
```
Location: apps/notification/
Framework: React 19 + Vite 6 + Zustand store
Access: http://localhost:3011
```

### Backend (Port 9495)
```
Location: apps/notification/backend/notification-service/
Framework: Spring Boot 3.2.1 + Java 17 + Redis + WebSocket
Purpose: Central notification ingestion, storage, WebSocket fan-out, and preference management
API Docs: http://localhost:9495/swagger-ui (springdoc disabled by default, enable via config)
Health: http://localhost:9495/actuator/health
WebSocket: ws://localhost:9495/ws/notifications (destination prefix /topic/notifications)
```

### Data Services
```
Database: Postgres (container darevel-postgres-notification, port 5445, user/password notification)
Cache: Redis (container darevel-notification-redis, port 6385) for pub/sub + unread cache
```

### Startup Script
```
Script: start-notification.bat
Sequence: Prereq checks ➜ Postgres up ➜ Redis up ➜ Backend build/up ➜ Health probe ➜ npm dev server on 3011
Stopper: stop-notification.bat stops docker-compose stack and kills Vite dev server port.
```

---

## Wiki Application Details ✨ NEW

### Frontend (Port 3010)
```
Location: apps/wiki/
Framework: React 19 + Vite 6
Access: http://localhost:3010
```

### Backend Microservices (Ports 8100-8107)

| Port | Service | Responsibility |
|------|---------|----------------|
| 8100 | Wiki Space Service | Spaces, roles, memberships |
| 8101 | Wiki Page Service | Tree, metadata, watching |
| 8102 | Wiki Content Service | Block storage (JSONB) |
| 8103 | Wiki Comment Service | Threads, inline replies |
| 8104 | Wiki Version Service | History snapshots, restore |
| 8105 | Wiki Search Service | Kafka consumer → Elasticsearch |
| 8106 | Wiki Attachment Service | MinIO-backed attachments |
| 8107 | Wiki Presence Service (optional) | WebSocket/STOMP presence |

All services target Spring Boot 3.2+/Java 21, sharing OAuth2 resource server configuration via Keycloak and publishing/consuming Kafka events with the `wiki.*` namespace.

### Shared Infrastructure

- **PostgreSQL (5441)** – `darevel-postgres-wiki` hosts schemas for spaces, pages, content, comments, and versions.
- **Redis (existing)** – caching, permission lookups, collaborative locks, and presence fan-out.
- **Kafka (existing cluster)** – events: `wiki.page.saved`, `wiki.comment.created`, `wiki.page.version.created`, `wiki.page.mentioned`.
- **Elasticsearch (9225)** – curated index (`wiki-pages`) updated by the Search service.
- **MinIO (9500)** – attachment binaries with pre-signed uploads/downloads.

### Event Flow Highlights

1. **Page Save** → Content service persists + emits `wiki.page.saved` → Version/Search consume for history + indexing.
2. **Comment Added** → Comment service emits `wiki.comment.created` → Notification service reuses global channels to ping watchers/mentions.
3. **Presence Update** → Presence service pushes updates via Redis and WebSocket for live cursors.

---

## Port Conflicts & Resolutions

### Resolved Conflicts
- ✅ **Form Frontend** moved from 3000 → **3005** (avoided Slides conflict)
- ✅ **Form Service** assigned **8090** (next available backend port)
- ✅ **Form Database** assigned **5440** (next available database port)
- ✅ **Workflow Frontend** pinned to **3006** via `WORKFLOW_FRONTEND_PORT` (keeps dev servers unique)
- ✅ **Workflow Automation** reserved **9401-9408** for core microservices to avoid overlap with 8000-range stacks
- ✅ **Workflow Database** assigned **5442** for the new Postgres container

### Known Conflicts
- ⚠️ **Port 8086** - Shared by Mail Backend and Chat Incidents Service
  - Recommendation: Move Chat Incidents to 8096
- ⚠️ **Port 3000** - Overloaded in standalone projects
  - Standalone apps default to 3000 but should use unique ports
- ⚠️ **Ports 9401-9408** - Ensure Docker/infra firewalls expose them when testing Workflow externally

---

## Recommended Port Ranges

### For New Services

#### Frontend Applications
- Use **3011-3099** range for new frontend apps
- Ensure no conflict with existing 3000-3009 services

#### Backend Services
- Use **8095-8099** or **8108-8199** range for new backend services
- Keep microservice clusters together (e.g., Form: 8090-8094)
- Reserve **9401-9499** for Workflow automation services (existing 9401-9408 + future workers)

#### Databases
- Use **5442-5499** range for new database services
- Consider shared PostgreSQL instances for smaller apps

---

## Network Configuration

### Docker Networks
- **darevel-network** - Main application network (bridge)
  - All services communicate via this network
  - Internal DNS resolution enabled

### CORS Configuration
```
Allowed Origins:
- http://localhost:3000 (Slides)
- http://localhost:3002 (Suite)
- http://localhost:3003 (Chat)
- http://localhost:3004 (Sheet)
- http://localhost:3005 (Form) ✨ NEW
- http://localhost:3006 (Workflow) ✨ NEW
- http://localhost:3007 (Dashboard) ✨ NEW
- http://localhost:3010 (Wiki) ✨ NEW
- http://localhost:3008 (Mail)
- http://localhost:3009 (Docs)
```

---

## Health Check Endpoints

### All Backend Services
```
GET /actuator/health
GET /actuator/info
GET /actuator/metrics
GET /actuator/prometheus
```

### Status Checks
```bash
# Check all running services
docker ps

# Check specific service
curl http://localhost:8090/actuator/health

# Check database
docker exec -it darevel-postgres-form pg_isready
```

---

## Quick Start Commands

### Start Form Services
```bash
# From darevel-main directory
start-form.bat

# Or start all services
start-all.bat
```

### Check Port Usage
```bash
# Windows
netstat -aon | findstr :8090

# Find process using port
netstat -aon | findstr :8090 | findstr LISTENING
```

### Free a Port
```bash
# Kill process on Windows
taskkill /F /PID <process_id>
```

### Start Workflow Services
```bash
# Frontend
cd apps/workflow
npm install
npm run dev            # http://localhost:3006

# Backend (pick services as needed)
cd ../workflow/backend
mvnw -pl workflow-designer-service spring-boot:run
mvnw -pl workflow-engine-service spring-boot:run
...

# Build entire suite
mvnw -pl apps/workflow/backend -am clean install
```

### Workflow Port Checks
```bash
# Verify a specific microservice
netstat -aon | findstr :9404

# Health endpoint
curl http://localhost:9404/actuator/health
```

---

## Service URLs Quick Reference

### Web Interfaces
```
Keycloak Admin:  http://localhost:8180
Grafana:         http://localhost:3001
MailHog:         http://localhost:8025
Jitsi Meet:      http://localhost:8000
Wiki Frontend:  http://localhost:3010
Workflow Frontend: http://localhost:3006
Dashboard Frontend: http://localhost:3007
```

### API Endpoints
```
Form API:        http://localhost:8090/api
Response API:    http://localhost:8091/api
Docs API:        http://localhost:8087/api
Slides API:      http://localhost:8084/api
Sheet API:       http://localhost:8089/api
Mail API:        http://localhost:8083/api
Suite API:       http://localhost:8085/api
Dashboard API:   http://localhost:9410/api
Wiki APIs:       http://localhost:8100-8107/api (per microservice, planned)
Workflow APIs:   http://localhost:9401-9408/api (per microservice)
```

### Swagger Documentation
```
Form:            http://localhost:8090/swagger-ui.html
Response:        http://localhost:8091/swagger-ui.html
Docs:            http://localhost:8087/swagger-ui.html
Slides:          http://localhost:8084/swagger-ui.html
Wiki Services:   http://localhost:8100-8107/swagger-ui.html (planned)
Workflow Services:
  Designer:      http://localhost:9401/swagger-ui.html
  Engine:        http://localhost:9402/swagger-ui.html
  Trigger:       http://localhost:9403/swagger-ui.html
  Connector:     http://localhost:9404/swagger-ui.html
  Run:           http://localhost:9405/swagger-ui.html
  Connections:   http://localhost:9406/swagger-ui.html
  Template:      http://localhost:9407/swagger-ui.html
  Quota:         http://localhost:9408/swagger-ui.html
Dashboard:       http://localhost:9410/swagger-ui.html
```

---

## Future Port Planning

### Available Ranges
- Frontend: 3011-3099 (89 ports available)
- Backend: 8095-8099 & 8108-8999 (902 ports available)
- Database: 5444-5499 (56 ports available)
- Workflow: 9409-9499 reserved for future automation workers/webhooks

### Planned Allocations
- Search Service: 8095
- Storage Service: 8096
- Notification Service: 8097
- API Gateway: 8080 (consolidated)
- WebSocket Hub: 8098
- Wiki Space/Page/Content/Comment/Version/Search/Attachment/Presence: 8100-8107
- Workflow Core Services: 9401-9408 (in use today)
- Elasticsearch (Wiki Search): 9225
- MinIO (Wiki Attachments): 9500

---

**Note:** Always check port availability before starting new services. Update this document when adding new ports.
