# Billing Service

Billing-service powers plans, subscriptions, usage metering, invoices, and plan-limit enforcement for the Darevel suite. It exposes REST APIs that internal frontends and other microservices can call to evaluate limits before performing user, file, or workflow operations.

## Capabilities

- CRUD-lite exposure for plans (read-only public catalogue)
- Subscription lifecycle APIs: create, upgrade/downgrade, cancel, reactivate
- Usage ingestion endpoint plus historic retrieval
- Plan limit evaluation endpoint consumed by other services before executing actions
- Invoice listing and retrieval
- Payment provider webhook ingestion (Stripe/RazorPay compatible payload contract)
- Background jobs for usage aggregation, subscription expiry, and invoice sync hooks

## Tech Stack

- Spring Boot 3 / Java 17, OAuth2 Resource Server
- PostgreSQL with Flyway-managed schema
- JPA/Hibernate for persistence, JSONB column for plan features
- Spring Validation + global exception advice for consistent errors
- Schedulers for background workflows

## Running Locally

```bash
cd apps/billing/backend/billing-service
mvn spring-boot:run
```

Environment variables:

| Variable | Purpose | Default |
|----------|---------|---------|
| `BILLING_DB_URL` | JDBC connection string | `jdbc:postgresql://localhost:5432/billing` |
| `BILLING_DB_USER` | Database username | `billing` |
| `BILLING_DB_PASSWORD` | Database password | `billing` |
| `BILLING_STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `changeme` |
| `BILLING_STRIPE_API_KEY` | Stripe API key | `changeme` |
| `BILLING_STRIPE_SIGNING_SECRET` | Stripe signing secret | `changeme` |

## API Surface

| Endpoint | Description |
|----------|-------------|
| `GET /api/billing/plans` | Public plan catalogue |
| `POST /api/billing/subscriptions/create` | Create subscription + optional trial |
| `POST /api/billing/subscriptions/update` | Change plan/cycle |
| `POST /api/billing/subscriptions/cancel` | Cancel immediately or at period end |
| `POST /api/billing/subscriptions/reactivate` | Resume cancelled subscription |
| `GET /api/billing/subscriptions/{orgId}` | Fetch subscription snapshot |
| `GET /api/billing/invoices?orgId=` | List invoices for org |
| `GET /api/billing/invoices/{invoiceId}` | Retrieve invoice |
| `POST /api/billing/usage/report` | Record usage sample |
| `GET /api/billing/usage?orgId=` | Usage timeline |
| `GET /api/billing/limit/check?orgId=` | Evaluate plan limits |
| `POST /api/billing/webhooks/payment` | Stripe/RazorPay webhook receiver |

Refer to controller DTOs for request/response contracts.
