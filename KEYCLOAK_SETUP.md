# Keycloak SSO Setup for All Darevel Apps

Complete setup guide for integrating **8 Darevel apps** with Keycloak realm (`pilot180`) for seamless authentication.

## Apps Covered

| App      | Port | Client ID          | Description         |
| -------- | ---- | ------------------ | ------------------- |
| Auth     | 3005 | darevel-auth       | Login/auth frontend |
| Chat     | 3003 | darevel-chat       | Chat workspace      |
| Drive    | 3006 | darevel-drive      | Drive module        |
| Excel    | 3004 | darevel-excel      | Spreadsheet app     |
| Notify   | 3007 | darevel-notify     | Notification hub    |
| Suite    | 3002 | darevel-suite      | Main dashboard      |
| Mail     | 3008 | darevel-mail       | Mail client         |
| Slides   | 3000 | darevel-slides     | Presentation app    |

---

## Step 1: Keycloak Client Configuration

Open: [http://localhost:8080/admin](http://localhost:8080/admin)
Login: `admin / admin`
Realm: `pilot180`

### For each app, create a client with:

1. **Client ID**: Use the client ID from the table above (e.g., `darevel-auth`)
2. **Access Type**: `confidential`
3. **Valid Redirect URIs**: `http://localhost:<port>/*` (use port from table)
4. **Web Origins**: `http://localhost:<port>`

### Settings to enable:

- ✅ *Standard Flow Enabled*
- ✅ *Direct Access Grants Enabled*
- ⚙️ *Service Accounts Enabled* (optional)

### After creating each client:

1. Go to the **Credentials** tab
2. Copy the **Secret** value
3. Update the corresponding `apps/<app-name>/.env.local` file
4. Replace `<SECRET_FROM_KEYCLOAK_<APPNAME>>` with the actual secret

---

## Step 2: Environment Configuration

All `.env.local` files have been pre-configured in `apps/<app-name>/.env.local` with:

```bash
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=pilot180
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=darevel-<appname>
KEYCLOAK_CLIENT_SECRET=<SECRET_FROM_KEYCLOAK_<APPNAME>>
NEXT_PUBLIC_APP_URL=http://localhost:<port>
```

**Action Required**: Replace `<SECRET_FROM_KEYCLOAK_<APPNAME>>` with the actual client secret from Keycloak for each app.

### Complete list of files to update:

- `apps/suite/.env.local` - Replace `<SECRET_FROM_KEYCLOAK_SUITE>`
- `apps/auth/.env.local` - Replace `<SECRET_FROM_KEYCLOAK_AUTH>`
- `apps/chat/.env.local` - Replace `<SECRET_FROM_KEYCLOAK_CHAT>`
- `apps/drive/.env.local` - Replace `<SECRET_FROM_KEYCLOAK_DRIVE>`
- `apps/excel/.env.local` - Replace `<SECRET_FROM_KEYCLOAK_EXCEL>`
- `apps/notify/.env.local` - Replace `<SECRET_FROM_KEYCLOAK_NOTIFY>`
- `apps/mail/.env.local` - Replace `<SECRET_FROM_KEYCLOAK_MAIL>`
- `apps/slides/.env.local` - Replace `<SECRET_FROM_KEYCLOAK_SLIDES>`

---

## Step 3: Docker Configuration

The `docker-compose.yml` has been configured with:

```yaml
keycloak:
  image: quay.io/keycloak/keycloak:25.0.0
  container_name: darevel_keycloak
  environment:
    - KEYCLOAK_ADMIN=admin
    - KEYCLOAK_ADMIN_PASSWORD=admin
    - KC_DB=postgres
    - KC_DB_URL_HOST=postgres
    - KC_DB_URL_DATABASE=keycloak
    - KC_DB_USERNAME=keycloak
    - KC_DB_PASSWORD=keycloak
    - KC_HEALTH_ENABLED=true
    - KC_METRICS_ENABLED=true
    - PROXY_ADDRESS_FORWARDING=true
    - KEYCLOAK_FRONTEND_URL=http://localhost:8080
  command: start-dev --import-realm
  ports:
    - "8080:8080"
  volumes:
    - ./keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json
```

### Restart Keycloak:

```bash
docker compose restart keycloak
```

Or start all services:

```bash
docker compose up -d
```

---

## Step 4: Testing Authentication

### Test with PowerShell (Windows):

Replace `<app-name>`, `<secret>`, and credentials as needed:

```powershell
Invoke-WebRequest -Uri "http://localhost:8080/realms/pilot180/protocol/openid-connect/token" `
  -Method POST `
  -Body @{
    grant_type = "password"
    client_id = "darevel-slides"
    client_secret = "<SECRET_FROM_KEYCLOAK_SLIDES>"
    username = "demo@darevel.com"
    password = "demo123"
  } `
  -ContentType "application/x-www-form-urlencoded" | Select-Object -ExpandProperty Content
```

### Test with curl (Linux/Mac):

```bash
curl -X POST "http://localhost:8080/realms/pilot180/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=darevel-slides" \
  -d "client_secret=<SECRET_FROM_KEYCLOAK_SLIDES>" \
  -d "username=demo@darevel.com" \
  -d "password=demo123"
```

✅ If you see `access_token` in the response, your configuration is correct!

---

## Step 5: Start All Apps

```bash
npm run dev
```

Wait for:
- "✅ All backend services are ready!"
- "✓ Ready in …" for all apps

---

## Step 6: Health Check

| Service  | Port | URL                           | Expected Behavior              |
| -------- | ---- | ----------------------------- | ------------------------------ |
| Keycloak | 8080 | http://localhost:8080/admin   | Login page                     |
| Suite    | 3002 | http://localhost:3002         | Redirect to login, then dashboard |
| Auth     | 3005 | http://localhost:3005         | Login & token refresh          |
| Chat     | 3003 | http://localhost:3003         | Chat after login               |
| Drive    | 3006 | http://localhost:3006         | File explorer                  |
| Excel    | 3004 | http://localhost:3004         | Spreadsheet                    |
| Notify   | 3007 | http://localhost:3007         | Notifications                  |
| Mail     | 3008 | http://localhost:3008         | Mail UI                        |
| Slides   | 3000 | http://localhost:3000         | Slides dashboard               |

---

## Optional: Nginx Proxy Configuration

For pretty URLs like `mail.darevel.local`, add to your Nginx config:

```nginx
server {
  listen 80;
  server_name mail.darevel.local;

  location / {
    proxy_pass http://localhost:3008;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}

server {
  listen 80;
  server_name slides.darevel.local;

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}

server {
  listen 80;
  server_name suite.darevel.local;

  location / {
    proxy_pass http://localhost:3002;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}

server {
  listen 80;
  server_name auth.darevel.local;

  location / {
    proxy_pass http://localhost:3005;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}

server {
  listen 80;
  server_name chat.darevel.local;

  location / {
    proxy_pass http://localhost:3003;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}

server {
  listen 80;
  server_name drive.darevel.local;

  location / {
    proxy_pass http://localhost:3006;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}

server {
  listen 80;
  server_name excel.darevel.local;

  location / {
    proxy_pass http://localhost:3004;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}

server {
  listen 80;
  server_name notify.darevel.local;

  location / {
    proxy_pass http://localhost:3007;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}
```

Then update Keycloak Valid Redirect URIs for each client to include:
- `http://<app>.darevel.local/*`

And add to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 notify.darevel.local
127.0.0.1 keycloak.darevel.local
127.0.0.1 suite.darevel.local
```

---

## Troubleshooting

### Issue: `invalid_client_credentials`

**Solution**: Verify the client secret in `.env.local` matches the secret in Keycloak.

1. Go to Keycloak admin console
2. Select `pilot180` realm
3. Click `Clients` in left menu
4. Click on the client (e.g., `darevel-suite`)
5. Go to `Credentials` tab
6. Copy the `Secret` value
7. Update the corresponding `.env.local` file

### Issue: Keycloak not starting

**Solution**: Check Docker logs:

```bash
docker logs darevel_keycloak
```

Common causes:
- Database connection issues
- Port 8080 already in use
- Invalid realm-export.json format

### Issue: Apps not redirecting to Keycloak

**Solution**:
1. Verify `NEXT_PUBLIC_KEYCLOAK_URL` is set correctly in `.env.local`
2. Check Keycloak client redirect URIs match your app URL
3. Clear browser cache and cookies
4. Restart the app: `npm run dev`

### Issue: Realm not imported

**Solution**:
1. Verify `./keycloak/realm-export.json` exists
2. Check Docker logs for import errors: `docker logs darevel_keycloak`
3. Restart Keycloak: `docker compose restart keycloak`
4. Look for "Import: realm 'pilot180'" in logs

### Issue: "Client not found"

**Solution**:
1. Verify the client exists in Keycloak admin console
2. Check the `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` matches exactly
3. Ensure the client is in the `pilot180` realm
4. Create the client manually if needed (see Step 1)

---

## Pre-Created Test Users

Two test users are available in the `pilot180` realm:

### Demo User
- **Email:** demo@darevel.com
- **Password:** demo123
- **Roles:** user
- **Use for:** Testing regular user features

### Admin User
- **Email:** admin@darevel.com
- **Password:** admin123
- **Roles:** user, admin
- **Use for:** Testing admin features

---

## Summary

✅ All 8 apps configured with Keycloak SSO
✅ Environment files ready (just add secrets)
✅ Docker configured with proper settings
✅ Health checks and testing procedures documented
✅ Ready for enterprise deployment with shared auth & roles

---

## Quick Start Checklist

- [ ] Start Keycloak: `docker compose up -d keycloak`
- [ ] Access Keycloak admin: http://localhost:8080/admin
- [ ] Login with `admin / admin`
- [ ] Select `pilot180` realm
- [ ] Create 8 clients (one for each app) with settings from Step 1
- [ ] Copy each client secret from Credentials tab
- [ ] Update all 8 `.env.local` files with actual secrets
- [ ] Restart apps: `npm run dev`
- [ ] Test login on each app
- [ ] Verify SSO works across all apps

---

## Next Steps

1. **Configure clients in Keycloak** (Step 1)
2. **Update secrets in `.env.local` files** (Step 2)
3. **Restart services** (Step 3)
4. **Test authentication** (Step 4)
5. **Launch all apps** (Step 5)
6. **Verify functionality** (Step 6)

For issues or questions, refer to:
- Keycloak documentation: https://www.keycloak.org/docs/latest/
- OpenID Connect spec: https://openid.net/connect/
- This project's GitHub issues

---

## Production Deployment Notes

**⚠️ Current setup is for DEVELOPMENT ONLY!**

For production:

1. **Change admin credentials:**
   ```env
   KEYCLOAK_ADMIN=your_secure_admin
   KEYCLOAK_ADMIN_PASSWORD=VeryStrongPassword123!
   ```

2. **Use HTTPS everywhere:**
   ```bash
   NEXT_PUBLIC_KEYCLOAK_URL=https://auth.yourdomain.com
   NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
   ```

3. **Update redirect URIs to HTTPS:**
   ```
   https://app.yourdomain.com/*
   ```

4. **Enable SSL for database connections**

5. **Use production Keycloak mode:**
   ```yaml
   command: start --optimized --hostname=auth.yourdomain.com
   ```

6. **Enable email verification and password policies**

7. **Set up proper SSL certificates**

8. **Configure rate limiting and brute force protection**

9. **Regular backups of Keycloak database**

10. **Monitor Keycloak logs and metrics**

---

**Last Updated:** 2025-11-12
