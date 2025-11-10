# 🚀 Darevel Microservices Architecture

**Enterprise-grade Spring Boot microservices** for the Darevel Suite platform.

## 📐 Architecture Overview

```
                      ┌─────────────────────────────┐
                      │    Frontend Apps (Next.js)  │
                      │  :3000-3007 (8 applications)│
                      └──────────────┬──────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │      API Gateway :8081      │
                      │  (Routing, JWT Validation)  │
                      └──────────────┬──────────────┘
                                     │
           ┌─────────────────────────┼────────────────────────┐
           │                         │                        │
           ▼                         ▼                        ▼
┌────────────────────┐   ┌────────────────────┐   ┌───────────────────┐
│  User Service      │   │  Drive Service     │   │  (Future Services)│
│     :8082          │   │     :8083          │   │  Chat, Mail, etc. │
│ Profile Management │   │ File Storage       │   │                   │
└─────────┬──────────┘   └─────────┬──────────┘   └───────────────────┘
          │                        │
          └────────────┬───────────┘
                       │
           ┌───────────┴────────────┐
           ▼                        ▼
    ┌─────────────┐          ┌──────────┐
    │ PostgreSQL  │          │  Redis   │
    │   :5433     │          │  :6379   │
    └─────────────┘          └──────────┘
```

## 🏗️ Microservices

### 1. **API Gateway (Port 8081)**
- **Purpose**: Single entry point for all API requests
- **Features**:
  - Request routing to microservices
  - JWT token validation (Keycloak)
  - CORS handling
  - Rate limiting ready
  - Load balancing capable

### 2. **User Service (Port 8082)**
- **Purpose**: User profile and account management
- **Features**:
  - User CRUD operations
  - Profile management
  - Keycloak integration
  - Role extraction from JWT
- **Endpoints**:
  - `GET /api/user/profile` - Get current user
  - `PUT /api/user/profile` - Update profile
  - `GET /api/user/{id}` - Get user by ID (Admin only)

### 3. **Drive Service (Port 8083)**
- **Purpose**: File storage and management
- **Features**:
  - File upload/download
  - File metadata storage
  - User-specific file isolation
  - File deletion
- **Endpoints**:
  - `POST /api/drive/upload` - Upload file
  - `GET /api/drive/files` - List user files
  - `GET /api/drive/files/{id}` - Download file
  - `DELETE /api/drive/files/{id}` - Delete file

### 4. **Common Library**
- Shared DTOs (UserDTO, ApiResponse, etc.)
- Security configuration (JWT, CORS)
- Exception handling
- Utility classes

## 🔐 Security Architecture

### JWT Token Flow

```
1. User → Frontend → Keycloak → Login
2. Keycloak → Issues JWT token
3. Frontend → API Gateway (Bearer token)
4. API Gateway → Validates JWT with Keycloak JWKS
5. API Gateway → Routes to Microservice (with token)
6. Microservice → Validates JWT again
7. Microservice → Extracts user info from token
8. Microservice → Returns data
```

### Key Security Features

✅ **OAuth 2.0 / OIDC** with Keycloak
✅ **JWT tokens** (RS256 signing)
✅ **Role-based access control** (RBAC)
✅ **Stateless authentication** (no sessions)
✅ **CORS protection**
✅ **Spring Security** on all services

## 🚀 Getting Started

### Prerequisites

- **Java 21** or higher
- **Maven 3.8+**
- **Docker & Docker Compose**
- **Keycloak** running (port 8080)
- **PostgreSQL** (port 5433)

### 1. Build All Services

```bash
cd microservices
mvn clean install
```

### 2. Run with Docker Compose

```bash
docker-compose up --build
```

This will start:
- PostgreSQL (port 5433)
- Redis (port 6379)
- Keycloak (port 8080)
- API Gateway (port 8081)
- User Service (port 8082)
- Drive Service (port 8083)

### 3. Verify Services

```bash
# Check health
curl http://localhost:8081/actuator/health

# Check routes
curl http://localhost:8081/actuator/gateway/routes
```

## 📚 API Usage Examples

### 1. Get Access Token from Keycloak

```bash
curl -X POST 'http://localhost:8080/realms/pilot180/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=darevel-suite' \
  -d 'client_secret=darevel-suite-secret-2025' \
  -d 'username=demo@darevel.com' \
  -d 'password=demo' \
  -d 'grant_type=password'
```

### 2. Get User Profile

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8081/api/user/profile
```

### 3. Upload File

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  http://localhost:8081/api/drive/upload
```

### 4. List Files

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8081/api/drive/files
```

## 🛠️ Development

### Run Individual Service

```bash
cd user-service
mvn spring-boot:run
```

### Environment Variables

Each service supports these environment variables:

```bash
# Database
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres

# Keycloak
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
KEYCLOAK_JWKS_URI=http://localhost:8080/realms/pilot180/protocol/openid-connect/certs

# Service Port
SERVER_PORT=8082
```

### Hot Reload with Spring Boot DevTools

Add to pom.xml:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
</dependency>
```

## 📊 Database Schema

### Users Table (User Service)
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,     -- Keycloak user ID
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    bio VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);
```

### Files Table (Drive Service)
```sql
CREATE TABLE files (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mimetype VARCHAR(100),
    size BIGINT,
    path VARCHAR(500) NOT NULL,
    folder VARCHAR(255) DEFAULT '/',
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL
);
```

## 🔮 Future Services

Ready to add:

### Mail Service (Port 8084)
- Email send/receive
- Attachments (via Drive Service)
- Inbox management

### Chat Service (Port 8085)
- Real-time messaging
- WebSocket integration
- Message history

### Notify Service (Port 8086)
- Push notifications
- Redis Pub/Sub
- WebSocket notifications

### Excel Service (Port 8087)
- Spreadsheet CRUD
- Formula calculation
- Data export

### Slides Service (Port 8088)
- Presentation CRUD
- Template management
- Collaboration

## 🧪 Testing

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn verify
```

### API Tests with Postman
Import the collection: `postman/Darevel_Microservices.postman_collection.json`

## 📦 Deployment

### Build Docker Images
```bash
# Build all services
docker-compose build

# Or build individually
cd user-service
docker build -t darevel/user-service:1.0.0 .
```

### Push to Registry
```bash
docker tag darevel/user-service:1.0.0 your-registry/user-service:1.0.0
docker push your-registry/user-service:1.0.0
```

### Kubernetes Deployment
See `kubernetes/` directory for manifests.

## 🔍 Monitoring

### Actuator Endpoints

All services expose:
- `/actuator/health` - Health check
- `/actuator/info` - Service info
- `/actuator/metrics` - Metrics

### API Gateway Routes
- `/actuator/gateway/routes` - View all routes

### Logging

Logs are output to console with DEBUG level for development.

For production, configure:
```yaml
logging:
  level:
    root: INFO
    com.darevel: INFO
  file:
    name: /var/log/darevel/service.log
```

## 📖 Documentation

- **API Docs**: [OpenAPI/Swagger] (Coming soon)
- **Architecture Docs**: `/docs/architecture.md`
- **Keycloak Setup**: `/docs/keycloak-setup.md`

## 🤝 Contributing

1. Create feature branch
2. Write tests
3. Ensure `mvn clean verify` passes
4. Create pull request

## 📄 License

MIT License - Darevel Suite 2025

---

## ✅ Benefits Over Node.js Backend

| Feature | Spring Boot | Node.js (Previous) |
|---------|-------------|-------------------|
| **Type Safety** | ✅ Compile-time | ⚠️ Runtime only |
| **Security** | ✅ Spring Security (mature) | ⚠️ Custom JWT validation |
| **Performance** | ✅ JVM optimization | ⚠️ Single-threaded |
| **Transactions** | ✅ @Transactional (ACID) | ⚠️ Manual handling |
| **Connection Pooling** | ✅ HikariCP (built-in) | ⚠️ Requires library |
| **Enterprise Ready** | ✅ Yes | ⚠️ Requires setup |
| **Microservices** | ✅ Spring Cloud | ⚠️ Manual |
| **Monitoring** | ✅ Actuator (built-in) | ⚠️ Requires library |
| **Testing** | ✅ @SpringBootTest | ⚠️ Jest/Mocha |

---

Built with ❤️ for enterprise-grade applications
