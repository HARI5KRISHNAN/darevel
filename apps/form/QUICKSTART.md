# Darevel Forms - Quick Start Guide

## 🚀 Quick Start

### 1. Start Backend Services
```bash
cd apps/form/backend
docker-compose up -d
```

This starts:
- PostgreSQL (port 5440)
- Form Service (port 8090)
- Response Service (port 8091)
- Public Link Service (port 8092)
- Analytics Service (port 8093)
- AI Form Service (port 8094)

### 2. Start Frontend
```bash
cd apps/form/frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3005

### 3. Access Suite Dashboard
```bash
cd apps/suite
npm run dev
```

Dashboard: http://localhost:3002/dashboard

---

## 📦 What's Included

### 5 Backend Microservices
1. **Form Service** - Core form management, CRUD operations
2. **Response Service** - Handle submissions, exports
3. **Public Link Service** - Anonymous form access
4. **Analytics Service** - Submission analytics, trends
5. **AI Form Service** - AI-powered form generation

### Frontend
- React 19 + Vite 6 + TypeScript
- Form builder with drag-drop
- Response viewer with charts
- AI assistance integration

### Infrastructure
- PostgreSQL database (3 schemas)
- Kafka for events
- Docker Compose orchestration
- OAuth2/JWT security ready

---

## 🔑 Configuration

### Required: Gemini API Key
For AI features, set environment variable:

**Windows:**
```batch
setx GEMINI_API_KEY "your-api-key-here"
```

**Linux/Mac:**
```bash
export GEMINI_API_KEY="your-api-key-here"
```

Get API key: https://makersuite.google.com/app/apikey

### Optional: Keycloak Setup
For authentication, ensure Keycloak is running:
```bash
cd infrastructure
docker-compose up -d keycloak
```

Default realm: `darevel`  
URL: http://localhost:8080

---

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3005 | http://localhost:3005 |
| Form API | 8090 | http://localhost:8090/api/forms |
| Response API | 8091 | http://localhost:8091/api/responses |
| Public API | 8092 | http://localhost:8092/public/forms |
| Analytics API | 8093 | http://localhost:8093/api/analytics |
| AI API | 8094 | http://localhost:8094/api/ai/forms |
| PostgreSQL | 5440 | jdbc:postgresql://localhost:5440/darevel_form |

---

## 🧪 Testing

### Health Checks
```bash
# Check all services
curl http://localhost:8090/actuator/health
curl http://localhost:8091/actuator/health
curl http://localhost:8092/actuator/health
curl http://localhost:8093/actuator/health
curl http://localhost:8094/actuator/health
```

### Create Test Form
```bash
curl -X POST http://localhost:8090/api/forms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Form",
    "description": "A test form",
    "isPublic": true,
    "acceptingResponses": true
  }'
```

### AI Form Generation
```bash
curl -X POST http://localhost:8094/api/ai/forms/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "customer feedback survey",
    "formType": "survey",
    "maxFields": 5
  }'
```

---

## 🛠️ Troubleshooting

### Services won't start
```bash
# Check Docker
docker ps

# View logs
docker-compose logs -f form-service

# Restart services
docker-compose restart
```

### Frontend build errors
```bash
cd apps/form/frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database connection issues
```bash
# Check PostgreSQL
docker-compose ps postgres-form

# Connect to database
docker exec -it darevel-postgres-form psql -U postgres -d darevel_form
```

### Port conflicts
If port 5440 is in use, edit `docker-compose.yml`:
```yaml
ports:
  - "5441:5432"  # Change to available port
```

Then update `application.properties` in each service:
```properties
DB_PORT=5441
```

---

## 📚 Documentation

- **FORM-COMPLETE-IMPLEMENTATION.md** - Comprehensive guide
- **SETUP-GUIDE.md** - Detailed setup instructions
- **FORM-SERVICE-IMPLEMENTATION.md** - Backend architecture
- **PORT-ALLOCATION.md** - Complete port mapping

---

## ✅ Verification Checklist

- [ ] PostgreSQL running on port 5440
- [ ] All 5 backend services started
- [ ] Frontend accessible at http://localhost:3005
- [ ] Suite dashboard shows Forms card
- [ ] Gemini API key configured (for AI features)
- [ ] Keycloak running (optional, for auth)

---

## 🎯 Next Steps

1. **Create your first form** at http://localhost:3005
2. **Try AI generation** with the "Generate with AI" button
3. **Share public links** to collect responses
4. **View analytics** in the response dashboard
5. **Integrate with Suite** for unified experience

---

## 📞 Support

Check service status:
```bash
docker-compose ps
```

View real-time logs:
```bash
docker-compose logs -f
```

Stop all services:
```bash
docker-compose down
```

---

**Ready to build forms! 🎉**
