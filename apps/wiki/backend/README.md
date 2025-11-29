# Darevel Wiki Backend Platform

This module hosts the Spring Boot microservices that power the NexWiki frontend. Each service owns a focused domain and communicates over PostgreSQL, Kafka, Redis, MinIO, and Elasticsearch as documented in `PORT-ALLOCATION.md` and `BACKENDS-OVERVIEW.md`.

## Modules

| Module | Port | Responsibility |
|--------|------|----------------|
| `wiki-space-service` | 8100 | Spaces, memberships, permissions, visibility rules |
| `wiki-page-service` | 8101 | Page metadata, hierarchy, starring/watching |
| `wiki-content-service` | 8102 | Block storage (JSONB), block operations |
| `wiki-comment-service` | 8103 | Inline/page comments, mentions, resolution |
| `wiki-version-service` | 8104 | Page history snapshots, restore flow |
| `wiki-search-service` | 8105 | Kafka-driven indexing into Elasticsearch |
| `wiki-attachment-service` | 8106 | Attachment metadata + MinIO integrations |
| `wiki-presence-service` | 8107 | WebSocket presence + Redis pub/sub |

### wiki-page-service status

- **Domain**: page metadata, hierarchical tree management, revision history.
- **Endpoints**: `/api/wiki/pages` for CRUD + listings, `/api/wiki/pages/{id}/revisions/{n}` for point-in-time fetches.
- **Storage**: PostgreSQL schemas `page` and `page_revision` managed via Flyway `V1__create_page_tables.sql`.
- **Events**: emits Kafka records on `wiki.page.events` for create/update/delete and revision changes.
- **Security**: OAuth2 resource server (Keycloak) with JWT verification identical to the space service.

## Required Infrastructure

- PostgreSQL 15+ (`darevel-postgres-wiki`, port 5441)
- Redis (shared from infrastructure stack)
- Apache Kafka + Schema Registry
- Elasticsearch 8.x
- MinIO (or S3-compatible object storage)

`docker-compose.yml` in this directory spins up local instances of the above for development.

## Building

```bash
cd apps/wiki/backend
mvn clean verify
```

You can also build a single service:

```bash
# Space service
cd apps/wiki/backend/wiki-space-service
mvn spring-boot:run

# Page service
cd ../wiki-page-service
mvn spring-boot:run
```

## Security

All services act as OAuth2 resource servers using the existing Darevel Keycloak realm. See each service's `application.yml` for issuer/audience overrides and the shared `SecurityConfig` class for required claim headers (`X-User-Id`, `X-User-Roles`).

## Next Steps

1. Start supporting infrastructure via `docker-compose up -d`.
2. Run `start-wiki-services.bat` (to be added) to launch all services.
3. Wire `/api/wiki/**` routes through Spring Cloud Gateway once services are healthy.
