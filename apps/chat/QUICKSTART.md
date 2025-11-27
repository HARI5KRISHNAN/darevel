# Chat Application - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ installed
- (Optional) Kubernetes cluster with kubectl configured

### 1. Start Backend Services
```powershell
cd apps\chat\backend-java
docker-compose up -d postgres auth-service chat-service permissions-service
```

Wait 60 seconds for services to start, then check:
```powershell
docker-compose ps
```

All services should show "healthy" status.

### 2. Start Frontend
```powershell
cd ..\  # Back to apps\chat
npm install
npm run dev
```

### 3. Access Application
Open browser to: **http://localhost:3003**

### 4. Test Authentication
- Click "Register" to create a new account
- Login with your credentials
- Start chatting!

## 🔧 Full Stack Startup

### Backend (All Services)
```powershell
cd apps\chat\backend-java
docker-compose up -d
```

This starts:
- ✅ PostgreSQL database
- ✅ Auth Service (8081)
- ✅ Chat Service (8082) 
- ✅ Permissions Service (8083)
- ✅ Kubernetes Service (8084)
- ✅ Alerts Service (8085)
- ✅ Incidents Service (8086)
- ⚠️ AI Service (8087) - needs Ollama
- ⚠️ Email Service (8088) - needs SMTP config
- ✅ Nginx Gateway (5001)
- ✅ Prometheus (9090)
- ✅ Grafana (3001)

### Check Service Health
```powershell
# Individual service health
curl http://localhost:8081/actuator/health  # Auth
curl http://localhost:8082/actuator/health  # Chat
curl http://localhost:8083/actuator/health  # Permissions

# Or check via Gateway
curl http://localhost:5001/health
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f chat-service
```

## 🎯 Testing Core Features

### 1. Authentication
```powershell
# Register user
curl -X POST http://localhost:8081/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!","name":"Test User"}'

# Login
curl -X POST http://localhost:8081/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"testuser","password":"Test123!"}'
```

### 2. Chat Messaging
```powershell
# Send message (replace {token} with JWT from login)
curl -X POST http://localhost:8082/api/chat/messages `
  -H "Authorization: Bearer {token}" `
  -H "Content-Type: application/json" `
  -d '{"channelId":"general","content":"Hello World!"}'

# Get messages
curl http://localhost:8082/api/chat/messages/general?page=0&size=50 `
  -H "Authorization: Bearer {token}"
```

### 3. Kubernetes Monitoring (if cluster available)
```powershell
# List all pods
curl http://localhost:8084/api/pods/list

# Start watching pods (WebSocket updates every 10s)
curl -X POST http://localhost:8084/api/pods/watch/start
```

### 4. Alerts (Prometheus Integration)
```powershell
# Get all alerts
curl http://localhost:8085/api/alerts

# Simulate Prometheus webhook
curl -X POST http://localhost:8085/api/alerts/webhook `
  -H "Content-Type: application/json" `
  -d '{
    "groupKey": "test",
    "status": "firing",
    "alerts": [{
      "status": "firing",
      "labels": {"alertname": "HighCPU", "severity": "warning"},
      "annotations": {"summary": "High CPU usage detected"},
      "startsAt": "2025-11-19T10:00:00Z"
    }]
  }'
```

### 5. Incidents
```powershell
# Create incident
curl -X POST http://localhost:8086/api/incidents `
  -H "Content-Type: application/json" `
  -d '{
    "title": "Pod CrashLoopBackOff",
    "description": "Payment service pod is failing",
    "severity": "critical",
    "podName": "payment-service-xyz",
    "namespace": "production"
  }'

# List incidents
curl http://localhost:8086/api/incidents
```

## 🔒 Security Configuration

### Production Secrets
Create `.env` file in `apps/chat/backend-java/`:

```env
POSTGRES_PASSWORD=your-strong-password-here
JWT_SECRET=your-long-random-secret-minimum-32-characters
ALLOWED_ORIGINS=https://yourdomain.com,https://chat.yourdomain.com
```

### Generate Strong JWT Secret
```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

## 📊 Monitoring

### Prometheus
- URL: http://localhost:9090
- Scrapes metrics from all services via `/actuator/prometheus`
- Default scrape interval: 15s

### Grafana
- URL: http://localhost:3001
- Default login: admin/admin
- Pre-configured dashboards for:
  - JVM metrics
  - HTTP requests
  - Database connections
  - Custom business metrics

## 🐛 Troubleshooting

### Services Not Starting
```powershell
# Check logs
docker-compose logs auth-service chat-service

# Restart specific service
docker-compose restart chat-service

# Rebuild if code changed
docker-compose up -d --build chat-service
```

### Database Connection Issues
```powershell
# Check if Postgres is running
docker-compose ps postgres

# Check Postgres logs
docker-compose logs postgres

# Connect to Postgres directly
docker-compose exec postgres psql -U darevel_chat -d darevel_chat
```

### WebSocket Connection Issues
- Ensure Chat Service is running on port 8082
- Check browser console for WebSocket errors
- Verify CORS settings allow your frontend origin
- Check: `ws://localhost:8082/ws` endpoint is accessible

### Frontend Build Issues
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 📝 Development Tips

### Hot Reload Frontend
```powershell
npm run dev
# Vite will auto-reload on file changes
```

### Rebuild Backend Service
```powershell
cd apps\chat\backend-java
docker-compose up -d --build chat-service
```

### View All Service URLs
- Frontend: http://localhost:3003
- Auth API: http://localhost:8081
- Chat API: http://localhost:8082
- Permissions API: http://localhost:8083
- Kubernetes API: http://localhost:8084
- Alerts API: http://localhost:8085
- Incidents API: http://localhost:8086
- AI API: http://localhost:8087
- Email API: http://localhost:8088
- Nginx Gateway: http://localhost:5001
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

## 🎉 Success Indicators

You'll know everything is working when:
1. ✅ All Docker containers show "healthy" status
2. ✅ Frontend loads at http://localhost:3003
3. ✅ You can register and login
4. ✅ You can send and receive messages in real-time
5. ✅ WebSocket shows "connected" in browser console
6. ✅ Health endpoints return 200 OK

## 📚 Next Steps

1. Review `FIXES_APPLIED.md` for details on all fixes
2. Check `MIGRATION_STATUS.md` for remaining work
3. Configure AI Service (Ollama integration)
4. Configure Email Service (SMTP settings)
5. Add comprehensive tests
6. Set up CI/CD pipeline

## 🆘 Need Help?

- Check logs: `docker-compose logs -f [service-name]`
- Review `FIXES_APPLIED.md` for architecture details
- Check health endpoints: `http://localhost:808X/actuator/health`
- Verify environment variables in `.env` file

## 🌐 Other Darevel Services

The Darevel platform includes additional microservices:

- **Slides Service** (Backend: 8084, Frontend: 3000) - Presentation management
- **Suite/Dashboard Service** (Backend: 8085, Frontend: TBD) - User profiles and monitoring
- **Mail Service** (Backend: 8086, Frontend: 3008) - Email and Jitsi integration
- **Sheet Service** (Backend: 8089, Frontend: 3004) - Spreadsheet management

See respective service READMEs for documentation.

---

**Status**: ✅ Core services fully functional and ready for development
**Last Updated**: November 26, 2025
