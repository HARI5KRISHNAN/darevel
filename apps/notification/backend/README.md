# Notification Service

Centralized notification backend for Darevel Workspace. Features:

- Multi-tenant Postgres storage with read/unread state
- Redis pub/sub ingestion from all workspace microservices
- WebSocket fan-out on `/ws/notifications`
- Notification preference management API
- JWT-protected REST APIs with `X-User-Id` / `X-Org-Id` headers

## Running locally

```bash
# from darevel-main/apps/notification/backend
docker compose up --build
```

The service will be available on `http://localhost:9495`.

## Key Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/notifications/list` | Paginated list |
| GET | `/api/notifications/unread-count` | Cached unread badge |
| POST | `/api/notifications/mark-read` | Mark specific IDs |
| POST | `/api/notifications/mark-all-read` | Bulk mark |
| GET | `/api/notifications/preferences` | Fetch preferences |
| POST | `/api/notifications/preferences` | Update channels |
| POST | `/api/notifications/preferences/mute` | Set DND |
| POST | `/api/notifications/preferences/unmute` | Clear DND |

All requests require `Authorization: Bearer <token>` plus `X-User-Id` and `X-Org-Id` headers.
