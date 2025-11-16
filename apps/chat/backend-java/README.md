# Darevel Chat - Java Spring Boot Microservices Backend

This is the Java Spring Boot microservices implementation of the Darevel Chat backend, replacing the Node.js/TypeScript version.

## Architecture

The backend is split into three microservices:

1. **Auth Service** (Port 8081) - User authentication and management
2. **Chat Service** (Port 8082) - Real-time messaging with WebSocket support
3. **Permissions Service** (Port 8083) - Ansible-based permission management

All services use:
- **Java 17**
- **Spring Boot 3.2.1** (Spring Framework 6)
- **PostgreSQL** as the database
- **Spring Boot Actuator** for Prometheus metrics
- **Maven** for build management

## Prerequisites

- Java 17 or higher
- Maven 3.6+ (or use the included Maven Wrapper)
- PostgreSQL 12+ (or use Docker Compose)
- Docker and Docker Compose (optional, for containerized deployment)

## Project Structure

```
backend-java/
├── auth-service/              # Authentication & User Management
│   ├── src/
│   │   └── main/
│   │       ├── java/com/darevel/auth/
│   │       └── resources/application.yml
│   └── pom.xml
├── chat-service/              # Chat & WebSocket
│   ├── src/
│   │   └── main/
│   │       ├── java/com/darevel/chat/
│   │       └── resources/application.yml
│   └── pom.xml
├── permissions-service/       # Permissions & Ansible
│   ├── src/
│   │   └── main/
│   │       ├── java/com/darevel/permissions/
│   │       └── resources/application.yml
│   └── pom.xml
├── common/                    # Shared utilities and DTOs
│   └── src/
│       └── main/java/com/darevel/common/
├── docker-compose.yml         # Docker Compose configuration
├── prometheus.yml             # Prometheus configuration
└── pom.xml                    # Parent POM
```

## Quick Start

### Option 1: Docker Compose (Recommended)

1. **Start all services with Docker Compose:**

```bash
cd apps/chat/backend-java
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Auth Service (port 8081)
- Chat Service (port 8082)
- Permissions Service (port 8083)
- Prometheus (port 9090)
- Grafana (port 3001)

2. **Check service health:**

```bash
# Auth Service
curl http://localhost:8081/actuator/health

# Chat Service
curl http://localhost:8082/actuator/health

# Permissions Service
curl http://localhost:8083/actuator/health
```

### Option 2: Local Development

1. **Start PostgreSQL:**

```bash
# Using Docker
docker run -d \
  --name darevel-postgres \
  -e POSTGRES_USER=darevel_chat \
  -e POSTGRES_PASSWORD=darevel_chat123 \
  -e POSTGRES_DB=darevel_chat \
  -p 5432:5432 \
  postgres:15-alpine

# Or install PostgreSQL locally and create the database
createuser darevel_chat -P
createdb -O darevel_chat darevel_chat
```

2. **Build all services:**

```bash
mvn clean install
```

3. **Run each service:**

```bash
# Terminal 1 - Auth Service
cd auth-service
mvn spring-boot:run

# Terminal 2 - Chat Service
cd chat-service
mvn spring-boot:run

# Terminal 3 - Permissions Service
cd permissions-service
mvn spring-boot:run
```

## API Endpoints

### Auth Service (http://localhost:8081)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/users` - Get all users
- `GET /api/auth/users/{id}` - Get user by ID
- `DELETE /api/auth/users` - Delete all users

### Chat Service (http://localhost:8082)

- `GET /api/chat/{channelId}/messages` - Get messages for a channel
- `POST /api/chat/{channelId}/messages` - Send a message
- `DELETE /api/chat/messages` - Delete all messages
- `DELETE /api/chat/{channelId}/messages` - Delete channel messages
- `WS /ws` - WebSocket endpoint for real-time messaging

### Permissions Service (http://localhost:8083)

- `POST /api/permissions/update` - Update user permissions via Ansible
- `GET /api/permissions/members` - Get all members
- `POST /api/permissions/members` - Add a new member
- `PUT /api/permissions/members/role` - Update member role
- `DELETE /api/permissions/members/{id}` - Delete a member
- `GET /api/permissions/ansible/status` - Check Ansible availability

## Environment Variables

All services support the following environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
POSTGRES_USER=darevel_chat
POSTGRES_PASSWORD=darevel_chat123
POSTGRES_DB=darevel_chat

# JWT Configuration (Auth Service only)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Service URLs (Chat Service only)
AUTH_SERVICE_URL=http://localhost:8081
```

## Monitoring

### Prometheus Metrics

All services expose Prometheus metrics at `/actuator/prometheus`:

- Auth Service: http://localhost:8081/actuator/prometheus
- Chat Service: http://localhost:8082/actuator/prometheus
- Permissions Service: http://localhost:8083/actuator/prometheus

### Health Checks

Health endpoints are available at `/actuator/health`:

- Auth Service: http://localhost:8081/actuator/health
- Chat Service: http://localhost:8082/actuator/health
- Permissions Service: http://localhost:8083/actuator/health

### Grafana Dashboard

When running with Docker Compose, access Grafana at http://localhost:3001
- Username: `admin`
- Password: `admin`

## WebSocket Connection

To connect to the Chat Service WebSocket:

```javascript
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8082/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, (frame) => {
  console.log('Connected:', frame);

  // Subscribe to channel messages
  stompClient.subscribe('/topic/messages/general', (message) => {
    const messageData = JSON.parse(message.body);
    console.log('Received:', messageData);
  });

  // Send a message
  stompClient.send('/app/chat/general/send', {}, JSON.stringify({
    userId: 1,
    content: 'Hello, World!'
  }));
});
```

## Database Schema

The PostgreSQL database includes two main tables:

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    level VARCHAR(50) DEFAULT 'Elementary',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    channel_id VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);
```

## Development

### Building the Project

```bash
# Build all modules
mvn clean install

# Build specific service
mvn clean install -pl auth-service -am

# Skip tests
mvn clean install -DskipTests
```

### Running Tests

```bash
# Run all tests
mvn test

# Run tests for specific service
mvn test -pl chat-service
```

### Hot Reload

Spring Boot DevTools is included for automatic restart during development:

```bash
mvn spring-boot:run
```

## Deployment

### Building Docker Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build auth-service
```

### Production Configuration

For production, update the following:

1. Change `JWT_SECRET` to a secure random string
2. Use strong database passwords
3. Configure proper CORS origins
4. Enable HTTPS/TLS
5. Set up proper logging and monitoring
6. Configure database connection pooling

## Troubleshooting

### Port Already in Use

If ports are already in use, you can change them in `docker-compose.yml` or `application.yml` files.

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs darevel-chat-postgres

# Test connection
psql -h localhost -U darevel_chat -d darevel_chat
```

### Service Not Starting

```bash
# Check service logs
docker logs darevel-auth-service
docker logs darevel-chat-service
docker logs darevel-permissions-service

# Check service health
curl http://localhost:8081/actuator/health
```

## Migration from Node.js Backend

The Java backend provides the same API contract as the Node.js version, so frontend applications should work without changes. Key differences:

1. **Port changes:**
   - Auth: 5001 → 8081
   - Chat: 5001 → 8082
   - Permissions: 5001 → 8083

2. **WebSocket endpoint:** `/ws` (with SockJS support)

3. **Response format:** All APIs return `ApiResponse<T>` wrapper:
   ```json
   {
     "success": true,
     "message": "Success",
     "data": { ... }
   }
   ```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
