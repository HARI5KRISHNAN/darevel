# Darevel Suite - Enterprise Microservices Platform

A comprehensive, open-source enterprise platform providing Dashboard, Chat, Spreadsheet, Slides, and Email applications with unified SSO authentication.

## 🏗️ Architecture

This is an enterprise microservices platform with 5 independent applications, each with:
- **Frontend**: React/Next.js (unchanged, kept as-is)
- **Backend**: Spring Boot 3 (Java 17+)
- **Database**: PostgreSQL 15
- **Authentication**: Keycloak (OpenID Connect SSO)

### Applications

| App | Frontend | Backend Port | Database | Purpose |
|-----|----------|--------------|----------|---------|
| **Darevel Dashboard** | Next.js (port 3004) | 8085 | darevel_dashboard | Main SSO entry point & app launcher |
| **Darevel Chat** | React Vite (port 3000) | 8081 | darevel_chat | Real-time messaging & WebRTC calls |
| **Darevel Sheet** | React Vite (port 3001) | 8082 | darevel_sheet | Spreadsheet with collaboration |
| **Darevel Slides** | Next.js (port 3003) | 8084 | darevel_slides | Presentation creation & viewing |
| **Darevel Mail** | React Vite (port 3002) | 8083 | darevel_mail | Email client (IMAP/SMTP) |

## 📋 Prerequisites

- **Docker & Docker Compose** (for PostgreSQL & Keycloak)
- **Java 17+** (or Java 21 recommended)
- **Maven 3.9+** (with Maven Wrapper provided)
- **Node.js 18+** & npm 10+
- **Git**

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repo-url> darevel-suite
cd darevel-suite
```

### 2. Copy Environment Configuration
```bash
cp .env.example .env
# Edit .env if needed (default values work for local development)
```

### 3. Start Infrastructure (PostgreSQL + Keycloak)
```bash
cd infrastructure
docker-compose up -d
```

Wait for services to be healthy:
```bash
# Check status
docker-compose ps
docker-compose logs -f postgres
```

### 4. Build All Backend Microservices
```bash
cd ..
mvn clean package -DskipTests
```

Or build individual services:
```bash
mvn clean package -pl apps/chat/backend -am -DskipTests
mvn clean package -pl apps/excel/backend -am -DskipTests
mvn clean package -pl apps/mail/backend -am -DskipTests
mvn clean package -pl apps/slides/backend -am -DskipTests
mvn clean package -pl apps/suite/backend -am -DskipTests
```

### 5. Start All Backends (from root directory)
```bash
# Windows (PowerShell)
.\scripts\setup-backends.bat

# Linux/Mac
bash scripts/setup-backends.sh
```

Or start manually:
```bash
export JAVA_TOOL_OPTIONS="-Duser.timezone=UTC"

# Chat Backend (port 8081)
java -DSERVER_PORT=8081 -jar apps/chat/backend/target/darevel-chat-backend-1.0.0.jar

# Sheet Backend (port 8082)
java -DSERVER_PORT=8082 -jar apps/excel/backend/target/darevel-sheet-backend-1.0.0.jar

# Mail Backend (port 8083)
java -DSERVER_PORT=8083 -jar apps/mail/backend/target/darevel-mail-backend-1.0.0.jar

# Slides Backend (port 8084)
java -DSERVER_PORT=8084 -jar apps/slides/backend/target/darevel-slides-backend-1.0.0.jar

# Dashboard Backend (port 8085)
java -DSERVER_PORT=8085 -jar apps/suite/backend/target/darevel-dashboard-backend-1.0.0.jar
```

### 6. Start Frontend Applications

In separate terminals:

```bash
# Chat Frontend (port 3000)
cd apps/chat
npm install
npm run dev

# Sheet Frontend (port 3001)
cd apps/excel
npm install
npm run dev

# Mail Frontend (port 3002)
cd apps/mail
npm install
npm run dev

# Slides Frontend (port 3003)
cd apps/slides
npm install
npm run dev

# Dashboard Frontend (port 3004)
cd apps/suite
npm install
npm run dev
```

### 7. Access Applications

- **Dashboard (Main Entry)**: http://localhost:3004
- **Chat**: http://localhost:3000
- **Sheet**: http://localhost:3001
- **Mail**: http://localhost:3002
- **Slides**: http://localhost:3003
- **Keycloak Admin**: http://localhost:8080 (admin/admin)

## 📁 Project Structure

```
darevel-suite/
├── infrastructure/                    # Centralized Docker services
│   ├── docker-compose.yml            # PostgreSQL + Keycloak
│   └── init-databases.sql            # Database initialization
├── apps/
│   ├── chat/                         # Chat application (WebRTC + real-time messaging)
│   │   ├── frontend/                 # React Vite frontend (port 3000)
│   │   └── backend/                  # Spring Boot microservice (port 8081)
│   ├── excel/                        # Sheet application (collaborative spreadsheet)
│   │   ├── frontend/                 # React Vite frontend (port 3001)
│   │   └── backend/                  # Spring Boot microservice (port 8082)
│   ├── mail/                         # Mail application (IMAP/SMTP client)
│   │   ├── frontend/                 # React Vite frontend (port 3002)
│   │   └── backend/                  # Spring Boot microservice (port 8083)
│   ├── slides/                       # Slides application (presentations)
│   │   ├── frontend/                 # Next.js frontend (port 3003)
│   │   └── backend/                  # Spring Boot microservice (port 8084)
│   └── suite/                        # Dashboard application (main SSO entry)
│       ├── frontend/                 # Next.js frontend (port 3004)
│       └── backend/                  # Spring Boot microservice (port 8085)
├── scripts/                           # Helper scripts
│   ├── setup-backends.sh             # Unix: Build & start all backends
│   └── setup-backends.bat            # Windows: Build & start all backends
├── pom.xml                            # Maven parent POM (defines Java 17, Spring Boot 3)
├── package.json                       # npm workspaces root
├── turbo.json                         # Turborepo configuration
├── .env.example                       # Environment variables template
└── README.md                          # This file
```

## 🔐 Authentication Flow

All applications use **Keycloak** for centralized authentication:

1. User logs in at **Dashboard** (main entry point)
2. Redirected to Keycloak OAuth2 login
3. Receives JWT token with user identity & roles
4. JWT validated by each microservice (at port 8081-8085)
5. Access other apps (Chat, Sheet, Mail, Slides) with same JWT token

### Keycloak Configuration

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin`
- URL: http://localhost:8080

**Realm:** `darevel`

**Clients (one per app):**
- `darevel-dashboard` (SSO entry point)
- `darevel-chat` (Chat service)
- `darevel-sheet` (Sheet service)
- `darevel-mail` (Mail service)
- `darevel-slides` (Slides service)

## 🛠️ Development

### Adding Features to an App

Each backend follows Spring Boot 3 + JPA + PostgreSQL pattern:

1. **Entity** - Define domain model in `src/main/java/com/darevel/{app}/entity/`
2. **Repository** - Extend `JpaRepository` in `src/main/java/com/darevel/{app}/repository/`
3. **Service** - Business logic in `src/main/java/com/darevel/{app}/service/`
4. **Controller** - REST endpoints in `src/main/java/com/darevel/{app}/controller/`

Example:
```bash
# Add a new entity for Chat
touch apps/chat/backend/src/main/java/com/darevel/chat/entity/Message.java

# Add a repository
touch apps/chat/backend/src/main/java/com/darevel/chat/repository/MessageRepository.java

# Add a service
touch apps/chat/backend/src/main/java/com/darevel/chat/service/MessageService.java

# Add a controller
touch apps/chat/backend/src/main/java/com/darevel/chat/controller/MessageController.java
```

### Building Individual Services

```bash
# Build Chat backend only
mvn clean package -pl apps/chat/backend -am -DskipTests

# Build all backends
mvn clean package -DskipTests

# Build with tests
mvn clean package
```

### Database Migrations

Each service has its own PostgreSQL database. Enable automatic migrations:
```yaml
# application.yml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # auto, create, create-drop, validate, update
```

## 📊 Database Schema

PostgreSQL instance with 5 separate databases:
- **darevel_dashboard** - Suite/Dashboard app
- **darevel_chat** - Chat app (messages, users, WebRTC signals)
- **darevel_sheet** - Sheet app (spreadsheets, cells, collaboration)
- **darevel_mail** - Mail app (folders, messages, accounts)
- **darevel_slides** - Slides app (presentations, slides, themes)

Connect directly:
```bash
# PostgreSQL CLI (if installed)
psql -h localhost -p 5432 -U postgres -d darevel_chat

# From Docker container
docker exec -it darevel-postgres psql -U postgres -d darevel_chat
```

## 🐳 Docker Deployment

### Production Build

All services containerized for deployment:

```bash
# Build all service images
cd infrastructure && docker-compose build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

Update `.env` with production values:
```bash
DB_HOST=postgres.prod.example.com
DB_PORT=5432
KEYCLOAK_HOSTNAME=keycloak.prod.example.com
KEYCLOAK_ISSUER=https://keycloak.prod.example.com/realms/darevel
```

## 🐛 Troubleshooting

### PostgreSQL won't start
```bash
# Check Docker daemon
docker ps

# View logs
docker-compose logs postgres

# Restart infrastructure
cd infrastructure
docker-compose restart postgres
```

### Backend service fails to start
```bash
# Check logs
cat logs/chat-service.log  # or other service

# View port conflicts
netstat -ano | findstr ":8081"  # Windows
lsof -i :8081                    # Mac/Linux

# Ensure PostgreSQL is healthy
docker-compose logs postgres
```

### Keycloak doesn't initialize
```bash
# Check logs
docker-compose logs keycloak

# Restart
docker-compose restart keycloak

# Wait 30+ seconds for startup
```

### JWT validation errors
Ensure `KEYCLOAK_ISSUER` matches Keycloak realm URL:
```bash
# Should be: http://localhost:8080/realms/darevel
# Or production: https://keycloak.example.com/realms/darevel
```

## 📚 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React 18 / Next.js 14 | Latest |
| **Frontend Build** | Vite / Webpack | Latest |
| **Backend** | Spring Boot 3 | 3.2.1+ |
| **Java** | OpenJDK | 17+ |
| **Database** | PostgreSQL | 15 |
| **Cache** | - | - |
| **Authentication** | Keycloak | 23.0+ |
| **API Protocol** | REST / WebSocket | - |
| **Build Tool** | Maven | 3.9+ |
| **Package Manager** | npm | 10+ |
| **Container** | Docker | 20.10+ |
| **Orchestration** | Docker Compose | 2.0+ |

## 📝 License

Open Source - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues and questions:
- GitHub Issues: [issues](../../issues)
- Email: support@darevel.com

---

**Happy Coding!** 🎉
