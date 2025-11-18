# Darevel Chat - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Prerequisites

Make sure you have installed:
- ☑️ **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- ☑️ **Node.js** (for npm) - [Download here](https://nodejs.org/)

That's all you need! Docker will handle Java, Maven, and PostgreSQL.

### 2. Navigate to the Backend Directory

```bash
cd apps/chat/backend-java
```

### 3. Start Everything

```bash
npm install
npm run dev
```

**That's it!** ✨

The command will:
- ✅ Start PostgreSQL database
- ✅ Start Auth Service (authentication & users)
- ✅ Start Chat Service (messaging & WebSocket)
- ✅ Start Permissions Service (Ansible integration)
- ✅ Start Prometheus (metrics)
- ✅ Start Grafana (visualization)

## 📱 Access Your Services

After about 30 seconds, all services will be running:

| Service | URL | Description |
|---------|-----|-------------|
| 🔐 Auth Service | http://localhost:8081 | User registration & login |
| 💬 Chat Service | http://localhost:8082 | Real-time messaging |
| 🔑 Permissions | http://localhost:8083 | Permission management |
| 📊 Prometheus | http://localhost:9090 | Metrics monitoring |
| 📈 Grafana | http://localhost:3001 | Dashboards (admin/admin) |

## 🧪 Test the Services

### Register a User
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Send a Message
```bash
curl -X POST http://localhost:8082/api/chat/general/messages \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "content": "Hello, World!"
  }'
```

### Check Health
```bash
npm run health
```

## 🛑 Stop All Services

```bash
npm run stop
```

Or:

```bash
docker-compose down
```

## 📝 View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
docker-compose logs -f chat-service
docker-compose logs -f permissions-service
```

## 🔧 Troubleshooting

### Services not starting?

1. **Check if Docker is running:**
   ```bash
   docker ps
   ```
   If you get an error, start Docker Desktop.

2. **Check if ports are available:**
   ```bash
   # On Windows
   netstat -ano | findstr "8081 8082 8083"

   # On Mac/Linux
   lsof -i :8081 -i :8082 -i :8083
   ```
   If ports are in use, stop the conflicting services.

3. **Restart everything:**
   ```bash
   npm run stop
   npm run dev
   ```

### Still having issues?

Check the full [README.md](README.md) for detailed instructions or run:

```bash
docker-compose logs
```

to see what went wrong.

## 🎯 Next Steps

1. **Update your frontend** to connect to the new services - see [FRONTEND_MIGRATION.md](FRONTEND_MIGRATION.md)
2. **Explore the APIs** - see [README.md](README.md#api-endpoints)
3. **Set up monitoring** - Open Grafana at http://localhost:3001

## 💡 Tips

- **First run takes longer** - Docker needs to download images and Maven needs to download dependencies
- **Subsequent runs are faster** - Everything is cached
- **Hot reload is enabled** - Java code changes will auto-restart services
- **Data persists** - PostgreSQL data is stored in a Docker volume

## 🆘 Need Help?

- 📖 Read the full [README.md](README.md)
- 🔄 Check [FRONTEND_MIGRATION.md](FRONTEND_MIGRATION.md) for frontend integration
- 🐛 Open an issue on GitHub

---

**Happy Coding!** 🎉
