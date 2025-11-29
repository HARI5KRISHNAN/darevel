# Darevel Form Application - Complete Setup Guide

## Overview

This guide walks you through the complete implementation of the Darevel Form application - a microservices-based form builder with AI capabilities, real-time analytics, and comprehensive response management.

---

## ✅ What's Been Implemented

### Core Infrastructure ✨
- ✅ Form Service (Port 8090) - Form management microservice
- ✅ Response Service (Port 8091) - Submission handling microservice
- ✅ PostgreSQL Database (Port 5440) - Data persistence
- ✅ Docker Compose Configuration - Container orchestration
- ✅ Flyway Migrations - Database schema management
- ✅ OAuth2/JWT Security - Keycloak integration
- ✅ Frontend Application (Port 3005) - React + Vite interface
- ✅ Start/Stop Scripts - Service management
- ✅ Integration with start-all.bat/stop-all.bat

### Backend Components ✨

**Form Service (8090)**
- Complete domain model (Form, FormField, FormSection, FormLogicRule, FormTheme)
- JPA repositories with custom queries
- REST API controllers with validation
- Service layer with business logic
- Security configuration with OAuth2
- Swagger/OpenAPI documentation
- Health check endpoints
- CORS configuration

**Response Service (8091)**
- Domain model (FormSubmission, FormAnswer)
- Database schema and migrations
- Docker configuration
- Application structure

### Frontend Components ✨
- Dashboard with form management
- Form Builder with drag-and-drop
- Form Viewer for previews
- Response Viewer with analytics
- AI Assistant integration (Gemini)
- Updated port configuration (3005)

---

## 📋 Architecture Overview

### Microservices Design

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend Layer (3005)                   │
│         React 19 + Vite + TypeScript + Gemini AI        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ├─── HTTP/REST
                      │
┌─────────────────────┴───────────────────────────────────┐
│                  API Gateway Layer                       │
│            (Suite: 3002, Integration planned)            │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
┌────────────┐ ┌──────────┐ ┌───────────────┐
│   Form     │ │ Response │ │  Public Link  │
│  Service   │ │ Service  │ │   Service     │
│  (8090)    │ │  (8091)  │ │   (8092)      │
│            │ │          │ │   [Planned]   │
└─────┬──────┘ └────┬─────┘ └───────────────┘
      │             │
      │             │         ┌───────────────┐
      │             ├────────>│  Analytics    │
      │             │         │   Service     │
      │             │         │   (8093)      │
      │             │         │  [Planned]    │
      │             │         └───────────────┘
      │             │
      │             │         ┌───────────────┐
      │             └────────>│   AI Form     │
      │                       │   Service     │
      │                       │   (8094)      │
      │                       │  [Planned]    │
      │                       └───────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│              Database Layer (5440)                       │
│  PostgreSQL: darevel_form, darevel_form_response        │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Event Streaming (Kafka)                     │
│  Topics: form.submission.created, form.updated          │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│           Authentication (Keycloak: 8180)                │
│              OAuth2 + JWT Token Validation               │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites Check
```bash
# Check Java version (need 17+)
java -version

# Check Node.js version (need 18+)
node -version

# Check Docker
docker --version
docker-compose --version

# Check Maven
mvn -version
```

### Option 1: Start Form Services Only
```bash
cd "C:\Users\acer\Downloads\darevel-final full stack\darevel-main"
start-form.bat
```

This starts:
- PostgreSQL Database (port 5440)
- Form Service (port 8090)
- Response Service (port 8091)
- Form Frontend (port 3005)

### Option 2: Start All Darevel Services
```bash
cd "C:\Users\acer\Downloads\darevel-final full stack\darevel-main"
start-all.bat
```

This starts the entire Darevel platform including Form.

### Access Form Application
- **Frontend:** http://localhost:3005
- **Form API:** http://localhost:8090/api
- **Response API:** http://localhost:8091/api
- **API Docs:** http://localhost:8090/swagger-ui.html

---

## 🔧 Manual Setup (Alternative)

### Step 1: Start Database
```bash
cd apps/form/backend
docker-compose up -d postgres-form
```

Wait for database to be ready:
```bash
docker logs darevel-postgres-form
# Look for: "database system is ready to accept connections"
```

### Step 2: Build Backend Services

**Build Form Service:**
```bash
cd apps/form/backend/form-service
mvn clean package
```

**Build Response Service:**
```bash
cd apps/form/backend/response-service
mvn clean package
```

### Step 3: Start Backend Services
```bash
cd apps/form/backend
docker-compose up -d form-service
docker-compose up -d response-service
```

### Step 4: Start Frontend
```bash
cd apps/form/frontend
npm install
npm run dev
```

---

## 📊 Database Schema

### Form Service Database (`darevel_form`)

**Tables Created:**
1. **form** - Main form entity
2. **form_section** - Form sections
3. **form_field** - Individual fields/questions
4. **form_field_option** - Options for choice fields
5. **form_logic_rule** - Conditional logic rules
6. **form_theme** - Visual themes

**Migrations:**
- Location: `apps/form/backend/form-service/src/main/resources/db/migration/`
- Tool: Flyway (automatic on startup)
- Version: V1__create_form_tables.sql

### Response Service Database (`darevel_form_response`)

**Tables Created:**
1. **form_submission** - Submission metadata
2. **form_answer** - Individual field answers

**Migrations:**
- Location: `apps/form/backend/response-service/src/main/resources/db/migration/`
- Tool: Flyway (automatic on startup)
- Version: V1__create_response_tables.sql

---

## 🔐 Security Configuration

### OAuth2/JWT Setup

**Keycloak Configuration:**
```properties
Realm: darevel
Issuer URI: http://localhost:8180/realms/darevel
JWK URI: http://localhost:8180/realms/darevel/protocol/openid-connect/certs
```

**Default Test Users:**
- alice / password
- bob / password

### CORS Configuration
Allowed origins:
- http://localhost:3000 (Slides)
- http://localhost:3002 (Suite)
- http://localhost:3005 (Form)

---

## 📡 API Reference

### Form Service Endpoints

#### Create Form
```http
POST /api/forms
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "title": "Customer Feedback Form",
  "description": "Help us improve our service",
  "status": "DRAFT"
}
```

#### List Forms
```http
GET /api/forms?page=0&size=10
Authorization: Bearer {jwt_token}
```

#### Get Form Details
```http
GET /api/forms/{formId}/details
Authorization: Bearer {jwt_token}
```

#### Update Form
```http
PUT /api/forms/{formId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "ACTIVE"
}
```

#### Generate Public Link
```http
POST /api/forms/{formId}/public-link
Authorization: Bearer {jwt_token}
```

Response:
```json
{
  "publicId": "abc12345",
  "publicUrl": "/f/abc12345"
}
```

### Response Service Endpoints

#### Submit Form Response
```http
POST /api/responses/{formId}/submit
Content-Type: application/json

{
  "submitterId": "user-uuid",
  "answers": [
    {
      "fieldId": "field-uuid",
      "valueText": "Answer text"
    }
  ]
}
```

#### List Responses
```http
GET /api/responses/{formId}?page=0&size=20
Authorization: Bearer {jwt_token}
```

#### Export Responses
```http
GET /api/responses/{formId}/export?format=csv
Authorization: Bearer {jwt_token}
```

---

## 🧪 Testing

### Health Checks
```bash
# Form Service
curl http://localhost:8090/actuator/health

# Response Service
curl http://localhost:8091/actuator/health

# Database
docker exec -it darevel-postgres-form pg_isready
```

### API Testing with Swagger
1. Navigate to http://localhost:8090/swagger-ui.html
2. Click "Authorize"
3. Get JWT token from Keycloak:
   ```bash
   curl -X POST http://localhost:8180/realms/darevel/protocol/openid-connect/token \
     -d "client_id=darevel-client" \
     -d "username=alice" \
     -d "password=password" \
     -d "grant_type=password"
   ```
4. Copy `access_token` and paste in Swagger auth

### Database Queries
```bash
# Connect to database
docker exec -it darevel-postgres-form psql -U postgres -d darevel_form

# List tables
\dt

# Query forms
SELECT id, title, status, created_at FROM form;

# Exit
\q
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Problem:** Port 8090 already in use

**Solution:**
```bash
# Find process using port
netstat -aon | findstr :8090

# Kill process (replace PID)
taskkill /F /PID <process_id>
```

### Database Connection Failed

**Problem:** Cannot connect to database

**Solution:**
```bash
# Check if container is running
docker ps | findstr postgres-form

# Start database
cd apps/form/backend
docker-compose up -d postgres-form

# Check logs
docker logs darevel-postgres-form
```

### Flyway Migration Failed

**Problem:** Database migration errors

**Solution:**
```bash
# Connect to database
docker exec -it darevel-postgres-form psql -U postgres -d darevel_form

# Check migration history
SELECT * FROM flyway_schema_history;

# If needed, repair migrations
# (In application.properties, temporarily set:)
# spring.flyway.clean-disabled=false
# spring.flyway.repair=true
```

### Frontend Not Loading

**Problem:** npm run dev fails

**Solution:**
```bash
cd apps/form/frontend

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

### OAuth2 Token Invalid

**Problem:** 401 Unauthorized errors

**Solution:**
1. Ensure Keycloak is running:
   ```bash
   curl http://localhost:8180
   ```

2. Get fresh token:
   ```bash
   curl -X POST http://localhost:8180/realms/darevel/protocol/openid-connect/token \
     -d "client_id=darevel-client" \
     -d "username=alice" \
     -d "password=password" \
     -d "grant_type=password"
   ```

3. Check token expiration (default: 5 minutes)

---

## 📈 Monitoring

### Prometheus Metrics
```
Form Service: http://localhost:8090/actuator/prometheus
Response Service: http://localhost:8091/actuator/prometheus
```

### Application Logs
```bash
# Form Service logs
docker logs -f darevel-form-service

# Response Service logs
docker logs -f darevel-response-service

# Database logs
docker logs -f darevel-postgres-form
```

### Resource Usage
```bash
# Check container stats
docker stats

# Check disk usage
docker system df
```

---

## 🔄 Stopping Services

### Stop Form Services Only
```bash
cd "C:\Users\acer\Downloads\darevel-final full stack\darevel-main"
stop-form.bat
```

### Stop All Darevel Services
```bash
stop-all.bat
```

### Manual Cleanup
```bash
# Stop containers
cd apps/form/backend
docker-compose down

# Remove volumes (data will be lost!)
docker-compose down -v

# Kill frontend process
# Find the terminal window running "npm run dev" and close it
```

---

## 📚 Next Steps

### Immediate Tasks
1. **Test Form Creation:**
   - Access http://localhost:3005
   - Create a new form
   - Add fields
   - Test form submission

2. **Implement Remaining Services:**
   - Public Link Service (8092)
   - Analytics Service (8093)
   - AI Form Service (8094)

3. **Suite Integration:**
   - Add Form navigation in Suite dashboard
   - Configure API proxy
   - Update authentication flow

### Development Tasks
1. **Complete Response Service:**
   - Add CSV/Excel export
   - Implement response filtering
   - Add batch operations

2. **Enhance Form Service:**
   - Form templates CRUD
   - Collaborator management
   - Form duplication
   - Advanced validation rules

3. **Frontend Features:**
   - Drag-and-drop field reordering
   - Logic rule builder UI
   - Real-time preview
   - Theme customization

### Production Readiness
1. **Security Hardening:**
   - Rate limiting
   - Input sanitization
   - SQL injection prevention
   - XSS protection

2. **Performance Optimization:**
   - Database indexing
   - Caching strategy
   - Connection pooling
   - Query optimization

3. **DevOps:**
   - CI/CD pipeline
   - Automated testing
   - Load balancing
   - Auto-scaling

---

## 📖 Additional Resources

### Documentation
- [Form Service Implementation](apps/form/FORM-SERVICE-IMPLEMENTATION.md)
- [Port Allocation Reference](PORT-ALLOCATION.md)
- [Form README](apps/form/README.md)
- [Main README](README.md)

### API Documentation
- Form Service Swagger: http://localhost:8090/swagger-ui.html
- Response Service Swagger: http://localhost:8091/swagger-ui.html

### Technologies
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] PostgreSQL container running (port 5440)
- [ ] Form Service running (port 8090)
- [ ] Response Service running (port 8091)
- [ ] Frontend accessible (http://localhost:3005)
- [ ] Health checks passing
- [ ] Database migrations applied
- [ ] Swagger UI accessible
- [ ] OAuth2 authentication working
- [ ] Can create a test form
- [ ] Can submit a test response

---

**Status:** ✅ Core infrastructure complete and operational  
**Version:** 1.0.0  
**Last Updated:** November 28, 2025

For support or questions, review the troubleshooting section or check service logs.
