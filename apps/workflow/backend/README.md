# Darevel Workflow Backend

This module hosts the backend services that power Darevel Workflow inside the suite. The architecture follows an event-driven design where workflow definitions are persisted separately from run execution and trigger ingestion. Each service is intentionally focused:

| Service | Purpose |
| --- | --- |
| `workflow-designer-service` | CRUD for workflow definitions, versions, and validation rules used by the canvas designer. |
| `workflow-engine-service` | Executes workflow runs, coordinates action dispatch, and publishes status events. |
| `workflow-trigger-gateway` | Authenticates inbound triggers (webhooks, schedules, kanban events) and normalizes them onto Kafka. |
| `workflow-connector-service` | Manages reusable connector capabilities (Slack, Mail, Kanban, CRM, etc.) delivered to the designer and engine. |
| `workflow-run-service` | Provides APIs for querying past runs, logs, and analytics dashboards. |
| `workflow-connections-service` | Stores customer credentials/tokens and issues scoped connection IDs to the engine. |
| `workflow-template-service` | Curates reusable templates and AI-generated blueprints that bootstrap new automations. |
| `workflow-quota-service` | Tracks usage, enforces rate limits, and surfaces quota warnings back to the UI. |

All services share the `workflow-shared` module for DTOs, events, and enums. PostgreSQL is the default source of truth (JSONB used for flexible payloads) and Kafka is the event backbone. Each module includes:

- Spring Boot 3 application entrypoint
- REST controllers with initial routes
- Service layer stubs wired to repositories
- Flyway baseline migration (V1)
- `application.yml` with environment-driven configuration keys

## Local development

1. Provision PostgreSQL databases (one schema per service for now) and Kafka (`docker-compose` coming later).
2. Export the following environment variables before running any service:
   - `WORKFLOW_POSTGRES_HOST`, `WORKFLOW_POSTGRES_PORT`
   - `WORKFLOW_KAFKA_BOOTSTRAP`
   - Service-specific `*_DB_NAME`, `*_DB_USER`, `*_DB_PASSWORD`
3. Run `mvn -pl apps/workflow/backend -am clean install` from the repo root to build everything.
4. Launch the services you need via your IDE or `mvn spring-boot:run -pl apps/workflow/backend/<service>`.

More documentation (topics, ports, infra) will land in the global `BACKENDS-OVERVIEW.md` and `PORT-ALLOCATION.md` files as part of the tracking todo.
