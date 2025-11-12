# Keycloak Setup Scripts

Automated scripts to configure Keycloak environment files for all Darevel apps.

## Purpose

These scripts automatically:
1. Connect to Keycloak admin API
2. Fetch client secrets from the `pilot180` realm
3. Generate `.env.local` files for all 8 Darevel apps
4. Backup existing files before overwriting

## Scripts

### setup-envs.sh (Linux/WSL/Git Bash)

**Requirements:**
- `curl` - HTTP client
- `jq` - JSON processor
- Bash 4.0+

**Usage:**
```bash
# Make executable (first time only)
chmod +x scripts/setup-envs.sh

# Run from repository root
./scripts/setup-envs.sh
```

### setup-envs.ps1 (Windows PowerShell)

**Requirements:**
- PowerShell 5.1+ (included in Windows 10+)

**Usage:**
```powershell
# Run from repository root
.\scripts\setup-envs.ps1
```

## Prerequisites

Before running either script:

1. **Start Keycloak:**
   ```bash
   docker compose up -d keycloak
   ```

2. **Verify Keycloak is accessible:**
   - Open http://localhost:8080/admin
   - Login with `admin / admin`

3. **Ensure realm exists:**
   - Realm `pilot180` should exist in Keycloak
   - This is automatically imported from `keycloak/realm-export.json`

4. **Create clients:**
   - All 8 clients must exist in the `pilot180` realm:
     - darevel-suite
     - darevel-auth
     - darevel-chat
     - darevel-drive
     - darevel-excel
     - darevel-notify
     - darevel-mail
     - darevel-slides

## What Gets Configured

Each `.env.local` file will contain:

```bash
# Keycloak configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=pilot180
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=darevel-<appname>
KEYCLOAK_CLIENT_SECRET=<fetched_from_keycloak>
NEXT_PUBLIC_APP_URL=http://localhost:<port>

# Common configuration
NEXTAUTH_COOKIE_DOMAIN=.darevel.local
NEXTAUTH_SECRET=darevel-nextauth-super-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180

# Service URLs
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/darevel
API_GATEWAY_URL=http://localhost:8081

# ... and more
```

## Client-to-App Mapping

| Client ID          | App Folder | Port |
| ------------------ | ---------- | ---- |
| darevel-suite      | suite      | 3002 |
| darevel-auth       | auth       | 3005 |
| darevel-chat       | chat       | 3003 |
| darevel-drive      | drive      | 3006 |
| darevel-excel      | excel      | 3004 |
| darevel-notify     | notify     | 3007 |
| darevel-mail       | mail       | 3008 |
| darevel-slides     | slides     | 3000 |

## Troubleshooting

### "Failed to get admin token"

**Cause:** Keycloak is not running or not accessible.

**Solution:**
```bash
# Check if Keycloak is running
docker ps | grep keycloak

# Start if not running
docker compose up -d keycloak

# Check logs
docker logs darevel_keycloak
```

### "Client not found in realm"

**Cause:** One or more clients haven't been created in Keycloak.

**Solution:**
1. Open http://localhost:8080/admin
2. Select `pilot180` realm
3. Go to Clients
4. Create missing clients according to [KEYCLOAK_SETUP.md](../KEYCLOAK_SETUP.md) Step 1

### "Secret not found for client"

**Cause:** Client might be configured as public instead of confidential.

**Solution:**
1. Open Keycloak admin
2. Select `pilot180` realm
3. Go to Clients → select the client
4. Change **Access Type** to `confidential`
5. Click Save
6. Re-run the script

### Permission denied (Linux)

**Cause:** Script is not executable.

**Solution:**
```bash
chmod +x scripts/setup-envs.sh
```

## Security Notes

- Scripts use `admin/admin` credentials (development only)
- For production:
  - Use secure admin credentials
  - Store secrets in a secret manager (e.g., HashiCorp Vault, AWS Secrets Manager)
  - Use HTTPS for all Keycloak connections
  - Enable audit logging

## After Running

1. **Verify files were created:**
   ```bash
   ls -la apps/*/\.env.local
   ```

2. **Check a sample file:**
   ```bash
   cat apps/suite/.env.local
   ```

3. **Restart apps:**
   ```bash
   npm run dev
   ```

4. **Test authentication:**
   - Open any app (e.g., http://localhost:3002)
   - You should be redirected to Keycloak login
   - Login with `demo@darevel.com / demo123`
   - Should redirect back to the app

## Backup and Restore

Scripts automatically backup existing `.env.local` files:
```
apps/suite/.env.local.bak.1731423456
```

To restore a backup:
```bash
cp apps/suite/.env.local.bak.1731423456 apps/suite/.env.local
```

## Manual Alternative

If you prefer not to use these scripts, see the manual configuration steps in [KEYCLOAK_SETUP.md](../KEYCLOAK_SETUP.md) Step 2, Option B.
