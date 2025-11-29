# Darevel Form Services

Complete microservices architecture for form management, submissions, analytics, and AI-powered generation.

## Services Overview

| Service | Port | Purpose | Auth Required |
|---------|------|---------|---------------|
| **form-service** | 8090 | Form CRUD operations | ✅ Yes |
| **response-service** | 8091 | Form submissions | ✅ Yes |
| **public-link-service** | 8092 | Anonymous form access | ❌ No |
| **analytics-service** | 8093 | Submission analytics | ✅ Yes |
| **ai-form-service** | 8094 | AI form generation | ✅ Yes |

## Architecture

```
┌─────────────┐
│  Frontend   │
│  (3005)     │
└──────┬──────┘
       │
   ┌───┴───┬───────┬────────┬──────────┐
   ▼       ▼       ▼        ▼          ▼
┌─────┐ ┌─────┐ ┌──────┐ ┌────────┐ ┌──────┐
│Form │ │Resp │ │Public│ │Analyt. │ │  AI  │
│8090 │ │8091 │ │ 8092 │ │  8093  │ │ 8094 │
└──┬──┘ └──┬──┘ └──────┘ └────┬───┘ └──────┘
   │       │                  │
   └───┬───┴──────────────────┘
       ▼
 ┌──────────┐        ┌───────┐
 │PostgreSQL│        │ Kafka │
 │  (5440)  │        │ (9092)│
 └──────────┘        └───────┘
```

## Prerequisites

### Required Services
- **PostgreSQL 15+** (Port 5440)
- **Keycloak** (Port 8080)
- **Kafka** (Port 9092)
- **Java 17+**
- **Maven 3.8+**

### Optional
- **Docker & Docker Compose** (recommended)

## Quick Start

### 1. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and set your **GEMINI_API_KEY**:
```bash
GEMINI_API_KEY=your-actual-api-key-here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

### 2. Start Infrastructure

```bash
# Navigate to infrastructure directory
cd ../../../infrastructure

# Start Keycloak, Kafka, PostgreSQL
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Start Form Services

#### Option A: Docker Compose (Recommended)

```bash
# Navigate to form backend directory
cd ../apps/form/backend

# Start all 5 form services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

#### Option B: Local Development

```bash
# Start each service individually

# Terminal 1 - Form Service
cd form-service
mvn spring-boot:run

# Terminal 2 - Response Service
cd response-service
mvn spring-boot:run

# Terminal 3 - Public Link Service
cd public-link-service
mvn spring-boot:run

# Terminal 4 - Analytics Service
cd analytics-service
mvn spring-boot:run

# Terminal 5 - AI Form Service
cd ai-form-service
mvn spring-boot:run
```

### 4. Verify Services

```bash
# Check form-service health
curl http://localhost:8090/actuator/health

# Check response-service health
curl http://localhost:8091/actuator/health

# Check public-link-service (no auth needed)
curl http://localhost:8092/public/forms/test-id

# Check analytics-service (needs auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8093/api/analytics/forms/test-id

# Check ai-form-service (needs auth token)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Create a contact form","maxFields":5}' \
     http://localhost:8094/api/ai/forms/generate
```

## Database Setup

### Automatic Initialization

The PostgreSQL container automatically creates three databases on first run via [init-dbs.sql](init-dbs.sql):

1. `darevel_form` - Main forms (form-service, public-link-service)
2. `darevel_form_response` - Submissions (response-service)
3. `darevel_form_analytics` - Analytics data (analytics-service)

### Manual Database Creation

If not using Docker:

```sql
-- Connect to PostgreSQL
psql -U postgres -h localhost -p 5440

-- Create databases
CREATE DATABASE darevel_form;
CREATE DATABASE darevel_form_response;
CREATE DATABASE darevel_form_analytics;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE darevel_form TO postgres;
GRANT ALL PRIVILEGES ON DATABASE darevel_form_response TO postgres;
GRANT ALL PRIVILEGES ON DATABASE darevel_form_analytics TO postgres;
```

### Flyway Migrations

Analytics service uses Flyway for schema management:
- Location: `analytics-service/src/main/resources/db/migration/`
- Initial migration: `V1__create_analytics_tables.sql`
- Auto-runs on service startup

## API Documentation

### Public Link Service (No Authentication)

#### Get Public Form
```bash
GET /public/forms/{publicId}

# Example
curl http://localhost:8092/public/forms/abc123
```

#### Submit Form Anonymously
```bash
POST /public/forms/{publicId}/submit
Content-Type: application/json

{
  "answers": [
    {"questionId": "q1", "value": "John Doe"},
    {"questionId": "q2", "value": "john@example.com"}
  ]
}

# Example
curl -X POST http://localhost:8092/public/forms/abc123/submit \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":"q1","value":"Test"}]}'
```

### Analytics Service (Requires Authentication)

#### Get Form Analytics
```bash
GET /api/analytics/forms/{formId}
Authorization: Bearer {token}

# Example
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8093/api/analytics/forms/form-123
```

#### Get Analytics by Date Range
```bash
GET /api/analytics/forms/{formId}/range?start={ISO_DATE}&end={ISO_DATE}
Authorization: Bearer {token}

# Example
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8093/api/analytics/forms/form-123/range?start=2025-01-01T00:00:00&end=2025-12-31T23:59:59"
```

### AI Form Service (Requires Authentication)

#### Generate Form with AI
```bash
POST /api/ai/forms/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "Create a customer feedback survey",
  "formType": "survey",
  "maxFields": 10
}

# Example
curl -X POST http://localhost:8094/api/ai/forms/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a job application form",
    "maxFields": 8
  }'
```

#### Get AI Question Suggestions
```bash
GET /api/ai/forms/suggestions?context={context}
Authorization: Bearer {token}

# Example
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8094/api/ai/forms/suggestions?context=employee onboarding"
```

## Testing

### Get Keycloak Access Token

```bash
# Request token from Keycloak
curl -X POST http://localhost:8080/realms/darevel/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=darevel-form" \
  -d "username=YOUR_USERNAME" \
  -d "password=YOUR_PASSWORD" \
  -d "grant_type=password"

# Extract access_token from response
export TOKEN="eyJhbGciOi..."
```

### Test Public Link Service

```bash
# No authentication needed
curl http://localhost:8092/public/forms/test-id
```

### Test Analytics Service

```bash
# Requires valid JWT token
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8093/api/analytics/forms/test-form-id
```

### Test AI Form Service

```bash
# Generate a contact form
curl -X POST http://localhost:8094/api/ai/forms/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple contact form with name, email, and message",
    "formType": "contact",
    "maxFields": 5
  }'

# Get question suggestions
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:8094/api/ai/forms/suggestions?context=customer satisfaction"
```

## Event-Driven Architecture

### Kafka Topics

The services use Kafka for asynchronous event processing:

| Topic | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| `form.submission.created` | response-service | analytics-service | Track form submissions |

### Testing Kafka Events

```bash
# View Kafka topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Consume events from submission topic
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic form.submission.created \
  --from-beginning
```

## Configuration

### Application Properties

Each service has its own `application.properties` file:

- [form-service/application.properties](form-service/src/main/resources/application.properties)
- [response-service/application.properties](response-service/src/main/resources/application.properties)
- [public-link-service/application.properties](public-link-service/src/main/resources/application.properties)
- [analytics-service/application.properties](analytics-service/src/main/resources/application.properties)
- [ai-form-service/application.properties](ai-form-service/src/main/resources/application.properties)

### Environment Variables

See [.env.example](.env.example) for all available environment variables.

Key variables:
- `GEMINI_API_KEY` - **Required** for AI form service
- `JWT_ISSUER_URI` - Keycloak JWT issuer
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka connection
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` - Database connection

## Troubleshooting

### Services Won't Start

1. **Check prerequisites are running:**
   ```bash
   # Verify PostgreSQL
   docker ps | grep postgres

   # Verify Keycloak
   docker ps | grep keycloak

   # Verify Kafka
   docker ps | grep kafka
   ```

2. **Check database connectivity:**
   ```bash
   psql -h localhost -p 5440 -U postgres -d darevel_form
   ```

3. **Check logs:**
   ```bash
   # Docker Compose
   docker-compose logs -f service-name

   # Local Maven
   # Check console output for errors
   ```

### Analytics Not Showing Data

1. **Verify Kafka is running:**
   ```bash
   docker ps | grep kafka
   ```

2. **Check Kafka consumer group:**
   ```bash
   docker exec -it kafka kafka-consumer-groups \
     --bootstrap-server localhost:9092 \
     --describe \
     --group analytics-service
   ```

3. **Verify submissions are being created:**
   - Submit a form via response-service (8091)
   - Check if event appears in Kafka topic
   - Verify analytics-service logs show event processing

### AI Form Generation Failing

1. **Verify GEMINI_API_KEY is set:**
   ```bash
   echo $GEMINI_API_KEY
   ```

2. **Check API key validity:**
   - Visit https://makersuite.google.com/app/apikey
   - Verify key is active and has quota

3. **Check service logs for Gemini API errors:**
   ```bash
   docker logs darevel-ai-form-service
   ```

### Authentication Errors

1. **Verify Keycloak is running:**
   ```bash
   curl http://localhost:8080/realms/darevel
   ```

2. **Check JWT issuer URI:**
   ```bash
   # Should match Keycloak realm
   echo $JWT_ISSUER_URI
   # Expected: http://localhost:8080/realms/darevel
   ```

3. **Verify client exists in Keycloak:**
   - Login to Keycloak admin console
   - Check that `darevel-form` client exists in `darevel` realm

### Database Connection Issues

1. **Verify databases exist:**
   ```sql
   psql -h localhost -p 5440 -U postgres -l
   ```

2. **Check database schemas:**
   ```sql
   psql -h localhost -p 5440 -U postgres -d darevel_form_analytics
   \dt
   # Should show form_analytics table
   ```

3. **Reset databases (if needed):**
   ```bash
   docker-compose down -v  # WARNING: Deletes all data
   docker-compose up -d
   ```

## Performance Tuning

### Database Connection Pooling

Edit `application.properties` in each service:
```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
```

### Kafka Consumer Tuning

Edit `analytics-service/application.properties`:
```properties
spring.kafka.consumer.max-poll-records=500
spring.kafka.consumer.fetch-min-size=1024
```

### Rate Limiting

Adjust in `.env`:
```bash
# Public Link Service
RATE_LIMIT_REQUESTS_PER_MINUTE=120
RATE_LIMIT_REQUESTS_PER_IP=20

# AI Form Service
RATE_LIMIT_REQUESTS_PER_USER=50
```

## Development

### Building Services

```bash
# Build all services
cd form-service && mvn clean package
cd ../response-service && mvn clean package
cd ../public-link-service && mvn clean package
cd ../analytics-service && mvn clean package
cd ../ai-form-service && mvn clean package
```

### Running Tests

```bash
# Run tests for each service
cd form-service && mvn test
cd ../response-service && mvn test
cd ../public-link-service && mvn test
cd ../analytics-service && mvn test
cd ../ai-form-service && mvn test
```

### Code Style

All services use:
- **Lombok** - Reduce boilerplate
- **Spring Boot DevTools** - Hot reload (dev only)
- **SLF4J** - Logging

## Production Deployment

### Docker Images

Build production Docker images:
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build analytics-service
```

### Environment Variables

For production, set these environment variables:
```bash
SPRING_PROFILES_ACTIVE=prod
JPA_DDL_AUTO=validate
LOG_LEVEL=INFO
GEMINI_API_KEY=your-production-key
JWT_ISSUER_URI=https://your-keycloak-domain/realms/darevel
```

### Health Checks

All services expose health endpoints (if Spring Actuator is enabled):
```bash
GET /actuator/health
GET /actuator/info
```

### Monitoring

Consider adding:
- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization
- **ELK Stack** - Log aggregation

## Security

### Authentication Flow

1. User authenticates with Keycloak
2. Keycloak issues JWT access token
3. Frontend includes token in `Authorization: Bearer {token}` header
4. Services validate JWT against Keycloak issuer
5. Authorized request processed

### Public Endpoints

Only `public-link-service` allows unauthenticated access:
- Enables anonymous form submissions
- Rate limited by IP address
- CORS allows all origins

### Rate Limiting

**Public Link Service:**
- 60 requests per minute (global)
- 10 requests per IP address

**AI Form Service:**
- 20 requests per authenticated user

## API Rate Limits

| Service | Limit | Scope |
|---------|-------|-------|
| Public Link | 60/min | Global |
| Public Link | 10/min | Per IP |
| AI Form | 20/min | Per User |

## Support

For issues and questions:
1. Check [FORM_SERVICES_AUDIT_REPORT.md](FORM_SERVICES_AUDIT_REPORT.md)
2. Review service logs
3. Verify environment configuration

## License

Proprietary - Darevel Platform

---

**Last Updated:** 2025-11-29
**Version:** 1.0.0
**Status:** Production Ready ✅
