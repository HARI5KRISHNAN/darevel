# Darevel Platform

> A comprehensive suite of collaboration and productivity tools built with modern microservices architecture

## Overview

Darevel is a full-stack platform that provides enterprise-grade collaboration tools including real-time chat, email management, spreadsheets, presentations, and video conferencing. The platform is built using a microservices architecture with Java Spring Boot backends and React frontends.

## Architecture

### Technology Stack

- **Backend**: Java 17+ with Spring Boot 3.2.1
- **Frontend**: React 18+ with TypeScript and Vite
- **Database**: PostgreSQL 12+
- **Authentication**: Keycloak OAuth2/OIDC
- **Video Conferencing**: Jitsi Meet
- **Real-time Communication**: WebSocket (STOMP over SockJS)
- **Monitoring**: Prometheus + Grafana
- **Build Tools**: Maven (backend), npm (frontend)

### Services Overview

The platform consists of the following microservices:

| Service | Backend Port | Frontend Port | Description | Status |
|---------|-------------|---------------|-------------|--------|
| **Chat** | 8081-8088 | 3003 | Real-time messaging and collaboration | ✅ Complete |
| **Slides** | 8084 | 3000 | Presentation management | ✅ Complete |
| **Suite** | 8085 | TBD | Dashboard and monitoring | ✅ Complete |
| **Mail** | 8086 | 3008 | Email and Jitsi integration | ✅ Complete |
| **Sheet** | 8089 | 3004 | Spreadsheet management | ✅ Complete |

### Chat Microservices Breakdown

The Chat application is further divided into multiple microservices:

| Service | Port | Description |
|---------|------|-------------|
| Auth Service | 8081 | User authentication and management |
| Chat Service | 8082 | Real-time messaging with WebSocket |
| Permissions Service | 8083 | Permission management |
| Kubernetes Service | 8084 | K8s cluster monitoring |
| Alerts Service | 8085 | Prometheus alert handling |
| Incidents Service | 8086 | Incident management |
| AI Service | 8087 | AI/ML integration (Ollama) |
| Email Service | 8088 | Email notifications |

## Quick Start

### Prerequisites

Ensure you have the following installed:

- **Docker & Docker Compose** - For all backend services and databases
- **Node.js 18+** - For frontend development only

**Note**: No need to install Java, Maven, or PostgreSQL - everything runs in Docker!

### One-Click Startup (All Services)

**Windows:**
```powershell
.\start-all.bat
```

This will start:
- ✅ Infrastructure (Keycloak + Database)
- ✅ All application databases (separate instances per service)
- ✅ All backend services (Slides, Suite, Mail, Sheet)
- ✅ All frontend applications

Access:
- **Slides**: http://localhost:3000
- **Mail**: http://localhost:3008
- **Sheet**: http://localhost:3004
- **Keycloak**: http://localhost:8180/admin (admin/admin)

### Individual Service Startup

Start services individually for development:

**Windows:**
```powershell
# Start infrastructure first (required)
.\start-infrastructure.bat

# Then start any service
.\start-slides.bat    # Slides (DB + Backend + Frontend)
.\start-suite.bat     # Suite (DB + Backend only)
.\start-mail.bat      # Mail (DB + Backend + Frontend)
.\start-sheet.bat     # Sheet (DB + Backend + Frontend)
```

**Linux/Mac:**
```bash
./start-infrastructure.sh
./start-slides.sh
./start-mail.sh
./start-sheet.sh
```

### Stop Services

**Windows:**
```powershell
.\stop-all.bat           # Stop everything
.\stop-slides.bat        # Stop individual service
.\stop-mail.bat
.\stop-sheet.bat
```

## Service Details

### Chat Service

**Location**: `apps/chat/`

The most comprehensive service with 9 microservices for enterprise chat, monitoring, and incident management.

**Key Features**:
- Real-time messaging with WebSocket
- User authentication and authorization
- Kubernetes cluster monitoring
- Prometheus alert integration
- Incident management
- AI-powered features (Ollama integration)

**Documentation**: [Chat Backend README](apps/chat/backend-java/README.md)

**Quick Start**: [Chat Quick Start Guide](apps/chat/QUICKSTART.md)

### Slides Service

**Location**: `apps/slides/`

Presentation management with rich formatting and slide layouts.

**Key Features**:
- Create, edit, duplicate presentations
- Multiple slide layouts (title, content, choice, poll)
- Rich formatting (colors, gradients, fonts)
- Image support and text styling
- Slide reordering

**Backend Port**: 8084
**Frontend Port**: 3000
**Database**: `darevel_slides`

**Documentation**: [Slides Backend README](apps/slides/backend/README.md)

### Suite/Dashboard Service

**Location**: `apps/suite/`

Central dashboard for user management and service monitoring.

**Key Features**:
- User profile management
- User preferences (theme, language, notifications)
- Integration management
- Multi-service health check aggregation
- Dashboard statistics

**Backend Port**: 8085
**Frontend Port**: TBD
**Database**: `darevel_suite`

**Documentation**: [Suite Backend README](apps/suite/backend/README.md)

### Mail Service

**Location**: `apps/mail/`

Email management with Jitsi video conferencing integration.

**Key Features**:
- Email management (IMAP/SMTP)
- Calendar events
- Jitsi video conferencing
- JWT token generation for Jitsi meetings
- Keycloak SSO integration

**Backend Port**: 8086
**Frontend Port**: 3008
**Database**: `darevel_mail`

**Documentation**:
- [Mail Backend README](apps/mail/backend/README.md)
- [Jitsi + Keycloak SSO Setup](apps/mail/JITSI_KEYCLOAK_SSO_SETUP.md)

### Sheet Service

**Location**: `apps/sheet/`

Spreadsheet management with real-time collaboration support.

**Key Features**:
- Create, edit, delete spreadsheets
- Cell data with formulas and formatting
- Merged cells support
- WebSocket for real-time collaboration
- Auto-save functionality

**Backend Port**: 8089
**Frontend Port**: 3004
**Database**: `darevel_sheet`

**Documentation**: [Sheet Backend README](apps/sheet/backend/README.md)

## Port Reference

### Backend Services

```
8081 - Chat Auth Service
8082 - Chat Service
8083 - Chat Permissions Service
8084 - Slides Service (& Chat Kubernetes Service)
8085 - Suite/Dashboard Service (& Chat Alerts Service)
8086 - Mail Service (& Chat Incidents Service)
8087 - Chat AI Service
8088 - Chat Email Service
8089 - Sheet Service
```

### Frontend Applications

```
3000 - Slides Frontend
3003 - Chat Frontend
3004 - Sheet Frontend
3008 - Mail Frontend
```

### Infrastructure

```
8180 - Keycloak
8000 - Jitsi Meet
9090 - Prometheus
3001 - Grafana
```

### Databases (PostgreSQL)

Each service has its own dedicated PostgreSQL instance:

```
5433 - Keycloak Database (Infrastructure)
5434 - Chat Database
5435 - Slides Database
5436 - Suite Database
5437 - Mail Database
5438 - Sheet Database
```

📖 **See [DATABASE-ARCHITECTURE.md](DATABASE-ARCHITECTURE.md) for detailed database documentation**

## Database Setup

**✅ Automatic Setup**: Databases are automatically created and started when you run the startup scripts!

Each service has its own PostgreSQL container:
- **darevel-postgres-slides** (port 5435) - `darevel_slides`
- **darevel-postgres-suite** (port 5436) - `darevel_suite`
- **darevel-postgres-mail** (port 5437) - `darevel_mail`
- **darevel-postgres-sheet** (port 5438) - `darevel_sheet`

### Manual Database Access (if needed)

```bash
# Connect to any database
psql -h localhost -p 5435 -U postgres -d darevel_slides
psql -h localhost -p 5436 -U postgres -d darevel_suite
psql -h localhost -p 5437 -U postgres -d darevel_mail
psql -h localhost -p 5438 -U postgres -d darevel_sheet
```

All tables are auto-created by Hibernate with `ddl-auto: update`.

**📖 Full database architecture**: See [DATABASE-ARCHITECTURE.md](DATABASE-ARCHITECTURE.md)

## Environment Configuration

### Backend Services

All backend services require these environment variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Keycloak
KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/darevel
KEYCLOAK_JWK_SET_URI=http://localhost:8180/realms/darevel/protocol/openid-connect/certs
```

### Frontend Applications

All frontend applications require:

```env
VITE_API_URL=http://localhost:PORT
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=darevel
VITE_KEYCLOAK_CLIENT_ID=darevel-{service}
```

## Authentication

All services use Keycloak for OAuth2/OIDC authentication.

### Keycloak Configuration

1. Access Keycloak admin: http://localhost:8180/admin
2. Realm: `darevel`
3. Create clients for each service:
   - `darevel-chat`
   - `darevel-slides`
   - `darevel-suite`
   - `darevel-mail`
   - `darevel-sheet`
   - `darevel-jitsi`

### Testing Authentication

```bash
# Get access token
TOKEN=$(curl -X POST http://localhost:8180/realms/darevel/protocol/openid-connect/token \
  -d "client_id=darevel-mail" \
  -d "grant_type=password" \
  -d "username=bob" \
  -d "password=password" \
  | jq -r '.access_token')

# Use token
curl http://localhost:8086/api/mails \
  -H "Authorization: Bearer $TOKEN"
```

## Development

### Building All Services

```bash
# Build all Java services
for service in apps/*/backend; do
  cd $service && mvn clean install
done

# Build all frontends
for app in apps/*/; do
  cd $app && npm install && npm run build
done
```

### Running Tests

```bash
# Test Java services
mvn test

# Test frontends
npm test
```

### Hot Reload

All services support hot reload during development:

- **Backend**: Spring Boot DevTools automatically restarts on changes
- **Frontend**: Vite HMR provides instant updates

## Monitoring

### Prometheus

Prometheus scrapes metrics from all Spring Boot services:

- URL: http://localhost:9090
- Metrics endpoint: `/actuator/prometheus`
- Scrape interval: 15s

### Grafana

Pre-configured dashboards for JVM and application metrics:

- URL: http://localhost:3001
- Default login: `admin/admin`

### Health Checks

All services expose health endpoints:

```bash
curl http://localhost:8084/actuator/health  # Slides
curl http://localhost:8085/api/health       # Suite
curl http://localhost:8086/api/health       # Mail
curl http://localhost:8089/actuator/health  # Sheet
```

## Troubleshooting

### Services Won't Start

1. **Port conflicts**: Check if ports are already in use
   ```bash
   netstat -an | grep 8084
   ```

2. **Database connection**: Verify PostgreSQL is running
   ```bash
   docker ps | grep postgres
   psql -h localhost -U postgres -l
   ```

3. **Keycloak unavailable**: Check Keycloak status
   ```bash
   curl http://localhost:8180/realms/darevel/.well-known/openid-configuration
   ```

### Authentication Fails

1. Verify JWT token is valid (not expired)
2. Check Keycloak realm and client configuration
3. Ensure `KEYCLOAK_JWK_SET_URI` is correct
4. Verify user exists in Keycloak

### Database Issues

1. Check database exists: `psql -l`
2. Verify credentials in environment variables
3. Check network connectivity
4. Review application logs for SQL errors

## Project Structure

```
darevel-main/
├── apps/
│   ├── chat/                   # Chat application
│   │   ├── backend-java/       # Java microservices
│   │   └── [frontend files]    # React frontend
│   ├── slides/                 # Slides application
│   │   ├── backend/            # Spring Boot service
│   │   └── [frontend files]    # React frontend
│   ├── suite/                  # Suite/Dashboard
│   │   ├── backend/            # Spring Boot service
│   │   └── [frontend files]    # React frontend
│   ├── mail/                   # Mail application
│   │   ├── backend/            # Spring Boot service
│   │   └── [frontend files]    # React frontend
│   └── sheet/                  # Sheet application
│       ├── backend/            # Spring Boot service
│       └── [frontend files]    # React frontend
├── infrastructure/             # Infrastructure services
│   ├── keycloak/              # Keycloak configuration
│   └── docker-compose.yml     # Infrastructure compose
└── README.md                  # This file
```

## Security Considerations

### Production Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (64+ characters)
- [ ] Configure proper CORS origins (no wildcards)
- [ ] Enable HTTPS/TLS for all services
- [ ] Set up proper logging and monitoring
- [ ] Configure database connection pooling
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Implement backup strategy

### JWT Secrets

Never use default secrets in production. Generate strong secrets:

```bash
# Linux/Mac
openssl rand -base64 64

# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

## Deployment

### Docker Deployment

Each service includes a Dockerfile:

```bash
# Build image
cd apps/slides/backend
docker build -t darevel-slides:latest .

# Run container
docker run -d \
  -p 8084:8084 \
  -e DB_HOST=postgres \
  -e POSTGRES_PASSWORD=password \
  darevel-slides:latest
```

### Kubernetes Deployment

Kubernetes manifests are available in each service directory:

```bash
kubectl apply -f apps/slides/k8s/
kubectl apply -f apps/suite/k8s/
kubectl apply -f apps/mail/k8s/
kubectl apply -f apps/sheet/k8s/
```

## Migration Status

| Service | Core Features | Auth | Database | Frontend | Status |
|---------|--------------|------|----------|----------|--------|
| Chat | ✅ | ✅ | ✅ | ✅ | Production Ready |
| Slides | ✅ | ✅ | ✅ | ⏳ | Backend Complete |
| Suite | ✅ | ✅ | ✅ | ⏳ | Backend Complete |
| Mail | ✅ | ✅ | ✅ | ⏳ | Backend Complete |
| Sheet | ✅ | ✅ | ✅ | ⏳ | Backend Complete |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

Proprietary - Darevel Platform

## Support

For issues or questions:
- Check service-specific READMEs
- Review troubleshooting sections
- Contact the development team
- Open an issue in the repository

---

**Last Updated**: November 26, 2025
**Platform Version**: 1.0.0
