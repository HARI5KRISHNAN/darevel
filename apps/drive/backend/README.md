# Darevel Drive Backend

Modern, secure file storage and collaboration platform with SharePoint-style features.

## Features

✅ **File Management**
- File and folder operations (create, read, update, delete)
- File versioning with full history
- File upload/download with streaming
- Search functionality

✅ **Storage**
- MinIO object storage integration
- Efficient file storage with deduplication
- SHA-256 checksums for integrity

✅ **Sharing & Permissions**
- Granular permission levels (VIEW, EDIT, OWNER)
- Public share links with optional:
  - Password protection
  - Expiration dates
  - Download limits
- User-based permissions

✅ **Organization**
- Spaces for organizing files
- Folder hierarchy
- Star/favorite files
- Trash and restore functionality

✅ **Security**
- OAuth2 JWT authentication
- Role-based access control
- Secure share links

✅ **Events**
- Kafka integration for real-time events
- Event-driven architecture

## Architecture

### Services
- **drive-meta-service** (Port 8110): File metadata, permissions, and orchestration

### Tech Stack
- **Framework**: Spring Boot 3.3.4
- **Language**: Java 21
- **Database**: PostgreSQL 15
- **Object Storage**: MinIO
- **Messaging**: Apache Kafka
- **Authentication**: OAuth2 + JWT (Keycloak)

## Getting Started

### Prerequisites
- Java 21+
- Maven 3.9+
- Docker & Docker Compose

### Quick Start

1. **Clone and navigate**
   ```bash
   cd darevel-main/apps/drive/backend
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start infrastructure**
   ```bash
   docker-compose up -d postgres-drive minio kafka zookeeper
   ```

4. **Access MinIO Console**
   - URL: http://localhost:9501
   - Username: minioadmin
   - Password: minioadmin

5. **Build and run service**
   ```bash
   cd drive-meta-service
   mvn clean install
   mvn spring-boot:run
   ```

   Or use Docker:
   ```bash
   docker-compose up -d drive-meta-service
   ```

### API Documentation

Once running, access Swagger UI at:
```
http://localhost:8110/swagger-ui.html
```

## API Endpoints

### File Operations
```
POST   /api/drive/files/upload              - Upload new file
POST   /api/drive/files/{id}/upload-version - Upload new version
GET    /api/drive/files/{id}/download       - Download file
GET    /api/drive/files/{id}/download/version/{versionNumber} - Download specific version
```

### Node Management
```
POST   /api/drive/nodes/folders        - Create folder
POST   /api/drive/nodes/files          - Register file
GET    /api/drive/spaces/{id}/nodes    - List nodes in space
GET    /api/drive/nodes/{id}           - Get node details
PATCH  /api/drive/nodes/{id}           - Update node (rename, move)
DELETE /api/drive/nodes/{id}           - Soft delete node
POST   /api/drive/nodes/{id}/restore   - Restore from trash
GET    /api/drive/spaces/{id}/trash    - List trashed nodes
```

### Favorites & Recent
```
POST   /api/drive/nodes/{id}/star      - Star node
DELETE /api/drive/nodes/{id}/star      - Unstar node
GET    /api/drive/nodes/starred        - List starred nodes
GET    /api/drive/nodes/recent         - List recent nodes
```

### Search
```
GET    /api/drive/spaces/{id}/search?query={q} - Search files and folders
```

### Permissions
```
POST   /api/drive/sharing/nodes/{id}/permissions     - Grant permission
DELETE /api/drive/sharing/nodes/{id}/permissions     - Revoke permission
GET    /api/drive/sharing/nodes/{id}/permissions     - List permissions
GET    /api/drive/sharing/shared-with-me             - List files shared with user
```

### Share Links
```
POST   /api/drive/sharing/nodes/{id}/links     - Create share link
DELETE /api/drive/sharing/links/{id}           - Revoke share link
GET    /api/drive/sharing/nodes/{id}/links     - List share links
GET    /api/drive/sharing/links/{token}        - Get share link info
```

### Spaces
```
POST   /api/drive/spaces           - Create space
GET    /api/drive/spaces           - List spaces
GET    /api/drive/spaces/{id}      - Get space details
PUT    /api/drive/spaces/{id}      - Update space
DELETE /api/drive/spaces/{id}      - Delete space
```

### Versions
```
POST   /api/drive/nodes/{id}/versions     - Create new version
GET    /api/drive/nodes/{id}/versions     - List versions
```

## Database Schema

### Core Tables
- `drive_space`: Workspaces for organizing files
- `drive_node`: Files and folders (unified node model)
- `drive_file_version`: File version history
- `drive_star`: User favorites

### Sharing Tables
- `drive_permission`: User permissions on nodes
- `drive_share_link`: Public share links

## Configuration

### Environment Variables

See [.env.example](.env.example) for all configuration options.

Key configurations:
- `DRIVE_META_DB_URL`: PostgreSQL connection string
- `MINIO_ENDPOINT`: MinIO server URL
- `KAFKA_BOOTSTRAP_SERVERS`: Kafka broker URL
- `OAUTH_ISSUER_URI`: Keycloak realm URL

### Application Properties

See [application.yml](drive-meta-service/src/main/resources/application.yml)

## Development

### Building
```bash
mvn clean install
```

### Running Tests
```bash
mvn test
```

### Database Migrations
Flyway migrations are in `src/main/resources/db/migration/`

Migrations run automatically on startup.

## Monitoring

### Health Check
```bash
curl http://localhost:8110/actuator/health
```

### Metrics
```bash
curl http://localhost:8110/actuator/prometheus
```

## Deployment

### Docker
```bash
docker-compose up -d
```

### Kubernetes
See `k8s/` directory (coming soon)

## Event Schema

### Kafka Topics
- `drive.node.created`
- `drive.node.updated`
- `drive.node.deleted`
- `drive.node.moved`
- `drive.node.restored`
- `drive.version.created`

### Event Format
```json
{
  "type": "NODE_CREATED",
  "nodeId": "uuid",
  "spaceId": "uuid",
  "actorId": "uuid",
  "timestamp": "2025-11-29T10:00:00Z",
  "payload": {
    "nodeType": "FILE",
    "mimeType": "application/pdf",
    "sizeBytes": 1024
  }
}
```

## Security

### Authentication
All endpoints require valid JWT token from Keycloak.

Include in request header:
```
Authorization: Bearer <jwt-token>
```

### Permission Levels
- **VIEW**: Can view and download
- **EDIT**: Can view, download, and upload new versions
- **OWNER**: Full control (delete, share, manage permissions)

## Troubleshooting

### Common Issues

**MinIO connection failed**
- Check MinIO is running: `docker ps | grep minio`
- Verify endpoint in .env: `MINIO_ENDPOINT=http://localhost:9500`

**Database migration failed**
- Check PostgreSQL is running
- Verify connection string in .env
- Review logs: `docker logs darevel-drive-meta-service`

**Kafka not available**
- Ensure Kafka and Zookeeper are running
- Check `KAFKA_BOOTSTRAP_SERVERS` configuration

## License

Proprietary - Darevel Platform

## Support

For issues and questions, contact the development team.
