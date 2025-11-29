# Darevel Docs - Real-time Collaborative Document Editor

A Google Docs-style collaborative document editor built with Spring Boot, React, TipTap, and Yjs for the Darevel Workspace platform.

## Features

### Core Features
- **Real-time Collaboration**: Multiple users can edit the same document simultaneously with live cursor tracking
- **Rich Text Editing**: Full-featured WYSIWYG editor with formatting, tables, lists, headings, and more
- **Version History**: Automatic versioning with ability to view and restore previous versions
- **Comments & Discussions**: Add comments to specific text selections with threaded replies
- **Permissions Management**: Granular access control (Owner, Edit, Comment, View)
- **Activity Tracking**: Complete audit trail of document changes and collaborator actions
- **Auto-save**: Automatic saving every 30 seconds
- **Templates**: Create and use document templates for common formats

### Technical Features
- **WebSocket-based Real-time Sync**: Using Yjs CRDT for conflict-free collaborative editing
- **JWT Authentication**: Integrated with Keycloak OAuth2/OIDC
- **RESTful API**: Comprehensive REST API for all document operations
- **PostgreSQL Database**: Dedicated database instance for data persistence
- **Docker Support**: Fully containerized with Docker Compose
- **Responsive UI**: Modern React interface with Tailwind CSS

## Architecture

### Backend (Spring Boot 3.2.1)
```
com.darevel.docs/
├── config/           # Security, WebSocket, CORS configuration
├── controller/       # REST API endpoints
├── dto/              # Data Transfer Objects
├── entity/           # JPA entities
├── enums/            # Enums (PermissionRole, CommentStatus)
├── repository/       # Data access layer
├── service/          # Business logic
├── util/             # Utilities (SecurityUtil)
└── websocket/        # WebSocket handlers
```

### Frontend (React + Vite)
```
src/
├── components/       # React components (Editor, Toolbar)
├── lib/              # API client
├── pages/            # Page components
└── index.css         # Tailwind styles
```

### Database Schema
- **documents**: Document metadata and content
- **document_permissions**: User/team permissions
- **document_versions**: Version history snapshots
- **document_comments**: Comments and replies
- **document_activity**: Activity audit trail
- **active_sessions**: Real-time collaboration sessions

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Keycloak running on port 8180

### Start Docs Service

**Option 1: Using batch script (Windows)**
```bash
.\start-docs.bat
```

**Option 2: Manual startup**
```bash
# 1. Start PostgreSQL
cd darevel-main/apps/docs/backend
docker-compose -f postgres-compose.yml up -d

# 2. Start backend
docker-compose up --build -d

# 3. Start frontend
cd ../..
npm install
npm run dev
```

### Stop Docs Service
```bash
.\stop-docs.bat
```

### Access the Application
- Frontend: http://localhost:3009
- Backend API: http://localhost:8087
- Database: localhost:5439

## API Documentation

### Document Endpoints

#### Create Document
```http
POST /api/docs/documents
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "My Document",
  "orgId": "org-123",
  "content": {},
  "isTemplate": false
}
```

#### Get Document
```http
GET /api/docs/documents/{documentId}
Authorization: Bearer <token>
```

#### List Documents
```http
GET /api/docs/documents?orgId=org-123&search=query
Authorization: Bearer <token>
```

#### Update Document
```http
PUT /api/docs/documents/{documentId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "content": { ... }
}
```

#### Delete Document (Soft Delete)
```http
DELETE /api/docs/documents/{documentId}
Authorization: Bearer <token>
```

### Permission Endpoints

#### List Permissions
```http
GET /api/docs/documents/{documentId}/permissions
```

#### Add Permission
```http
POST /api/docs/documents/{documentId}/permissions

{
  "userId": "user-123",
  "role": "EDIT"
}
```

Roles: `OWNER`, `EDIT`, `COMMENT`, `VIEW`

#### Update Permission
```http
PUT /api/docs/documents/{documentId}/permissions/{userId}?role=COMMENT
```

#### Remove Permission
```http
DELETE /api/docs/documents/{documentId}/permissions/{userId}
```

### Comment Endpoints

#### Create Comment
```http
POST /api/docs/documents/{documentId}/comments

{
  "content": "Great work!",
  "range": { "from": 10, "to": 20 },
  "parentId": null
}
```

#### List Comments
```http
GET /api/docs/documents/{documentId}/comments
```

#### Resolve Comment
```http
POST /api/docs/documents/{documentId}/comments/{commentId}/resolve
```

#### Reopen Comment
```http
POST /api/docs/documents/{documentId}/comments/{commentId}/reopen
```

### Version Endpoints

#### Create Version
```http
POST /api/docs/documents/{documentId}/versions

{
  "description": "Before major refactor"
}
```

#### List Versions
```http
GET /api/docs/documents/{documentId}/versions
```

#### Get Specific Version
```http
GET /api/docs/documents/{documentId}/versions/{versionNumber}
```

#### Restore Version
```http
POST /api/docs/documents/{documentId}/versions/{versionNumber}/restore
```

### Collaboration Endpoints

#### Get Active Collaborators
```http
GET /api/docs/documents/{documentId}/collaborators
```

Returns list of users currently editing the document with their cursor positions.

## WebSocket Protocol

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8087/ws/docs/{documentId}');
```

### Message Types

#### Document Update
```json
{
  "type": "update",
  "userId": "user-123",
  "payload": { ... },
  "timestamp": 1234567890
}
```

#### Cursor Update
```json
{
  "type": "cursor",
  "userId": "user-123",
  "payload": {
    "position": { "from": 10, "to": 10 }
  },
  "timestamp": 1234567890
}
```

#### User Joined
```json
{
  "type": "user_joined",
  "userId": "user-123",
  "userName": "Alice",
  "sessionId": "session-456",
  "timestamp": 1234567890
}
```

#### User Left
```json
{
  "type": "user_left",
  "userId": "user-123",
  "userName": "Alice",
  "sessionId": "session-456",
  "timestamp": 1234567890
}
```

## Configuration

### Backend Configuration (application.properties)
```properties
# Server
server.port=8087

# Database
spring.datasource.url=jdbc:postgresql://localhost:5439/darevel_docs
spring.datasource.username=postgres
spring.datasource.password=postgres

# Keycloak
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8180/realms/darevel

# CORS
cors.allowed-origins=http://localhost:3000,http://localhost:3009

# Document Settings
docs.max-collaborators=50
docs.snapshot-interval-seconds=300
docs.auto-save-interval-seconds=30
```

### Frontend Configuration (.env)
```env
VITE_API_BASE=http://localhost:8087/api/docs
VITE_WS_URL=ws://localhost:8087
VITE_KEYCLOAK_URL=http://localhost:8180
```

## Development

### Backend Development
```bash
cd darevel-main/apps/docs/backend

# Run with Maven (requires Java 17+)
./mvnw spring-boot:run

# Or build and run JAR
./mvnw clean package
java -jar target/docs-service.jar
```

### Frontend Development
```bash
cd darevel-main/apps/docs

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Database Migrations
Flyway migrations are located in `src/main/resources/db/migration/`. New migrations should follow the naming convention:
```
V{version}__description.sql
```

## Editor Features

### Text Formatting
- Bold, Italic, Underline, Strikethrough
- Headings (H1, H2, H3)
- Text alignment (Left, Center, Right, Justify)
- Highlight
- Code blocks

### Lists & Structure
- Bullet lists
- Numbered lists
- Blockquotes
- Tables with resizing

### Collaboration Features
- Real-time cursor tracking
- User presence indicators
- Color-coded cursors for each user
- Connection status indicator
- Auto-save with status display

## Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3009 | React application |
| Backend | 8087 | Spring Boot REST API + WebSocket |
| Database | 5439 | PostgreSQL |

## Security

### Authentication
All API endpoints (except WebSocket) require JWT authentication via Keycloak:
```http
Authorization: Bearer <access_token>
```

### Permission Levels
- **OWNER**: Full control, can delete document and manage permissions
- **EDIT**: Can edit content and add comments
- **COMMENT**: Can view and add comments
- **VIEW**: Read-only access

## Monitoring

### Health Check
```http
GET /actuator/health
```

### Active Sessions
Monitor active editing sessions:
```sql
SELECT * FROM active_sessions WHERE last_seen_at > NOW() - INTERVAL '5 minutes';
```

### Activity Log
View recent activity:
```http
GET /api/docs/documents/{documentId}/activity/recent?hours=24
```

## Troubleshooting

### Backend Won't Start
1. Check if port 8087 is available
2. Verify PostgreSQL is running on port 5439
3. Ensure Keycloak is accessible on port 8180
4. Check logs: `docker logs darevel-docs-service`

### Frontend Can't Connect
1. Verify backend is running: `curl http://localhost:8087/actuator/health`
2. Check CORS settings in application.properties
3. Verify WebSocket connection: Check browser console for errors

### Database Connection Issues
```bash
# Check if PostgreSQL container is running
docker ps | grep darevel-postgres-docs

# Connect to database
docker exec -it darevel-postgres-docs psql -U postgres -d darevel_docs

# View tables
\dt
```

### Real-time Sync Not Working
1. Check WebSocket connection in browser Network tab
2. Verify port 8087 is not blocked by firewall
3. Check backend logs for WebSocket errors
4. Ensure Yjs provider is properly initialized

## Performance Optimization

### Database Indexing
All frequently queried fields are indexed. See `V1__init_schema.sql` for index definitions.

### Auto-save Throttling
Auto-save is throttled to every 30 seconds to reduce database load while still providing good UX.

### Stale Session Cleanup
A scheduled job runs every 5 minutes to clean up inactive sessions (>30 minutes).

## Future Enhancements

- [ ] PDF and DOCX export
- [ ] Image upload and embedding
- [ ] @mention notifications
- [ ] Real-time presence sidebar
- [ ] Document sharing via public link
- [ ] Advanced search and filtering
- [ ] Document folders/organization
- [ ] Offline mode with sync
- [ ] Mobile app support

## License

Copyright © 2024 Darevel. All rights reserved.

## Support

For issues or questions:
- GitHub Issues: [Create Issue](https://github.com/darevel/docs/issues)
- Documentation: [Darevel Docs](https://docs.darevel.com)
