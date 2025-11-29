# Darevel Form - Comprehensive Form Builder & Response Management

A full-featured form builder application with AI-powered question generation, real-time analytics, and microservices architecture.

## Quick Start

### Start Form Services
```bash
# From darevel-main directory
start-form.bat
```

### Access Form Application
- **Frontend:** http://localhost:3005
- **Form API:** http://localhost:8090
- **Response API:** http://localhost:8091
- **Database:** localhost:5440

### Stop Form Services
```bash
stop-form.bat
```

## Architecture

### Microservices

#### 1. Form Service (Port 8090)
Manages form structure, fields, logic, and templates.

**Key Features:**
- Create/edit/delete forms
- Section and field management
- Conditional logic rules
- Public link generation
- Visual themes
- Form templates

**API Endpoints:**
```
POST   /api/forms                    - Create form
GET    /api/forms                    - List forms
GET    /api/forms/{id}               - Get form
GET    /api/forms/{id}/details       - Get detailed form
PUT    /api/forms/{id}               - Update form
DELETE /api/forms/{id}               - Delete form
POST   /api/forms/{id}/public-link   - Generate public link
```

#### 2. Response Service (Port 8091)
Handles form submissions and response management.

**Key Features:**
- Accept submissions
- Store answers
- Export responses (CSV/Excel/JSON)
- Response filtering
- Kafka event publishing

#### 3. Public Link Service (Port 8092) - Planned
Anonymous form access and submission.

**Key Features:**
- Public form access via `/f/{publicId}`
- Rate limiting
- Bot protection
- Anonymous submissions

#### 4. Analytics Service (Port 8093) - Planned
Real-time submission analytics and metrics.

**Key Features:**
- Aggregated statistics
- Question-level metrics
- Response trends
- Time-series data
- Chart data preparation

#### 5. AI Form Service (Port 8094) - Planned
AI-powered form generation and enhancement.

**Key Features:**
- Generate questions from prompts
- Auto-create forms
- Response summarization
- Smart suggestions

## Database Schema

### Form Domain (`darevel_form`)

**form**
- Form metadata and settings
- Status tracking (DRAFT, ACTIVE, CLOSED, ARCHIVED)
- Public link management
- Response limits and timing

**form_section**
- Organize questions into sections
- Section titles and descriptions
- Position ordering

**form_field**
- Individual questions/fields
- Multiple field types (text, choice, date, file, etc.)
- Validation rules via JSON config
- Required/optional flags

**form_field_option**
- Options for choice-based fields
- Support for "Other" option
- Position ordering

**form_logic_rule**
- Conditional logic
- Show/hide fields
- Section navigation
- Form termination rules

**form_theme**
- Visual customization
- Color schemes
- Background styles
- Shareable themes

### Response Domain (`darevel_form_response`)

**form_submission**
- Submission metadata
- Submitter information (optional)
- IP address and user agent
- Timestamp tracking

**form_answer**
- Individual field answers
- Multiple value types (text, number, date, JSON)
- Linked to submissions and fields

## Field Types

- **SHORT_TEXT** - Single-line text input
- **LONG_TEXT** - Multi-line textarea
- **NUMBER** - Numeric input with validation
- **EMAIL** - Email with format validation
- **PHONE** - Phone number input
- **URL** - URL with format validation
- **CHOICE_SINGLE** - Radio buttons
- **CHOICE_MULTI** - Checkboxes
- **DROPDOWN** - Select dropdown
- **RATING** - Star/numeric rating
- **DATE** - Date picker
- **TIME** - Time picker
- **FILE** - File upload
- **MATRIX** - Grid of questions
- **SECTION_BREAK** - Visual separator
- **LINEAR_SCALE** - Scale (e.g., 1-10)
- **SLIDER** - Range slider

## Frontend Features

### Form Builder
- Drag-and-drop interface
- Live preview
- Field customization
- Logic rule builder
- Theme editor

### Response Viewer
- Real-time analytics
- Response filtering
- Individual response view
- Export functionality
- Charts and graphs

### Dashboard
- Form list with status
- Quick actions
- Statistics overview
- Recent activity

## Technology Stack

### Backend
- **Spring Boot 3.2.1** - Application framework
- **Java 17** - Programming language
- **PostgreSQL 15** - Database
- **Spring Data JPA** - ORM
- **Flyway** - Database migrations
- **Spring Security** - Authentication/Authorization
- **OAuth2/JWT** - Keycloak integration
- **Spring Kafka** - Event streaming
- **Maven** - Build tool
- **Docker** - Containerization

### Frontend
- **React 19** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 6** - Build tool
- **React Router 7** - Navigation
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **Google Generative AI** - AI features
- **date-fns** - Date utilities

## Security

### Authentication
- OAuth2/JWT via Keycloak
- Secure token validation
- Session management

### Authorization
- Owner-based access control
- Permission validation
- Public form exceptions

### Data Protection
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## Environment Configuration

### Form Service (8090)
```properties
SERVER_PORT=8090
DB_HOST=localhost
DB_PORT=5440
DB_NAME=darevel_form
DB_USER=postgres
DB_PASSWORD=postgres
KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/darevel
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
CORS_ORIGINS=http://localhost:3000,http://localhost:3002,http://localhost:3005
```

### Response Service (8091)
```properties
SERVER_PORT=8091
DB_HOST=localhost
DB_PORT=5440
DB_NAME=darevel_form_response
```

## Development

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven 3.9+
- PostgreSQL 15 (via Docker)

### Build Backend
```bash
cd apps/form/backend/form-service
mvn clean package
```

### Run Backend Locally
```bash
cd apps/form/backend
docker-compose up
```

### Run Frontend Locally
```bash
cd apps/form/frontend
npm install
npm run dev
```

## Event-Driven Architecture

### Kafka Topics

**form.submission.created**
- Published by Response Service
- Consumed by Analytics Service
- Consumed by Notification Service

**form.updated**
- Published by Form Service
- Consumed by Search Service (future)

### Event Flow
1. User submits form via Public Link Service
2. Public Link Service validates and forwards to Response Service
3. Response Service stores submission
4. Kafka event `form.submission.created` published
5. Analytics Service updates metrics
6. Notification Service sends alerts (if configured)

## API Documentation

### OpenAPI/Swagger
- **Form Service:** http://localhost:8090/swagger-ui.html
- **Response Service:** http://localhost:8091/swagger-ui.html

### Health Checks
- **Form Service:** http://localhost:8090/actuator/health
- **Response Service:** http://localhost:8091/actuator/health

## Docker Configuration

### Services
```yaml
postgres-form:      # PostgreSQL database
form-service:       # Form management API
response-service:   # Submission handling API
```

### Networks
- `darevel-network` - Shared with other Darevel services

### Volumes
- `form-postgres-data` - PostgreSQL data persistence

## Testing

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn verify
```

### Frontend Tests
```bash
npm test
```

## Deployment

### Docker Build
```bash
docker-compose build
```

### Docker Run
```bash
docker-compose up -d
```

### Database Migration
Automatic via Flyway on application startup

## Monitoring

### Metrics
- Prometheus endpoints at `/actuator/prometheus`
- Grafana dashboards (infrastructure service)

### Logging
- Console logs with timestamp
- Configurable log levels
- Structured logging format

## Future Enhancements

### ✅ Completed Features (All Implemented!)
- [x] **Public Link Service** (Port 8092) - Anonymous form access
- [x] **Analytics Service** (Port 8093) - Real-time analytics
- [x] **AI Form Service** (Port 8094) - AI-powered generation
- [x] Suite dashboard integration
- [x] Security configurations (OAuth2/JWT)
- [x] Complete documentation suite

### Planned Features (Future v2.0)
- [ ] Form collaboration (real-time editing)
- [ ] Advanced branching logic
- [ ] Form versioning
- [ ] Response editing by respondents
- [ ] Email notifications
- [ ] Webhook integrations
- [ ] Custom domain support
- [ ] A/B testing
- [ ] Response piping
- [ ] Payment integration

### Integration Points
- [x] Suite dashboard integration ✅
- [ ] Shared authentication
- [ ] Unified navigation
- [ ] Cross-service search
- [ ] Shared file storage

---

## 📖 Complete Documentation

All services are now **fully implemented**! See comprehensive guides:

1. **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
2. **[IMPLEMENTATION-COMPLETE.md](./IMPLEMENTATION-COMPLETE.md)** - Full summary
3. **[FORM-COMPLETE-IMPLEMENTATION.md](./FORM-COMPLETE-IMPLEMENTATION.md)** - Architecture deep dive
4. **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** - Detailed setup instructions
5. **[FORM-SERVICE-IMPLEMENTATION.md](./FORM-SERVICE-IMPLEMENTATION.md)** - Backend details

**All 5 microservices are operational:**
- ✅ Form Service (8090)
- ✅ Response Service (8091)
- ✅ Public Link Service (8092)
- ✅ Analytics Service (8093)
- ✅ AI Form Service (8094)

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -aon | findstr :8090

# Kill the process
taskkill /F /PID <process_id>
```

### Database Connection Issues
```bash
# Check PostgreSQL status
docker ps | findstr postgres-form

# View logs
docker logs darevel-postgres-form
```

### Frontend Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Support

For issues or questions:
1. Check logs: `docker logs darevel-form-service`
2. Review configuration files
3. Verify all services are running
4. Check network connectivity

## License

Part of the Darevel Workspace suite.

---

**Version:** 1.0.0  
**Last Updated:** November 2025
