# Development Mode Setup

This guide explains how to run the Spring Boot microservices using `mvn spring-boot:run` in Docker for active development with hot reload capabilities.

## Overview

The development setup uses:
- **`mvn spring-boot:run`** - Runs Spring Boot apps directly from source
- **Volume mounts** - Syncs local code changes into containers
- **Spring DevTools** - Enables automatic restart on code changes
- **Debug ports** - Allows remote debugging from your IDE

## Quick Start

### Option 1: Using the start script (recommended)

```bash
./start-dev.sh
```

### Option 2: Manual docker-compose

```bash
# Start infrastructure first
docker-compose up -d postgres postgres-app keycloak redis nginx

# Start microservices in dev mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## Service Access

### Application Ports
- API Gateway: `http://localhost:8081`
- User Service: `http://localhost:8082`
- Drive Service: `http://localhost:8083`
- Mail Service: `http://localhost:8084`
- Chat Service: `http://localhost:8085`
- Notify Service: `http://localhost:8086`
- Excel Service: `http://localhost:8087`
- Slides Service: `http://localhost:8088`
- Keycloak: `http://localhost:8080`

### Debug Ports (for remote debugging)
- User Service: `5005`
- Drive Service: `5006`
- API Gateway: `5007`

## Development Workflow

### 1. Making Code Changes

Simply edit files in `microservices/[service-name]/src/` and the changes will be detected:

```
microservices/
├── user-service/
│   └── src/
│       └── main/
│           └── java/
│               └── com/darevel/user/
│                   └── YourController.java  ← Edit this
```

### 2. Automatic Reload

Spring DevTools will automatically:
1. Detect file changes
2. Restart the application context
3. Apply your changes (usually within 2-5 seconds)

### 3. View Logs

Watch logs for a specific service:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f user-service
```

Watch all services:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
```

### 4. Restart a Service

If you need to manually restart:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart user-service
```

## Remote Debugging

### IntelliJ IDEA

1. Go to **Run > Edit Configurations**
2. Click **+** and select **Remote JVM Debug**
3. Set:
   - Name: `user-service-debug`
   - Host: `localhost`
   - Port: `5005` (or appropriate debug port)
4. Click **OK**
5. Set breakpoints in your code
6. Click the **Debug** button

### VS Code

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Debug User Service",
      "request": "attach",
      "hostName": "localhost",
      "port": 5005
    }
  ]
}
```

## Working with Maven Dependencies

If you add new dependencies to `pom.xml`:

```bash
# Rebuild the container to download dependencies
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build user-service
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d user-service
```

## Performance Optimization

### Maven Repository Cache

Dependencies are cached in a Docker volume `maven_repo` to speed up rebuilds:
- First build: Downloads all dependencies (~2-5 minutes)
- Subsequent builds: Uses cache (~30 seconds)

### Selective Service Startup

Start only the services you're working on:

```bash
# Start only user service
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres postgres-app keycloak user-service

# Start user + api gateway
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres postgres-app keycloak user-service api-gateway
```

## Troubleshooting

### Application Not Reloading

1. Check if DevTools is in the classpath:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec user-service mvn dependency:tree | grep devtools
   ```

2. Verify volume mounts:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec user-service ls -la /app/user-service/src
   ```

### Out of Memory Errors

Increase JVM memory in the Dockerfile.dev:
```dockerfile
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Xmx512m -agentlib:jdwp=..."]
```

### Slow Startup

First startup is slow due to Maven dependency downloads. Subsequent starts are faster thanks to the cached `maven_repo` volume.

## Production vs Development

| Aspect | Production (Dockerfile) | Development (Dockerfile.dev) |
|--------|------------------------|------------------------------|
| Build | Multi-stage, JAR only | Single stage with source |
| Size | ~200MB | ~800MB |
| Startup | Fast (~10s) | Slower (~30s) |
| Hot Reload | No | Yes |
| Debug | No | Yes (port 5005+) |
| Use Case | Deployment | Active development |

## Stopping Services

```bash
# Stop all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```

## Additional Resources

- [Spring Boot DevTools Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools)
- [Maven Spring Boot Plugin](https://docs.spring.io/spring-boot/docs/current/maven-plugin/reference/htmlsingle/)
- [Docker Compose Override](https://docs.docker.com/compose/extends/)
