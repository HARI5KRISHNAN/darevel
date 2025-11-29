# Authz Service Backend

Spring Boot microservice responsible for Darevel's workspace RBAC (roles, permissions, assignments). It exposes OAuth2-protected APIs, stores policy state in Postgres, caches permission lookups in Redis, and will broadcast assignment events for other services.

## Local development

```bash
cd apps/access/backend
docker compose up --build
```

| Service | Port | Purpose |
| --- | --- | --- |
| `darevel-access-db` | 5447 | Postgres + Flyway migrations |
| `darevel-access-redis` | 6387 | Assignment cache + pub/sub |
| `authz-service` | 8096 | Spring Boot API |

Swagger UI: http://localhost:8096/swagger-ui.html

All endpoints expect `Authorization` (JWT), `X-User-Id`, and `X-Org-Id` headers.
