# Darevel Database Architecture

## Overview

Each Darevel application has its own dedicated PostgreSQL instance running on a separate port for maximum isolation and production readiness.

## Database Port Mapping

| Service | Database Port | Container Name | Database Name | Backend Port |
|---------|--------------|----------------|---------------|--------------|
| **Infrastructure** | 5433 | darevel-postgres-infra | keycloak | N/A |
| **Chat** | 5434 | darevel-postgres-chat | darevel_chat | 8081-8088 |
| **Slides** | 5435 | darevel-postgres-slides | darevel_slides | 8084 |
| **Suite** | 5436 | darevel-postgres-suite | darevel_suite | 8085 |
| **Mail** | 5437 | darevel-postgres-mail | darevel_mail | 8086 |
| **Sheet** | 5438 | darevel-postgres-sheet | darevel_sheet | 8089 |

## Architecture Benefits

### ✅ Isolation
- Each application has its own database instance
- No shared database = No cross-application data conflicts
- Failed database won't affect other applications

### ✅ Scalability
- Each database can be scaled independently
- Resource allocation per application
- Easy to move databases to different servers

### ✅ Security
- Database-level isolation
- Separate credentials per application possible
- Easier to implement database-level firewalls

### ✅ Production Ready
- Mirrors production multi-database architecture
- Easy to migrate to managed database services (AWS RDS, Azure PostgreSQL)
- Independent backups and restores

## Database Configurations

### Infrastructure Database (Port 5433)
```yaml
Container: darevel-postgres-infra
Database: keycloak
Purpose: Authentication data only
Used by: Keycloak
Compose: infrastructure/docker-compose.yml
```

### Chat Database (Port 5434)
```yaml
Container: darevel-postgres-chat
Database: darevel_chat
Purpose: Chat messages, users, channels
Used by: Chat microservices
Compose: apps/chat/backend-java/postgres-compose.yml
```

### Slides Database (Port 5435)
```yaml
Container: darevel-postgres-slides
Database: darevel_slides
Purpose: Presentations and slides
Used by: Slides service
Compose: apps/slides/backend/postgres-compose.yml
```

### Suite Database (Port 5436)
```yaml
Container: darevel-postgres-suite
Database: darevel_suite
Purpose: User profiles, preferences, integrations
Used by: Suite/Dashboard service
Compose: apps/suite/backend/postgres-compose.yml
```

### Mail Database (Port 5437)
```yaml
Container: darevel-postgres-mail
Database: darevel_mail
Purpose: Emails and calendar events
Used by: Mail service
Compose: apps/mail/backend/postgres-compose.yml
```

### Sheet Database (Port 5438)
```yaml
Container: darevel-postgres-sheet
Database: darevel_sheet
Purpose: Spreadsheet data
Used by: Sheet service
Compose: apps/sheet/backend/postgres-compose.yml
```

## Connection Strings

### From Host Machine (Development)

```bash
# Infrastructure
psql -h localhost -p 5433 -U postgres -d keycloak

# Chat
psql -h localhost -p 5434 -U postgres -d darevel_chat

# Slides
psql -h localhost -p 5435 -U postgres -d darevel_slides

# Suite
psql -h localhost -p 5436 -U postgres -d darevel_suite

# Mail
psql -h localhost -p 5437 -U postgres -d darevel_mail

# Sheet
psql -h localhost -p 5438 -U postgres -d darevel_sheet
```

### From Backend Services (Docker)

Backend services connect using `host.docker.internal`:

```yaml
DB_HOST: host.docker.internal
DB_PORT: 5435  # (varies by service)
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres
```

## Startup Scripts

### Individual Services

Each service starts its own database automatically:

```powershell
.\start-slides.bat    # Starts Slides DB (5435) + Backend + Frontend
.\start-suite.bat     # Starts Suite DB (5436) + Backend
.\start-mail.bat      # Starts Mail DB (5437) + Backend + Frontend
.\start-sheet.bat     # Starts Sheet DB (5438) + Backend + Frontend
```

### All Services

Start everything at once:

```powershell
.\start-all.bat       # Starts all databases and services
.\stop-all.bat        # Stops everything
```

## Data Persistence

All databases use Docker volumes for data persistence:

| Volume Name | Purpose |
|-------------|---------|
| darevel-postgres-infra | Keycloak data |
| darevel-postgres-chat-data | Chat data |
| darevel-postgres-slides-data | Presentations |
| darevel-postgres-suite-data | User profiles |
| darevel-postgres-mail-data | Emails |
| darevel-postgres-sheet-data | Spreadsheets |

## Backup and Restore

### Backup Individual Database

```powershell
# Slides database
docker exec darevel-postgres-slides pg_dump -U postgres darevel_slides > slides-backup.sql

# Mail database
docker exec darevel-postgres-mail pg_dump -U postgres darevel_mail > mail-backup.sql

# All databases
docker exec darevel-postgres-slides pg_dump -U postgres darevel_slides > slides-backup.sql
docker exec darevel-postgres-suite pg_dump -U postgres darevel_suite > suite-backup.sql
docker exec darevel-postgres-mail pg_dump -U postgres darevel_mail > mail-backup.sql
docker exec darevel-postgres-sheet pg_dump -U postgres darevel_sheet > sheet-backup.sql
```

### Restore Database

```powershell
# Slides
cat slides-backup.sql | docker exec -i darevel-postgres-slides psql -U postgres darevel_slides

# Mail
cat mail-backup.sql | docker exec -i darevel-postgres-mail psql -U postgres darevel_mail
```

## Monitoring

### Check All Database Status

```powershell
# List all Darevel database containers
docker ps | Select-String "postgres"

# Check specific database health
docker exec darevel-postgres-slides pg_isready -U postgres
docker exec darevel-postgres-suite pg_isready -U postgres
docker exec darevel-postgres-mail pg_isready -U postgres
docker exec darevel-postgres-sheet pg_isready -U postgres
```

### View Database Logs

```powershell
# Slides database logs
docker logs darevel-postgres-slides

# Mail database logs
docker logs darevel-postgres-mail

# Follow logs in real-time
docker logs -f darevel-postgres-slides
```

## Troubleshooting

### Port Already in Use

If a database port is already in use:

```powershell
# Find process using the port
netstat -ano | Select-String ":5435"

# Kill the process
taskkill /F /PID <PID>

# Or stop the Docker container
docker stop darevel-postgres-slides
```

### Database Won't Start

1. Check if container exists:
   ```powershell
   docker ps -a | Select-String slides
   ```

2. Remove and recreate:
   ```powershell
   cd apps/slides/backend
   docker-compose -f postgres-compose.yml down -v
   docker-compose -f postgres-compose.yml up -d
   ```

### Connection Refused

1. Verify container is running:
   ```powershell
   docker ps | Select-String darevel-postgres
   ```

2. Check logs for errors:
   ```powershell
   docker logs darevel-postgres-slides
   ```

3. Verify port mapping:
   ```powershell
   docker port darevel-postgres-slides
   ```

## Migration to Production

### AWS RDS / Azure PostgreSQL

To migrate to managed databases:

1. Create separate database instances per service
2. Update environment variables in backend docker-compose:
   ```yaml
   environment:
     DB_HOST: slides-db.xxxxx.rds.amazonaws.com
     DB_PORT: 5432
     POSTGRES_USER: admin
     POSTGRES_PASSWORD: ${DB_PASSWORD}
   ```

3. Run migrations:
   ```bash
   # Export from Docker
   docker exec darevel-postgres-slides pg_dump -U postgres darevel_slides > slides.sql

   # Import to RDS
   psql -h slides-db.xxxxx.rds.amazonaws.com -U admin -d darevel_slides < slides.sql
   ```

## Security Best Practices

1. **Change default passwords in production**:
   ```env
   POSTGRES_PASSWORD=strong-random-password-here
   ```

2. **Use different passwords per database**:
   ```env
   SLIDES_DB_PASSWORD=slides-specific-password
   MAIL_DB_PASSWORD=mail-specific-password
   ```

3. **Enable SSL connections in production**:
   ```yaml
   environment:
     PGSSLMODE: require
   ```

4. **Restrict network access**:
   - Use firewall rules
   - Don't expose database ports externally
   - Use Docker networks for internal communication

5. **Regular backups**:
   - Automated daily backups
   - Test restore procedures
   - Store backups securely

## Resource Allocation

Adjust database resources per service needs:

```yaml
# In postgres-compose.yml
services:
  postgres-slides:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## Performance Tuning

For production, tune PostgreSQL settings:

```yaml
# In postgres-compose.yml
services:
  postgres-slides:
    command:
      - postgres
      - -c
      - shared_buffers=256MB
      - -c
      - max_connections=100
      - -c
      - work_mem=4MB
```

---

**Last Updated**: November 26, 2025
**Architecture Version**: 2.0 (Isolated Databases)
