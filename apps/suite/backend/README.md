# Suite/Dashboard Service - Java Spring Boot Microservice

## Overview

The Suite Service is a Java Spring Boot microservice that provides a unified dashboard for managing user profiles, integrations, and monitoring the health of other Darevel microservices.

## Technology Stack

- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17+
- **Database**: PostgreSQL
- **Security**: Keycloak OAuth2 / JWT
- **Build Tool**: Maven
- **HTTP Client**: WebClient (Reactive)

## Features

### Core Features
- ✅ User profile management
- ✅ User preferences (theme, language, notifications)
- ✅ Integration management (CRUD)
- ✅ Multi-service health check aggregation
- ✅ Dashboard statistics
- ✅ JWT-based authentication via Keycloak
- ✅ Ownership-based authorization

### Service Monitoring
- Real-time health checks for:
  - Chat Service (port 3003)
  - Mail Service (port 3008)
  - Sheet Service (port 3004)
  - Slides Service (port 3000)

## API Endpoints

### Health Check

```
GET    /api/health                     - Service health check
GET    /actuator/health                - Spring Boot actuator health
```

### Users

```
GET    /api/users/me                   - Get current user profile
GET    /api/users/{id}                 - Get user by ID
GET    /api/users/by-email/{email}     - Get user by email
POST   /api/users                      - Create/update user
```

### User Preferences

```
GET    /api/users/{userId}/preferences - Get user preferences
PUT    /api/users/{userId}/preferences - Update user preferences
```

### Dashboard

```
GET    /api/dashboard/overview         - Get dashboard statistics
GET    /api/dashboard/apps-status      - Get all apps health status
```

### Integrations

```
GET    /api/integrations               - List all user integrations
GET    /api/integrations/{id}          - Get integration by ID
POST   /api/integrations               - Create new integration
PUT    /api/integrations/{id}          - Update integration
DELETE /api/integrations/{id}          - Delete integration
```

## Configuration

### Environment Variables

```env
# Server Configuration
SERVER_PORT=8085

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=darevel_suite

# Keycloak OAuth2 Configuration
KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/darevel
KEYCLOAK_JWK_SET_URI=http://localhost:8180/realms/darevel/protocol/openid-connect/certs

# Service URLs for Health Checks
CHAT_SERVICE_URL=http://localhost:3003
MAIL_SERVICE_URL=http://localhost:3008
SHEET_SERVICE_URL=http://localhost:3004
SLIDES_SERVICE_URL=http://localhost:3000
```

## Database Setup

### Create Database

```sql
CREATE DATABASE darevel_suite;
```

### Tables

Tables are automatically created by Hibernate with `ddl-auto: update`:

- **users** - Stores user profiles synced from Keycloak
- **user_preferences** - Stores user preferences
- **integrations** - Stores user integrations/connections

## Running the Service

### Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL 12+
- Keycloak 22+ (for authentication)

### Build

```bash
cd apps/suite/backend
mvn clean install
```

### Run

```bash
mvn spring-boot:run
```

Or with custom configuration:

```bash
java -jar target/dashboard-service-1.0.0.jar \
  --SERVER_PORT=8085 \
  --DB_HOST=localhost \
  --POSTGRES_PASSWORD=your_password
```

### Docker (Optional)

```bash
docker build -t darevel-dashboard-service .
docker run -p 8085:8085 \
  -e DB_HOST=postgres \
  -e POSTGRES_PASSWORD=your_password \
  darevel-dashboard-service
```

## API Authentication

All endpoints (except `/api/health`) require a valid JWT token from Keycloak.

### Example Request

```bash
curl -X GET http://localhost:8085/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Data Models

### User

```json
{
  "id": 1,
  "keycloakId": "uuid-from-keycloak",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://example.com/avatar.jpg",
  "roles": ["user", "admin"],
  "createdAt": "2025-11-26T10:00:00",
  "updatedAt": "2025-11-26T10:00:00"
}
```

### UserPreferences

```json
{
  "id": 1,
  "theme": "light",
  "language": "en",
  "notifications": {
    "email": true,
    "push": true
  },
  "dashboardLayout": {
    "widgets": ["stats", "apps", "integrations"]
  },
  "updatedAt": "2025-11-26T10:00:00"
}
```

### Integration

```json
{
  "id": 1,
  "ownerId": "user-keycloak-id",
  "name": "My Chat Integration",
  "type": "chat",
  "status": "active",
  "config": {
    "url": "http://localhost:3003",
    "enabled": "true"
  },
  "createdAt": "2025-11-26T10:00:00",
  "updatedAt": "2025-11-26T10:00:00"
}
```

### Dashboard Overview Response

```json
{
  "ok": true,
  "data": {
    "appsOnline": 3,
    "totalApps": 4,
    "lastUpdated": "2025-11-26T10:00:00"
  }
}
```

### Apps Status Response

```json
{
  "ok": true,
  "data": {
    "chat": {
      "url": "http://localhost:3003",
      "status": "online"
    },
    "mail": {
      "url": "http://localhost:3008",
      "status": "online"
    },
    "sheet": {
      "url": "http://localhost:3004",
      "status": "offline"
    },
    "slides": {
      "url": "http://localhost:3000",
      "status": "online"
    }
  }
}
```

## Health Check Integration

The Suite service actively monitors the health of other Darevel services:

1. **Configurable URLs**: Service URLs are configured via environment variables
2. **Timeout**: Health checks timeout after 2 seconds
3. **Non-blocking**: Uses reactive WebClient for async checks
4. **Graceful Failures**: Returns "offline" status if service is unreachable

## Testing

```bash
# Run unit tests
mvn test

# Run with coverage
mvn clean verify

# Test health check endpoint
curl http://localhost:8085/api/health
```

## Troubleshooting

### Service won't start

1. Check PostgreSQL is running
2. Verify database `darevel_suite` exists
3. Check Keycloak is accessible at configured URL
4. Verify port 8085 is not in use

### Health checks always show offline

1. Verify other services are running on configured ports
2. Check network connectivity
3. Verify service URLs in application.yml
4. Check firewall rules

### User sync fails

1. Verify Keycloak user exists
2. Check JWT token contains correct claims (sub, email)
3. Verify database connectivity

## Migration Status

✅ **Complete** - Core CRUD functionality
✅ **Complete** - Authentication & Authorization
✅ **Complete** - Health check aggregation
✅ **Complete** - Database persistence
⏳ **Pending** - Frontend integration
⏳ **Pending** - Advanced analytics

## Future Enhancements

- 📊 Advanced analytics dashboard
- 📈 Historical health metrics
- 🔔 Alert notifications for service failures
- 📱 Mobile app support
- 🔗 OAuth integration with external services

## Support

For issues or questions, please contact the development team or open an issue in the project repository.

## License

Proprietary - Darevel Platform
