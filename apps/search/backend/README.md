# Search Service Backend

Spring Boot microservice that powers Darevel's global search experience. It consumes Redis workspace events, pushes normalized documents into Meilisearch, exposes OAuth2-protected REST endpoints for querying/re-indexing, and stores audit logs in Postgres.

## Local development

```bash
cd apps/search/backend
docker compose up --build
```

The stack will start the following containers:

| Service | Port | Notes |
| --- | --- | --- |
| `darevel-search-db` | 5446 | Postgres + Flyway migrations |
| `darevel-search-redis` | 6386 | Pub/Sub + cache |
| `darevel-search-meili` | 7710 | Meilisearch search backend |
| `search-service` | 8095 | Spring Boot API |

Swagger UI lives at http://localhost:8095/swagger-ui.html once the service is up. All endpoints expect `Authorization` (JWT), `X-User-Id`, and `X-Org-Id` headers.
