# Docker & Kubernetes Management Platform

A full-stack application for managing and monitoring Docker containers, Kubernetes pods, and OpenShift resources with real-time updates via WebSocket.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Backend API Documentation](#backend-api-documentation)
- [Frontend Components](#frontend-components)
- [WebSocket Integration](#websocket-integration)
- [Development](#development)
- [Docker Deployment](#docker-deployment)
- [Configuration](#configuration)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Docker     │  │  Kubernetes  │  │  OpenShift   │          │
│  │ Pod Status   │  │  Dashboard   │  │  Dashboard   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Pod Metrics  │  │  Pod Alerts  │  │  Pod Stream  │          │
│  │    Panel     │  │              │  │   (SSE)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Spring Boot)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Docker     │  │  Kubernetes  │  │  OpenShift   │          │
│  │  Service     │  │   Service    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  WebSocket   │  │   Pod Stream │  │  Connection  │          │
│  │  Broadcast   │  │   Service    │  │   Status     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Docker    │    │  Kubernetes  │    │  OpenShift   │
│    Engine    │    │   Cluster    │    │   Cluster    │
└──────────────┘    └──────────────┘    └──────────────┘
```

## ✨ Features

### Backend Features
- **Docker Container Management**
  - List all containers (running and stopped)
  - View container logs with tail and timestamp options
  - Real-time container status monitoring
  - Health checks

- **Kubernetes Integration**
  - List pods across all namespaces or specific namespace
  - View pod metrics (CPU and Memory)
  - Namespace management
  - Auto-load kubeconfig from standard locations

- **OpenShift Support**
  - Pod listing with labels
  - Health status indicators
  - Restart tracking
  - Age calculations

- **WebSocket Real-time Updates**
  - Automatic pod updates every 10 seconds
  - STOMP protocol with SockJS fallback
  - Broadcasts changes for Docker, Kubernetes, and OpenShift

- **Server-Sent Events (SSE)**
  - Stream pod updates every 5 seconds
  - Support for multiple concurrent clients
  - Automatic connection management

### Frontend Features
- **Docker Pod Status Dashboard**
  - Container list with status indicators
  - CPU and Memory usage
  - Restart counts
  - Auto-refresh every 30 seconds

- **Kubernetes Pod Dashboard**
  - Namespace filtering
  - Status filtering
  - Search functionality
  - Live WebSocket updates
  - Connection status indicators

- **OpenShift Pod Dashboard**
  - Health indicators (green/yellow/red)
  - Expandable pod labels
  - Health summary cards
  - Search by name or labels

- **Pod Metrics Panel**
  - CPU usage charts (top 10 pods)
  - Memory usage charts (top 10 pods)
  - Bar and line chart options
  - Namespace filtering
  - Summary statistics

- **Pod Alerts Component**
  - Severity-based filtering (high/medium/low)
  - Relative timestamps
  - Empty state handling
  - Dismiss functionality

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 2.7.14
- **Java Version**: 11
- **Build Tool**: Maven
- **Libraries**:
  - docker-java 3.2.13
  - kubernetes-client-java 18.0.0
  - fabric8 openshift-client 6.9.2
  - Spring WebSocket + STOMP

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **WebSocket**: SockJS + STOMP.js
- **HTTP Server**: NGINX (production)

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (with Kubernetes enabled) or Docker Engine
- Node.js 18+
- JDK 17+
- Maven 3.6+
- kubectl configured (for Kubernetes features)

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd darevel-main

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8083/api
- WebSocket: ws://localhost:8083/ws

### Manual Setup

#### Backend Setup

```bash
# Navigate to backend directory
cd apps/chat/backend-java/docker-service

# Build the application
./mvnw clean package -DskipTests

# Run the application
java -jar target/docker-service-1.0.0.jar

# Or run with Maven
./mvnw spring-boot:run
```

Backend will start on: http://localhost:8083

#### Frontend Setup

```bash
# Navigate to frontend directory
cd apps/chat

# Install dependencies
npm install

# Install WebSocket libraries
npm install sockjs-client @stomp/stompjs recharts

# Start development server
npm run dev
```

Frontend will start on: http://localhost:5173

## 📡 Backend API Documentation

### Base URL
```
http://localhost:8083/api
```

### Docker Endpoints

#### List Containers
```http
GET /api/docker/containers
GET /api/docker/containers?running=true
```

**Response:**
```json
{
  "success": true,
  "message": "Containers fetched successfully",
  "data": [
    {
      "id": "abc123",
      "names": ["/my-container"],
      "image": "nginx:latest",
      "status": "Up 5 minutes",
      "created": "2 hours ago",
      "ports": ["80/tcp"],
      "cpuPercent": 2.5,
      "memoryUsage": 52428800,
      "restartCount": 0
    }
  ],
  "count": 1
}
```

#### Get Container Logs
```http
GET /api/docker/containers/{id}/logs
GET /api/docker/containers/{id}/logs?tail=100&timestamps=true
```

#### Health Check
```http
GET /api/docker/health
```

### Kubernetes Endpoints

#### List Pods
```http
GET /api/k8s/pods
GET /api/k8s/pods?namespace=default
```

#### List Namespaces
```http
GET /api/k8s/namespaces
```

#### Get Pod Metrics
```http
GET /api/k8s/pods/metrics
GET /api/k8s/pods/metrics?namespace=default
```

**Response:**
```json
{
  "success": true,
  "message": "Pod metrics fetched successfully",
  "data": [
    {
      "name": "nginx-deployment-abc123",
      "namespace": "default",
      "cpuMillicores": 250,
      "memoryMi": 128,
      "cpuFormatted": "250m",
      "memoryFormatted": "128Mi",
      "timestamp": 1700650800000
    }
  ],
  "count": 1
}
```

### OpenShift Endpoints

#### List Pods
```http
GET /api/openshift/pods
GET /api/openshift/pods?namespace=default
```

### Connection Status

#### Get All Connection Status
```http
GET /api/connection-status
```

**Response:**
```json
{
  "docker": "connected",
  "kubernetes": "connected",
  "openshift": "disconnected"
}
```

### Server-Sent Events (SSE)

#### Stream Pod Updates
```http
GET /api/pods/stream?source=kubernetes&namespace=default
```

### WebSocket Endpoints

#### Connect to WebSocket
```javascript
const socket = new SockJS('http://localhost:8083/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function() {
  stompClient.subscribe('/topic/pod-updates', function(message) {
    console.log(JSON.parse(message.body));
  });
});
```

## 🎨 Frontend Components

### DockerPodStatus.jsx
```jsx
import DockerPodStatus from './components/DockerPodStatus';
<DockerPodStatus />
```

### KubernetesPodDashboard.jsx
```jsx
import KubernetesPodDashboard from './components/KubernetesPodDashboard';
<KubernetesPodDashboard />
```

### OpenShiftPodDashboard.jsx
```jsx
import OpenShiftPodDashboard from './components/OpenShiftPodDashboard';
<OpenShiftPodDashboard />
```

### PodMetricsPanel.jsx
```jsx
import PodMetricsPanel from './components/PodMetricsPanel';
<PodMetricsPanel />
```

### PodAlerts.jsx
```jsx
import PodAlerts from './components/PodAlerts';
<PodAlerts alerts={alerts} />
```

## 🐳 Docker Deployment

### Build Images

```bash
# Build backend
cd apps/chat/backend-java/docker-service
docker build -t docker-service:latest .

# Build frontend
cd apps/chat
docker build -t chat-frontend:latest .
```

### Run with Docker Compose

```bash
# From project root
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild services
docker compose up --build -d

# Stop services
docker compose down
```

### Environment Variables

#### Backend
- `SPRING_PROFILES_ACTIVE` - Active Spring profile
- `SERVER_PORT` - Server port (default: 8080)
- `KUBECONFIG` - Path to kubeconfig file

#### Frontend
- `BACKEND_URL` - Backend API URL

### Volume Mounts

#### Backend
- `/var/run/docker.sock:/var/run/docker.sock:ro` - Docker socket
- `$USERPROFILE/.kube/config:/home/spring/.kube/config:ro` - Kubeconfig (Windows)
- `$HOME/.kube/config:/home/spring/.kube/config:ro` - Kubeconfig (Linux/Mac)

## ⚙️ Configuration

### Backend Configuration
`src/main/resources/application.properties`:

```properties
server.port=8083
spring.application.name=docker-service
management.endpoints.web.exposure.include=health,info
```

### Kubernetes Configuration
Place kubeconfig at:
- **Windows**: `%USERPROFILE%\.kube\config`
- **Linux/Mac**: `~/.kube/config`

## 🔍 Troubleshooting

### Backend not connecting to Docker
- Ensure Docker Desktop is running
- Check Docker socket permissions
- On Windows, ensure Docker Desktop exposes daemon

### Kubernetes connection issues
- Verify kubeconfig: `kubectl config view`
- Test connection: `kubectl get pods`

### WebSocket connection failures
- Check CORS settings
- Verify endpoint: `ws://localhost:8083/ws`

## 📝 License

MIT License

## 🤝 Contributing

Contributions welcome! Please submit a Pull Request.
