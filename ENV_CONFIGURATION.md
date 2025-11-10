# Environment Configuration Guide

Complete guide to configuring the Darevel Suite using environment variables.

## Overview

The Darevel Suite uses a `.env` file for all configuration. This allows you to:
- Change Docker service ports without editing code
- Switch Docker image versions easily
- Configure different environments (dev/staging/prod)
- Keep secrets secure

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```bash
   code .env
   ```

3. **Start the suite:**
   ```bash
   npm run dev
   ```

## Environment Variables Reference

### Docker Backend Services

#### Ports

```env
# Change these if ports are already in use
POSTGRES_PORT=5432
REDIS_PORT=6379
KEYCLOAK_PORT=8080
```

**When to change:**
- Port already in use by another application
- Running multiple Darevel instances
- Corporate firewall restrictions

**Example - Running on different ports:**
```env
POSTGRES_PORT=5433
REDIS_PORT=6380
KEYCLOAK_PORT=8081
```

#### Docker Images

```env
# Specify exact versions for reproducibility
POSTGRES_IMAGE=postgres:16
REDIS_IMAGE=redis:7
KEYCLOAK_IMAGE=quay.io/keycloak/keycloak:25.0.0
```

**When to change:**
- Testing newer versions
- Security patches required
- Performance optimization

**Example - Using specific versions:**
```env
POSTGRES_IMAGE=postgres:16.1
REDIS_IMAGE=redis:7.2.3
KEYCLOAK_IMAGE=quay.io/keycloak/keycloak:24.0.0
```

#### Keycloak Credentials

```env
# Change these for production!
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```

**⚠️ Security Warning:**
- Default credentials are for **development only**
- Change for staging/production
- Use strong passwords

**Example - Production credentials:**
```env
KEYCLOAK_ADMIN=darevel_admin
KEYCLOAK_ADMIN_PASSWORD=YourStrongPasswordHere123!
```

### Application Configuration

#### Service URLs

```env
# Local development URLs
NEXTAUTH_URL=http://localhost:3005
STORAGE_URL=http://localhost:3006
NOTIFY_URL=http://localhost:3007
```

**Production example:**
```env
NEXTAUTH_URL=https://auth.darevel.com
STORAGE_URL=https://drive.darevel.com
NOTIFY_URL=https://notify.darevel.com
```

#### Secrets

```env
# Change these immediately!
NEXTAUTH_SECRET=darevelsupersecretkey
JWT_SECRET=darevelsupersecretkey
```

**Generate secure secrets:**
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Production example:**
```env
NEXTAUTH_SECRET=wX8tR3mK9pL2vN5qA7bC4dE6fG1hJ0iK
JWT_SECRET=zY9uT4rO8pL3wN2vM6qA1bC5dE7fG0hJ
```

#### Database Connection

```env
DATABASE_URL=postgresql://keycloak:keycloak@localhost:5432/keycloak
```

**Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Production example:**
```env
DATABASE_URL=postgresql://darevel_user:secure_pass@db.darevel.com:5432/darevel_prod
```

#### Redis Connection

```env
REDIS_URL=redis://localhost:6379
```

**With password (production):**
```env
REDIS_URL=redis://:password@localhost:6379
```

**With SSL:**
```env
REDIS_URL=rediss://:password@redis.darevel.com:6380
```

### API Keys

#### OpenAI

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Get your key:**
1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and paste into `.env`

#### Gemini

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXX
```

**Get your key:**
1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Copy and paste into `.env`

#### Ollama

```env
OLLAMA_URL=http://localhost:11434
```

**If Ollama is running elsewhere:**
```env
OLLAMA_URL=http://ollama-server:11434
```

## Environment-Specific Configurations

### Development (.env)

```env
# Docker Services
POSTGRES_PORT=5432
REDIS_PORT=6379
KEYCLOAK_PORT=8080

# App URLs (localhost)
NEXTAUTH_URL=http://localhost:3005
STORAGE_URL=http://localhost:3006
NOTIFY_URL=http://localhost:3007

# Weak secrets (dev only!)
NEXTAUTH_SECRET=dev-secret
JWT_SECRET=dev-secret

# Local connections
DATABASE_URL=postgresql://keycloak:keycloak@localhost:5432/keycloak
REDIS_URL=redis://localhost:6379
```

### Staging (.env.staging)

```env
# Docker Services (different ports to avoid conflicts with dev)
POSTGRES_PORT=5433
REDIS_PORT=6380
KEYCLOAK_PORT=8081

# Staging URLs
NEXTAUTH_URL=https://auth-staging.darevel.com
STORAGE_URL=https://drive-staging.darevel.com
NOTIFY_URL=https://notify-staging.darevel.com

# Moderate security
NEXTAUTH_SECRET=staging-strong-secret-key-here
JWT_SECRET=staging-jwt-secret-key-here

# Staging database
DATABASE_URL=postgresql://darevel_stage:stage_pass@db-staging.darevel.com:5432/darevel_staging
REDIS_URL=redis://:staging_pass@redis-staging.darevel.com:6379
```

### Production (.env.production)

```env
# Docker Services (managed by cloud provider)
# Typically these aren't needed in production - you use managed services

# Production URLs
NEXTAUTH_URL=https://auth.darevel.com
STORAGE_URL=https://drive.darevel.com
NOTIFY_URL=https://notify.darevel.com

# Strong secrets (from secret manager)
NEXTAUTH_SECRET=${SECRET_NEXTAUTH}
JWT_SECRET=${SECRET_JWT}

# Managed database
DATABASE_URL=${DATABASE_CONNECTION_STRING}
REDIS_URL=${REDIS_CONNECTION_STRING}

# Production API keys
OPENAI_API_KEY=${OPENAI_PROD_KEY}
GEMINI_API_KEY=${GEMINI_PROD_KEY}
```

## Loading Environment Variables

### Docker Compose

Docker Compose automatically loads `.env`:

```bash
docker compose up -d
```

Variables in `.env` are available to `docker-compose.yml`:

```yaml
services:
  postgres:
    image: ${POSTGRES_IMAGE:-postgres:16}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
```

### Node.js Applications

The startup script loads `.env` automatically:

```javascript
// scripts/start-dev.js loads .env
import fs from "fs";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  lines.forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  });
}
```

### Individual Apps

Each app can access environment variables:

```typescript
// In any app
const keycloakUrl = process.env.KEYCLOAK_URL;
const databaseUrl = process.env.DATABASE_URL;
```

## Best Practices

### Security

1. **Never commit `.env` to git**
   - Already in `.gitignore`
   - Use `.env.example` for documentation

2. **Use different secrets per environment**
   - Dev: weak/simple
   - Staging: moderate
   - Production: strong from secret manager

3. **Rotate secrets regularly**
   - Change every 90 days
   - After team member departure
   - After suspected compromise

### Organization

1. **Group related variables**
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=darevel
   ```

2. **Use comments**
   ```env
   # OpenAI API Key - from platform.openai.com
   OPENAI_API_KEY=sk-xxxxx
   ```

3. **Keep .env.example updated**
   - Document all variables
   - Show example values
   - Explain when to change

### Validation

1. **Check required variables**
   ```javascript
   const required = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
   required.forEach(key => {
     if (!process.env[key]) {
       throw new Error(`Missing required env var: ${key}`);
     }
   });
   ```

2. **Validate formats**
   ```javascript
   if (!process.env.DATABASE_URL?.startsWith('postgresql://')) {
     throw new Error('Invalid DATABASE_URL format');
   }
   ```

## Troubleshooting

### Variables not loading

**Check `.env` file location:**
```bash
ls -la .env
# Should be in project root
```

**Check syntax:**
```env
# ✅ Correct
PORT=3000
DB_URL=postgresql://localhost/db

# ❌ Wrong
PORT = 3000
DB_URL = "postgresql://localhost/db"
```

### Docker not using .env

**Restart Docker Compose:**
```bash
npm run stop
npm run dev
```

**Check Docker Compose loads .env:**
```bash
docker compose config
# Shows resolved configuration
```

### Port conflicts

**Change ports in .env:**
```env
POSTGRES_PORT=5433
REDIS_PORT=6380
KEYCLOAK_PORT=8081
```

**Update your app URLs:**
```env
DATABASE_URL=postgresql://keycloak:keycloak@localhost:5433/keycloak
REDIS_URL=redis://localhost:6380
```

## Multiple Environments

### Using different .env files

```bash
# Development
cp .env.example .env

# Staging
cp .env.example .env.staging

# Production
cp .env.example .env.production
```

### Loading specific environment

```bash
# Load staging environment
cp .env.staging .env
npm run dev

# Load production environment
cp .env.production .env
npm run build
```

### Using dotenv-cli

```bash
# Install
npm install -g dotenv-cli

# Run with specific env
dotenv -e .env.staging npm run dev
dotenv -e .env.production npm run build
```

## Example Complete .env

```env
# ============================================================
# DAREVEL SUITE - DEVELOPMENT ENVIRONMENT
# ============================================================

# Docker Backend Services
POSTGRES_PORT=5432
REDIS_PORT=6379
KEYCLOAK_PORT=8080

POSTGRES_IMAGE=postgres:16
REDIS_IMAGE=redis:7
KEYCLOAK_IMAGE=quay.io/keycloak/keycloak:25.0.0

KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Application Configuration
NEXTAUTH_URL=http://localhost:3005
NEXTAUTH_SECRET=dev-secret-change-in-production
STORAGE_URL=http://localhost:3006
NOTIFY_URL=http://localhost:3007
JWT_SECRET=dev-jwt-secret-change-in-production

# Database & Cache
DATABASE_URL=postgresql://keycloak:keycloak@localhost:5432/keycloak
REDIS_URL=redis://localhost:6379

# API Keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXX
OLLAMA_URL=http://localhost:11434
```

## Resources

- [Docker Compose environment variables](https://docs.docker.com/compose/environment-variables/)
- [Node.js process.env](https://nodejs.org/api/process.html#process_process_env)
- [The Twelve-Factor App - Config](https://12factor.net/config)

---

**Quick Reference:**

```bash
# Edit environment
code .env

# Restart with new config
npm run stop
npm run dev

# Check what Docker sees
docker compose config
```
