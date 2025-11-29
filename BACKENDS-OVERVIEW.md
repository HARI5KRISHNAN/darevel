# Darevel Workspace - Complete Backend Overview

## All Applications Summary

All four flagship Darevel applications have **complete, production-ready Java Spring Boot backends** integrated with React frontends, and the new Dashboard experience is onboarding now.

| Application | Frontend Port | Backend Port | Database | Database Port | Status |
|-------------|--------------|--------------|----------|---------------|--------|
| **Docs** | 3009 | 8087 | darevel_docs | 5439 | ✅ Ready |
| **Mail** | 3008 | 8083 | darevel_mail | 5432 | ✅ Ready |
| **Sheet** | 3004 | 8089 | darevel_sheet | 5432 | ✅ Ready |
| **Slides** | 3000 | 8084 | darevel_slides | 5432 | ✅ Ready |
| **Dashboard** | 3007 | 9410 | dashboard | 5443 | 🚧 New |
| **Notification Center** | 3011 | 9495 | notification | 5445 | 🚧 New |
| **Wiki** | 3010 | 8100-8107 | darevel_wiki (multi-schema) | 5441 | 🚧 In Progress |
| **Workflow** | 3006 | 9401-9408 | workflow_* (per service) | 5442 | 🚧 New |

---

## Quick Start Commands

### Start Individual Applications

#### Docs
```bash
cd apps/docs
start-all.bat          # Start database + backend + frontend
# OR
start-backend.bat      # Backend only
npm run dev            # Frontend only
```
- Frontend: http://localhost:3009
- Backend: http://localhost:8087

#### Mail
```bash
cd apps/mail
start-backend.bat      # Backend only
start-frontend.bat     # Frontend only
```
- Frontend: http://localhost:3008
- Backend: http://localhost:8083

#### Sheet
```bash
cd apps/sheet
start-all-new.bat      # Start database + backend + frontend
# OR
start-backend-new.bat  # Backend only
start-frontend.bat     # Frontend only
```
- Frontend: http://localhost:3004
- Backend: http://localhost:8089

#### Slides
```bash
cd apps/slides
start-all.bat          # Start database + backend + frontend
# OR
start-backend.bat      # Backend only
start-frontend.bat     # Frontend only
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8084

#### Notification Center
```bash
cd darevel-main
start-notification.bat   # Postgres + Redis + backend + frontend
# or run components individually from apps/notification/backend/docker-compose.yml
```
- Frontend: http://localhost:3011
- Backend: http://localhost:9495
- Database: localhost:5445 (notification/notification)
- Redis: localhost:6385

#### Wiki (frontend-first)
```bash
cd darevel-main
start-wiki.bat          # Starts Vite dev server on port 3010
```
- Frontend: http://localhost:3010
- Backends: http://localhost:8100-8107 (microservices, planned)

#### Workflow
```bash
# Frontend
cd apps/workflow
npm install
npm run dev                # Vite on port 3006

# Backend (pick the services you need)
cd ../workflow/backend
mvnw -pl workflow-designer-service spring-boot:run
mvnw -pl workflow-engine-service spring-boot:run
mvnw -pl workflow-trigger-gateway spring-boot:run
```
- Frontend: http://localhost:3006
- Backends: http://localhost:9401-9408 (multi-service Spring Boot)

---

## Technology Stack

### Common Backend Stack
- **Framework**: Spring Boot 3.2.1
- **Java Version**: 17
- **Build Tool**: Maven 3.8+ (via Maven Wrapper)
- **Database**: PostgreSQL 15
- **Authentication**: OAuth2/JWT via Keycloak
- **ORM**: Spring Data JPA + Hibernate
- **Security**: Spring Security
- **Real-time**: WebSocket (Docs, Sheet, Slides)
- **Wiki Services**: Spring Boot 3.2+/Java 21, WebFlux, Kafka, Redis, Elasticsearch, MinIO (see Wiki section)

### Common Frontend Stack
- **Framework**: React 19.2.0
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (via CDN)
- **HTTP Client**: Axios
- **Icons**: Lucide React

---

## Application-Specific Features

### 📄 Docs (Port 8087)
**Purpose**: Real-time collaborative document editor

**Key Features**:
- ✅ Document CRUD operations
- ✅ Real-time collaboration (WebSocket)
- ✅ Comments and discussions
- ✅ Version control with snapshots
- ✅ Permission management (OWNER, EDIT, COMMENT, VIEW)
- ✅ Activity tracking
- ✅ Export to PDF/DOCX
- ✅ Flyway database migrations

**Technologies**:
- Apache POI (DOCX export)
- iText (PDF export)
- AWS S3 (optional for large files)

### 📧 Mail (Port 8083)
**Purpose**: Professional email client

**Key Features**:
- ✅ Send/receive emails
- ✅ Folder management
- ✅ Draft support
- ✅ Meeting/calendar integration
- ✅ Video calls via Jitsi
- ✅ Contact management
- ✅ Attachment handling

**Technologies**:
- Spring Mail (SMTP/IMAP)
- Dovecot (IMAP server)
- Postfix (SMTP server)
- Jitsi (video calls)

### 📊 Sheet (Port 8089)
**Purpose**: Spreadsheet application

**Key Features**:
- ✅ Cell editing with formulas
- ✅ Multiple sheet support
- ✅ Real-time collaboration (WebSocket)
- ✅ Version history
- ✅ Import/Export (CSV, XLSX)
- ✅ Formula calculations
- ✅ Cell formatting

**Technologies**:
- Apache POI (XLSX processing)
- Custom formula engine
- WebSocket for collaboration

### 📽️ Slides (Port 8084)
**Purpose**: Presentation/slides editor

**Key Features**:
- ✅ Multiple slide layouts
- ✅ Rich text formatting
- ✅ Image/shape insertion
- ✅ Animations and transitions
- ✅ Real-time collaboration (WebSocket)
- ✅ Version history
- ✅ Export to PDF/PPTX
- ✅ AI-powered design (Ollama)
- ✅ Image search (Unsplash)

**Technologies**:
- iText (PDF export)
- Apache POI (PPTX export)
- Ollama (AI integration)
- Unsplash API (image search)
- Thumbnailator (image processing)

### 📈 Dashboard (Ports 3007 / 9410)
**Purpose**: Mission-control landing zone that aggregates KPIs, service health, quick actions, and AI coaching for Darevel operators.

**Key Features**:
- ✅ Aggregated health cards that call into chat/mail/sheet/slides services
- ✅ Usage + quota widgets powered by the Spring Boot dashboard-service
- ✅ Gemini-backed AI assistant surface built into the frontend sidebar
- ✅ Redis-backed caching for fast refresh of tiles and notifications
- ✅ Flyway-managed demo data and org/team templates

**Technologies**:
- Spring Boot 3.2.1 + Java 17
- PostgreSQL `dashboard` schema (port 5443) with its own compose stack
- Redis (6379) for cache + rate limiting
- Feign clients for cross-app calls and Reactor for async aggregations
- Dockerfile + docker-compose located in `apps/dashboard/backend/dashboard-service`

**Operational Notes**:
- Use `start-dashboard.bat` to bring up Postgres, Redis, backend, and the Vite frontend in one flow.
- Backend exposes `/actuator/health` and `/actuator/prometheus` for monitoring.
- Frontend dev server lives at http://localhost:3007 and proxies API calls to port 9410.

### 🔔 Notification Center (Ports 3011 / 9495)
**Purpose**: Multi-tenant notification pipeline that ingests events from every Darevel microservice, stores them per user/org, and broadcasts them over WebSocket/STOMP to the React client widgets.

**Key Features**:
- ✅ REST APIs for listing feeds, unread counts, bulk mark-read, DND windows, and channel preferences
- ✅ Redis pub/sub subscriber that listens on `events.*` channels and hands off messages to the processor service
- ✅ Cached unread badge counts with configurable TTL to keep the suite header responsive
- ✅ Flyway-managed Postgres schema (`notifications`, `notification_preferences`) with JSONB metadata columns
- ✅ JWT resource server enforcement with required `X-User-Id` + `X-Org-Id` headers for multi-tenant scoping
- ✅ Docker Compose stack that provisions Postgres (5445), Redis (6385), and the Spring Boot service (9495)

**Technologies**:
- Spring Boot 3.2.1 + Java 17 with WebSocket + Cache starters
- Spring Data JPA + Flyway for persistence, Jackson JSONB mapping for metadata
- Redis Streams/PubSub for ingestion, SimpMessagingTemplate for WebSocket fan-out
- Dockerfile + compose stack under `apps/notification/backend`

**Operational Notes**:
- `start-notification.bat` orchestrates Postgres, Redis, the backend, and Vite frontend (port 3011)
- Health endpoint: `http://localhost:9495/actuator/health`
- WebSocket endpoint: `ws://localhost:9495/ws/notifications` with `/topic/notifications` destination prefix

### ⚙️ Workflow (Ports 9401-9408)
**Purpose**: Automation builder that lets teams design multi-step workflows powered by Kanban events, schedules, or inbound webhooks.

**Key Features**:
- ✅ Canvas designer with versioned definitions and validation rules
- ✅ Connector catalog + OAuth-backed connections vault
- ✅ Trigger gateway for webhook, poller, and scheduled triggers
- ✅ Execution engine with audit + run history APIs
- ✅ Template/AI blueprint library to bootstrap automations
- ✅ Usage/quota tracking surfaced back to the frontend

**Microservices**

| Port | Service | Responsibility |
|------|---------|----------------|
| 9401 | Designer Service | CRUD for workflow definitions, draft publishing, validation |
| 9402 | Engine Service | Executes runs, dispatches actions, emits status events |
| 9403 | Trigger Gateway | Authenticates inbound triggers and normalizes them onto Kafka |
| 9404 | Connector Service | Catalog of actions/triggers exposed to the designer and engine |
| 9405 | Run Service | Queryable run history, metrics, and log aggregation APIs |
| 9406 | Connections Service | Secure storage for customer credentials + scoped tokens |
| 9407 | Template Service | Curated & AI-generated templates with metadata |
| 9408 | Quota Service | Tracks usage per workspace and enforces rate limits |

**Data & Events**
- PostgreSQL (`darevel-postgres-workflow`, port 5442) hosts individual schemas such as `workflow_designer`, `workflow_engine`, `workflow_runs`, etc.
- Kafka topics (`workflow.triggers`, `workflow.executions`, `workflow.run-status`, `workflow.audit`) connect Trigger → Engine → Run Service → observability pipelines.
- Shared DTOs, enums, and messaging helpers live in `apps/workflow/backend/workflow-shared` and are imported by every service.

**Operational Notes**
- Services expose Actuator health + Prometheus metrics on the default endpoints.
- Each application module ships with a Flyway `V1__baseline.sql` migration so databases stay in sync.
- Recommended startup order: Designer/Connector → Connections → Trigger Gateway → Engine → Run/Template/Quota.

### 📚 Wiki (Ports 8100-8107)
**Purpose**: Confluence-style knowledge base with block-based editing, inline comments, and enterprise search (currently frontend-ready, backend services planned).

**Microservices**

| Port | Service | Responsibility |
|------|---------|----------------|
| 8100 | Space Service | Spaces/workspaces, memberships, roles |
| 8101 | Page Service | Page tree, metadata, starring/watching |
| 8102 | Content Service | Block engine with JSONB storage |
| 8103 | Comment Service | Threaded comments, mentions, resolutions |
| 8104 | Version Service | Page history snapshots + restore |
| 8105 | Search Service | Kafka consumer indexing into Elasticsearch |
| 8106 | Attachment Service | Metadata + MinIO storage/presigned URLs |
| 8107 | Presence Service (optional) | Live cursors via WebSocket + Redis |

**Data & Infrastructure**
- PostgreSQL (`darevel-postgres-wiki`, port 5441) stores `space`, `space_member`, `page`, `page_block`, `comment_thread`, `comment`, and `page_version` tables with JSONB columns for block content.
- Redis provides caching, collaborative locks, and presence fan-out.
- Kafka topics (`wiki.page.saved`, `wiki.comment.created`, `wiki.page.version.created`) orchestrate versioning and notifications.
- Elasticsearch (port 9225) maintains a `wiki-pages` index for full-text search; consumes Kafka events from the Search service.
- MinIO (port 9500) houses binary attachments referenced by Attachment service metadata.

**Security & Gateway**
- Spring Cloud Gateway exposes `/api/wiki/**`, validating JWTs via Keycloak and forwarding `X-User-Id`, `X-User-Roles` headers.
- Service-to-service authorization is centralized through the Space service, enabling both space-level and page-level overrides.

**Event Highlights**
1. Save content → Content service persists blocks + emits `wiki.page.saved` → Version/Search services snapshot & re-index.
2. New comment → Comment service emits `wiki.comment.created` → Notification service reuses existing mail/notification pipelines.
3. Attachment upload → Attachment service stores metadata, requests MinIO pre-signed URL, and notifies Page service for inline rendering.

---

## Database Schemas

### Docs Database (`darevel_docs`)
- `documents` - Document metadata and content
- `document_permissions` - Access control
- `document_versions` - Version history
- `document_comments` - Comments
- `document_activity` - Audit log
- `active_sessions` - Real-time users

### Mail Database (`darevel_mail`)
- `emails` - Email messages
- `folders` - Mail folders
- `drafts` - Draft emails
- `meetings` - Calendar events
- `contacts` - User contacts
- `attachments` - Email attachments

### Sheet Database (`darevel_sheet`)
- `sheets` - Spreadsheet metadata
- `cells` - Cell data and formulas
- `versions` - Version history
- `permissions` - Access control
- `collaborators` - Active users

### Slides Database (`darevel_slides`)
- `presentations` - Presentation metadata
- `slides` - Individual slides
- `slide_elements` - Text, images, shapes
- `versions` - Version history
- `permissions` - Access control
- `themes` - Presentation themes
- `templates` - Slide templates

### Dashboard Database (`dashboard`)
- `dashboard_user_configs` - Per-user layout JSON, pinned widgets, refresh cadence
- `dashboard_team_configs` - Team-level presets (columns, cards, automations)
- `flyway_schema_history` - Migration ledger for reproducible demo data

### Notification Database (`notification`)
- `notifications` - Stored events with priority, metadata JSONB, read state, timestamps
- `notification_preferences` - Channel toggles, mute windows, delivery flags per user/org
- `flyway_schema_history` - Migration tracking for the notification service

### Wiki Database (`darevel_wiki`)
- `space` - Workspace metadata and visibility (PRIVATE, ORG, PUBLIC)
- `space_member` - Memberships and roles (ADMIN/EDITOR/VIEWER)
- `page` - Hierarchy, status (DRAFT/PUBLISHED/ARCHIVED), favorites
- `page_block` - Block tree stored as JSONB
- `comment_thread` / `comment` - Inline/page threads with mentions
- `page_version` - Incremental history snapshots with JSONB payloads
- `attachment` - File metadata mapped to MinIO storage keys

### Workflow Databases (`workflow_*` schemas on port 5442)
- `workflow_designer` - Stores workflow drafts, published versions, and validation issues.
- `workflow_engine` - Persists in-flight executions, action queues, and retry metadata.
- `workflow_runs` - Materialized run history, log entries, KPI aggregates.
- `workflow_connections` - Encrypted credential payloads + token refresh metadata.
- `workflow_connector` - Connector manifests, action shapes, and capability flags.
- `workflow_template` - Template definitions, tags, AI blueprint metadata.
- `workflow_quota` - Usage counters, enforcement windows, and policy overrides.

---

## Common API Patterns

All applications follow RESTful conventions:

```
# CRUD Operations
GET    /api/{service}/{resource}          - List all
GET    /api/{service}/{resource}/{id}     - Get one
POST   /api/{service}/{resource}          - Create
PUT    /api/{service}/{resource}/{id}     - Update
DELETE /api/{service}/{resource}/{id}     - Delete

# Nested Resources
GET    /api/{service}/{parent}/{id}/{child}          - List children
POST   /api/{service}/{parent}/{id}/{child}          - Create child
PUT    /api/{service}/{parent}/{id}/{child}/{cid}    - Update child
DELETE /api/{service}/{parent}/{id}/{child}/{cid}    - Delete child

# WebSocket
WS     /ws/{resource}/{id}                - Real-time connection
```

---

## Authentication Flow

All applications use **Keycloak OAuth2/JWT**:

1. User logs in via Keycloak
2. Frontend receives JWT token
3. Token stored in localStorage
4. Every API request includes: `Authorization: Bearer {token}`
5. Backend validates JWT signature
6. Backend extracts user info from token claims

---

## Environment Variables

### Common Environment Variables

```bash
# Database (per app)
DB_HOST=localhost
DB_PORT=5432              # Or app-specific port
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Keycloak
KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/darevel
KEYCLOAK_JWK_SET_URI=http://localhost:8180/realms/darevel/protocol/openid-connect/certs

# Server Ports
SERVER_PORT=8087          # Docs
SERVER_PORT=8083          # Mail
SERVER_PORT=8089          # Sheet
SERVER_PORT=8084          # Slides
SERVER_PORT=8100          # Wiki Space Service (planned)
SERVER_PORT=8101          # Wiki Page Service (planned)
SERVER_PORT=8102          # Wiki Content Service (planned)
SERVER_PORT=8103          # Wiki Comment Service (planned)
SERVER_PORT=8104          # Wiki Version Service (planned)
SERVER_PORT=8105          # Wiki Search Service (planned)
SERVER_PORT=8106          # Wiki Attachment Service (planned)
SERVER_PORT=8107          # Wiki Presence Service (planned)
WORKFLOW_FRONTEND_PORT=3006
WORKFLOW_DESIGNER_PORT=9401
WORKFLOW_ENGINE_PORT=9402
WORKFLOW_TRIGGER_GATEWAY_PORT=9403
WORKFLOW_CONNECTOR_PORT=9404
WORKFLOW_RUN_PORT=9405
WORKFLOW_CONNECTIONS_PORT=9406
WORKFLOW_TEMPLATE_PORT=9407
WORKFLOW_QUOTA_PORT=9408
WORKFLOW_POSTGRES_PORT=5442
WORKFLOW_KAFKA_BOOTSTRAP=localhost:9092
```

---

## Development Workflow

### 1. Start Individual App

```bash
cd apps/{app-name}
start-all.bat                    # Windows
```

### 2. Make Backend Changes

```bash
cd apps/{app-name}/backend
mvnw clean package               # Rebuild
java -jar target/{service}.jar   # Restart
```

### 3. Make Frontend Changes

Frontend has hot-reload enabled - changes apply automatically!

### 4. Database Changes

#### Docs (uses Flyway)
- Create migration: `V{N}__description.sql`
- Place in: `backend/src/main/resources/db/migration/`
- Restart backend - migration runs automatically

#### Mail/Sheet/Slides (use JPA)
- Update entity classes
- Restart backend - Hibernate updates schema automatically (ddl-auto: update)

---

## Production Deployment

### Build All Backends

```bash
# Docs
cd apps/docs/backend && mvnw clean package -DskipTests

# Mail
cd apps/mail/backend/mail-service && mvnw clean package -DskipTests

# Sheet
cd apps/sheet/backend && mvnw clean package -DskipTests

# Slides
cd apps/slides/backend && mvnw clean package -DskipTests
```

### Build All Frontends

```bash
# Each app
cd apps/{app-name}
npm run build
# Output in: dist/
```

### Docker Deployment

Each app has:
- `Dockerfile` - Build backend image
- `docker-compose.yml` - Run complete stack
- `postgres-compose.yml` - Database only

```bash
# Start app with Docker
cd apps/{app-name}/backend
docker-compose up -d
```

---

## Troubleshooting

### Port Conflicts

| Issue | Solution |
|-------|----------|
| Backend port in use | Change `SERVER_PORT` in `application.yml` |
| Frontend port in use | Change `server.port` in `vite.config.ts` |
| Database port in use | Change port mapping in `postgres-compose.yml` |

### Database Connection

```bash
# Test PostgreSQL connection
docker ps                                   # Check if running
docker logs darevel-postgres-{app}          # Check logs
psql -h localhost -p {port} -U postgres -d darevel_{app}  # Connect
```

### Backend Startup Failures

1. Check Java version: `java -version` (need 17+)
2. Check Maven: `mvn -version` (or use `mvnw`)
3. Check PostgreSQL: `docker ps`
4. Check logs in console output
5. Check if port is available: `netstat -ano | findstr :{port}`

### Frontend Issues

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check backend is running
3. Check CORS configuration in backend
4. Check browser console (F12)

---

## Documentation Files

Each app has comprehensive documentation:

- `apps/docs/BACKEND-SETUP.md` - Docs backend guide
- `apps/mail/BACKEND-SETUP.md` - Mail backend guide
- `apps/sheet/BACKEND-SETUP.md` - Sheet backend guide
- `apps/slides/BACKEND-SETUP.md` - Slides backend guide

---

## Summary

🎉 **All 4 existing applications are production-ready. Wiki frontend is integrated and backend microservices are in-flight.**

✅ **Docs** - Collaborative document editor
✅ **Mail** - Professional email client
✅ **Sheet** - Spreadsheet application
✅ **Slides** - Presentation editor
🚧 **Wiki** - Block-based knowledge base (frontend ready, microservices planned on ports 8100-8107)

Each has:
- ✅ Complete Spring Boot backend
- ✅ React frontend with modern UI
- ✅ PostgreSQL database
- ✅ OAuth2/JWT authentication
- ✅ RESTful APIs
- ✅ WebSocket collaboration (where applicable)
- ✅ Docker support
- ✅ Startup scripts
- ✅ Comprehensive documentation

**Just run `start-all.bat` in any app directory to get started!** 🚀
