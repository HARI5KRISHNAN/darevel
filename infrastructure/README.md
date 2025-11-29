# Darevel Infrastructure

This directory contains the infrastructure services for the Darevel platform.

## Full Infra Stack (all databases, Redis, Kafka, Keycloak, Meilisearch, MinIO)

A consolidated compose file `docker-compose.infra.yml` brings up only infrastructure:
- Multiple Postgres instances (5432–5448 mapped to matching containers)
- Redis (6379, 6385, 6386)
- Kafka + Zookeeper (9092/2181)
- Keycloak (8180)
- Meilisearch (7700)
- MinIO (9500 API / 9501 console)

Start everything:
```bash
cd infrastructure
docker-compose -f docker-compose.infra.yml up -d
```

Stop:
```bash
cd infrastructure
docker-compose -f docker-compose.infra.yml down
```

Service connection examples (from containers):
- Kafka: `kafka:9092`
- Keycloak: `http://keycloak:8080`
- MinIO: `http://minio:9000` (console `http://localhost:9501`)
- Meilisearch: `http://meilisearch:7700`
- Postgres per service: `jdbc:postgresql://postgres-<service>:5432/<db_name>` (see compose)

## Services

### 1. Keycloak (Authentication)
- **Port**: 8180 (http://localhost:8180)
- **Admin Console**: http://localhost:8180/admin
- **Default Credentials**: admin/admin
- **Realm**: darevel
- **Database**: Uses `darevel-postgres-infra` on port 5433

### 2. PostgreSQL (Infrastructure)
- **Container**: darevel-postgres-infra
- **External Port**: 5433 (to avoid conflict with application database)
- **Internal Port**: 5432 (within Docker network)
- **Purpose**: Keycloak database only
- **Connection**: `localhost:5433` (from host), `postgres:5432` (from containers)

## Important: Two PostgreSQL Instances

The Darevel platform uses **two separate PostgreSQL instances**:

### Application Database (darevel-postgres)
```
Port: 5432
Container: darevel-postgres
Purpose: All application databases
Databases:
  - darevel_chat
  - darevel_slides
  - darevel_suite
  - darevel_mail
  - darevel_sheet
```

### Infrastructure Database (darevel-postgres-infra)
```
Port: 5433
Container: darevel-postgres-infra
Purpose: Keycloak database only
Databases:
  - keycloak
```

## Quick Start

### Start Infrastructure

**Windows:**
```powershell
cd infrastructure
docker-compose up -d
```

**Linux/Mac:**
```bash
cd infrastructure
docker-compose up -d
```

Or use the provided scripts from repository root:
```powershell
.\start-infrastructure.bat    # Windows
./start-infrastructure.sh      # Linux/Mac
```

### Verify Services

```powershell
# Check containers
docker ps | Select-String darevel

# Check Keycloak
curl http://localhost:8180/realms/darevel/.well-known/openid-configuration

# Check PostgreSQL (infrastructure)
psql -h localhost -p 5433 -U postgres -l
```

### Stop Infrastructure

```powershell
cd infrastructure
docker-compose down
```

## Configuration

### Environment Variables

Create a `.env` file in the infrastructure directory:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DB_PORT=5433

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_PORT=8180
```

### Default Values

If no `.env` file is provided, these defaults are used:
- PostgreSQL Port: 5433
- PostgreSQL User: postgres
- PostgreSQL Password: postgres
- Keycloak Port: 8180
- Keycloak Admin: admin/admin

## Keycloak Configuration

### Realm Import

The `darevel` realm is automatically imported on first start from:
```
infrastructure/keycloak/darevel-realm.json
```

### Clients

The following OAuth2 clients are pre-configured:
- `darevel-chat`
- `darevel-slides`
- `darevel-suite`
- `darevel-mail`
- `darevel-sheet`
- `darevel-jitsi`

### Test User

A test user is created during realm import:
- **Username**: testuser
- **Password**: password
- **Email**: test@example.com

## Database Schema

### Keycloak Database

Automatically created by Keycloak on first start:
```sql
-- Database: keycloak
-- Tables: ~80+ tables for Keycloak internal use
```

### Application Databases

Application databases are created in the separate `darevel-postgres` instance (port 5432).

## Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:5433 failed: port is already allocated`

**Solution**:
```powershell
# Find process using port 5433
netstat -ano | Select-String ":5433"

# Kill the process or change DB_PORT in .env
```

### Keycloak Won't Start

**Issue**: Keycloak waiting for database

**Solution**:
```powershell
# Check postgres health
docker logs darevel-postgres-infra

# Restart infrastructure
docker-compose restart
```

### Cannot Connect to Postgres

**Issue**: psql connection refused

**Check**:
1. Verify container is running: `docker ps | Select-String postgres-infra`
2. Check correct port (5433, not 5432)
3. Verify credentials (default: postgres/postgres)

```powershell
# Correct connection command
psql -h localhost -p 5433 -U postgres
```

### Reset Keycloak

To completely reset Keycloak (lose all data):

**Windows:**
```powershell
.\reset-keycloak.bat
```

**Linux/Mac:**
```bash
./reset-keycloak.sh
```

This will:
1. Stop Keycloak
2. Remove Keycloak database volume
3. Restart Keycloak
4. Re-import darevel realm

## Networking

### Docker Network

All infrastructure services use the `darevel-network` bridge network.

### Internal Communication

Services communicate using container names:
- Keycloak → PostgreSQL: `postgres:5432`

### External Access

From host machine:
- Keycloak: `localhost:8180`
- PostgreSQL: `localhost:5433`

## Health Checks

### Keycloak Health

```powershell
# HTTP health check
curl http://localhost:8180/health

# Realm configuration
curl http://localhost:8180/realms/darevel/.well-known/openid-configuration
```

### PostgreSQL Health

```powershell
# Using psql
psql -h localhost -p 5433 -U postgres -c "SELECT version();"

# Using Docker
docker exec darevel-postgres-infra pg_isready -U postgres
```

## Production Considerations

### Security

1. **Change default passwords**:
   ```env
   POSTGRES_PASSWORD=strong-random-password-here
   KEYCLOAK_ADMIN_PASSWORD=strong-admin-password-here
   ```

2. **Use secrets management**: Store credentials in Docker secrets or external vault

3. **Enable HTTPS**: Configure SSL/TLS for Keycloak in production

4. **Restrict network access**: Use firewall rules to limit database access

### Performance

1. **Increase resources**: Allocate more CPU/memory to containers
2. **Configure connection pooling**: Adjust PostgreSQL max_connections
3. **Enable caching**: Configure Keycloak caching for better performance

### Backup

```powershell
# Backup Keycloak database
docker exec darevel-postgres-infra pg_dump -U postgres keycloak > keycloak-backup.sql

# Restore
cat keycloak-backup.sql | docker exec -i darevel-postgres-infra psql -U postgres keycloak
```

## Monitoring

### Logs

```powershell
# All infrastructure logs
docker-compose logs -f

# Keycloak only
docker logs -f darevel-keycloak-infra

# PostgreSQL only
docker logs -f darevel-postgres-infra
```

### Resource Usage

```powershell
# Container stats
docker stats darevel-keycloak-infra darevel-postgres-infra
```

## Support

For issues or questions:
- Check service logs: `docker logs <container-name>`
- Verify network: `docker network inspect darevel-network`
- Review main README: `../README.md`

---

**Last Updated**: November 26, 2025
