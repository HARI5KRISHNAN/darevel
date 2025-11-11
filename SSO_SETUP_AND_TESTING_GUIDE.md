# SSO Setup and Testing Guide

This guide provides step-by-step instructions for setting up and testing the Keycloak SSO integration for the Darevel Suite.

---

## 📋 Prerequisites

Before starting, ensure you have:
- Docker and Docker Compose installed
- Node.js 18+ and npm installed
- Sudo access (for editing /etc/hosts)
- At least 8GB RAM available
- Ports 80, 3000-3007, 4000, 5432-5433, 6379, 8080-8088 available

---

## 🚀 Step 1: Configure Local DNS

Add the following entries to your `/etc/hosts` file:

```bash
sudo nano /etc/hosts

# Add these lines:
127.0.0.1 darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 notify.darevel.local
127.0.0.1 api.darevel.local
127.0.0.1 keycloak.darevel.local
```

**Verify DNS configuration:**
```bash
ping -c 1 darevel.local
ping -c 1 auth.darevel.local
```

---

## 🐳 Step 2: Start Infrastructure Services

Start the Docker services (Keycloak, PostgreSQL, Redis, Nginx):

```bash
cd /home/user/darevel

# Start all infrastructure services
docker-compose up -d postgres postgres-app keycloak redis nginx

# Verify services are running
docker-compose ps

# Check Keycloak logs
docker logs -f darevel_keycloak
```

**Wait for Keycloak to be fully started** (look for "Started Keycloak" in logs).

**Verify Keycloak is accessible:**
```bash
curl http://localhost:8080/realms/pilot180/.well-known/openid-configuration
```

---

## 📦 Step 3: Install Frontend Dependencies

Install dependencies for all frontend apps:

```bash
# Suite app
cd apps/suite
npm install

# Auth service
cd ../auth
npm install

# Drive app
cd ../drive
npm install

# Slides app
cd ../slides
npm install

# Notify app
cd ../notify
npm install

# Chat app (if NextAuth is integrated)
cd ../chat
npm install next-auth

# Mail app (if NextAuth is integrated)
cd ../mail
npm install next-auth

# Excel app (if NextAuth is integrated)
cd ../excel
npm install next-auth
```

---

## 🏃 Step 4: Start Frontend Applications

Start all frontend applications in separate terminal windows or use a process manager like `pm2`:

### Option A: Using separate terminals

**Terminal 1 - Suite (Main Entry Point):**
```bash
cd /home/user/darevel/apps/suite
npm run dev
```

**Terminal 2 - Auth Service:**
```bash
cd /home/user/darevel/apps/auth
npm run dev
```

**Terminal 3 - Chat:**
```bash
cd /home/user/darevel/apps/chat
npm run dev
```

**Terminal 4 - Mail:**
```bash
cd /home/user/darevel/apps/mail
npm run dev
```

**Terminal 5 - Drive:**
```bash
cd /home/user/darevel/apps/drive
npm run dev
```

**Terminal 6 - Excel:**
```bash
cd /home/user/darevel/apps/excel
npm run dev
```

**Terminal 7 - Slides:**
```bash
cd /home/user/darevel/apps/slides
npm run dev
```

**Terminal 8 - Notify:**
```bash
cd /home/user/darevel/apps/notify
npm run dev
```

### Option B: Using a startup script

Create a file `start-apps.sh`:

```bash
#!/bin/bash

cd /home/user/darevel

# Start Suite
cd apps/suite && npm run dev > ../../logs/suite.log 2>&1 &
SUITE_PID=$!

# Start Auth
cd ../auth && npm run dev > ../../logs/auth.log 2>&1 &
AUTH_PID=$!

# Start Chat
cd ../chat && npm run dev > ../../logs/chat.log 2>&1 &
CHAT_PID=$!

# Start Mail
cd ../mail && npm run dev > ../../logs/mail.log 2>&1 &
MAIL_PID=$!

# Start Drive
cd ../drive && npm run dev > ../../logs/drive.log 2>&1 &
DRIVE_PID=$!

# Start Excel
cd ../excel && npm run dev > ../../logs/excel.log 2>&1 &
EXCEL_PID=$!

# Start Slides
cd ../slides && npm run dev > ../../logs/slides.log 2>&1 &
SLIDES_PID=$!

# Start Notify
cd ../notify && npm run dev > ../../logs/notify.log 2>&1 &
NOTIFY_PID=$!

echo "All apps started!"
echo "Suite PID: $SUITE_PID"
echo "Auth PID: $AUTH_PID"
echo "Chat PID: $CHAT_PID"
echo "Mail PID: $MAIL_PID"
echo "Drive PID: $DRIVE_PID"
echo "Excel PID: $EXCEL_PID"
echo "Slides PID: $SLIDES_PID"
echo "Notify PID: $NOTIFY_PID"

# Keep script running
wait
```

Make it executable and run:
```bash
chmod +x start-apps.sh
mkdir -p logs
./start-apps.sh
```

---

## 🔍 Step 5: Verify Services Are Running

Check that all apps are running and accessible:

```bash
# Check via localhost (bypassing Nginx)
curl http://localhost:3002  # Suite
curl http://localhost:3005  # Auth
curl http://localhost:3003  # Chat
curl http://localhost:3004  # Mail
curl http://localhost:3006  # Drive
curl http://localhost:3001  # Excel
curl http://localhost:3000  # Slides
curl http://localhost:3007  # Notify

# Check via domains (through Nginx)
curl http://darevel.local
curl http://auth.darevel.local
curl http://chat.darevel.local
```

---

## 🧪 Step 6: Test SSO Flow

### Test 1: Initial Login

1. **Open browser** to `http://darevel.local`
2. **Expected**: You should be redirected to the auth service or Keycloak login page
3. **Login** with test credentials:
   - Email: `demo@darevel.com`
   - Password: `demo123`
4. **Expected**: After login, you should be redirected back to the Suite dashboard
5. **Verify**: You should see user information displayed (name, email)

### Test 2: Session Sharing (SSO)

1. **After logging in** to Suite, open a new tab
2. **Navigate** to `http://chat.darevel.local`
3. **Expected**: You should be automatically logged in without being prompted for credentials
4. **Verify**: User information is displayed in the Chat app

5. **Repeat** for other apps:
   - `http://mail.darevel.local`
   - `http://drive.darevel.local`
   - `http://excel.darevel.local`
   - `http://slides.darevel.local`
   - `http://notify.darevel.local`

6. **Expected**: All apps should recognize your session without requiring re-login

### Test 3: Session Cookie

1. **Open browser DevTools** (F12)
2. **Go to Application/Storage** → **Cookies**
3. **Select** `.darevel.local`
4. **Verify**: You should see a cookie named `darevel-session`
5. **Check cookie properties**:
   - Domain: `.darevel.local`
   - Path: `/`
   - HttpOnly: ✓
   - SameSite: Lax

### Test 4: Logout

1. **From Suite app**, click logout button
2. **Expected**: You should be logged out and redirected to login page
3. **Try accessing** `http://chat.darevel.local`
4. **Expected**: You should be redirected to login (session is cleared)

### Test 5: Token Validation (API Gateway)

1. **Login** to Suite
2. **Open DevTools** → **Network** tab
3. **Make an API call** from any app to the API Gateway (e.g., `/api/user/profile`)
4. **Check request headers**: Should include JWT token
5. **Expected**: API Gateway validates the token and returns data

### Test 6: Admin Access

1. **Login** with admin credentials:
   - Email: `admin@darevel.com`
   - Password: `admin123`
2. **Navigate** to admin-only sections
3. **Expected**: Admin user has access to all features
4. **Logout** and login as `demo@darevel.com`
5. **Expected**: Regular user has restricted access

---

## 🔐 Step 7: Verify Keycloak Configuration

### Check Keycloak Admin Console

1. **Navigate** to `http://localhost:8080`
2. **Click** "Administration Console"
3. **Login** with:
   - Username: `admin`
   - Password: `admin`
4. **Select realm**: `pilot180`
5. **Check Clients**: Verify all 8 clients are configured
   - darevel-suite
   - darevel-auth
   - darevel-chat
   - ai-email-assistant (mail)
   - darevel-drive
   - darevel-excel
   - darevel-slides
   - darevel-notify

### Verify Client Configuration

For each client, check:
- **Root URL**: Matches the domain (e.g., `http://darevel.local`)
- **Valid Redirect URIs**: Includes both localhost and domain URLs
- **Web Origins**: Includes both localhost and domain URLs
- **Client Authentication**: ON for confidential clients
- **Standard Flow**: Enabled

---

## 📊 Step 8: Monitor and Debug

### View Application Logs

```bash
# Suite logs
tail -f logs/suite.log

# Auth logs
tail -f logs/auth.log

# Keycloak logs
docker logs -f darevel_keycloak

# Nginx logs
docker logs -f darevel_nginx

# API Gateway logs
docker logs -f darevel_api_gateway
```

### Check Session Status

```bash
# Check session from Suite
curl -H "Cookie: darevel-session=<session-token>" http://darevel.local/api/auth/session

# Check session from Chat
curl -H "Cookie: darevel-session=<session-token>" http://chat.darevel.local/api/auth/session
```

### Debug Network Issues

```bash
# Test Nginx routing
curl -v http://darevel.local

# Test Keycloak connectivity
curl http://localhost:8080/realms/pilot180/.well-known/openid-configuration

# Test API Gateway
curl http://localhost:8081/api/health
```

---

## 🛠️ Troubleshooting

### Problem: "Cannot connect to Keycloak"

**Solution:**
1. Verify Keycloak is running: `docker ps | grep keycloak`
2. Check Keycloak health: `curl http://localhost:8080/health/ready`
3. Wait for Keycloak to fully start (can take 1-2 minutes)
4. Check firewall isn't blocking port 8080

### Problem: "Session not shared across apps"

**Solution:**
1. Verify cookie domain is `.darevel.local` (with leading dot)
2. Check all apps use the same `NEXTAUTH_SECRET`
3. Ensure accessing via `*.darevel.local` domains (not localhost:PORT)
4. Clear browser cookies and try again
5. Verify `/etc/hosts` entries are correct

### Problem: "Redirect loop between Suite and Auth"

**Solution:**
1. Check `NEXTAUTH_URL` is correct in both apps
2. Verify Keycloak client redirect URIs include correct URLs
3. Clear browser cookies
4. Check auth service redirect callback logic

### Problem: "CORS error in browser console"

**Solution:**
1. Verify API Gateway CORS configuration includes all domains
2. Check backend CORS_ORIGINS environment variable
3. Ensure Nginx is passing correct headers
4. Restart services after configuration changes

### Problem: "Nginx 502 Bad Gateway"

**Solution:**
1. Check target app is running on correct port
2. Verify Nginx configuration syntax: `docker exec darevel_nginx nginx -t`
3. Check Nginx logs: `docker logs darevel_nginx`
4. Restart Nginx: `docker-compose restart nginx`

### Problem: "JWT token invalid"

**Solution:**
1. Verify Keycloak issuer URL is correct
2. Check API Gateway `issuer-uri` and `jwk-set-uri` configuration
3. Ensure token hasn't expired
4. Check system clock is synchronized

---

## 📈 Performance Checks

### Response Time

```bash
# Test Suite load time
time curl -s http://darevel.local > /dev/null

# Test API Gateway response
time curl -s http://localhost:8081/api/health > /dev/null
```

### Memory Usage

```bash
# Check Docker container memory
docker stats

# Check Node.js app memory
ps aux | grep node
```

### Load Testing (Optional)

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test Suite endpoint
ab -n 1000 -c 10 http://darevel.local/
```

---

## ✅ Success Criteria

Your SSO integration is working correctly if:

- [ ] All 8 apps are accessible via their `*.darevel.local` domains
- [ ] Login once in Suite, automatically logged in to all apps
- [ ] Single session cookie (`darevel-session`) is shared across all apps
- [ ] Logout from one app logs out from all apps
- [ ] Token refresh works without requiring re-login
- [ ] API Gateway successfully validates JWT tokens
- [ ] No CORS errors in browser console
- [ ] No redirect loops or authentication errors
- [ ] Admin and regular user roles work correctly
- [ ] Session persists after browser refresh

---

## 🚀 Next Steps

Once SSO is working:

1. **Implement role-based access control** (RBAC) in each app
2. **Add MFA** (Multi-Factor Authentication) in Keycloak
3. **Configure production secrets** and environment variables
4. **Enable HTTPS** with SSL certificates
5. **Set up monitoring** and alerting for auth failures
6. **Implement session timeout** and idle detection
7. **Add audit logging** for authentication events
8. **Configure backup** for Keycloak database
9. **Load test** the authentication flow
10. **Security audit** of the entire system

---

## 📚 Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Spring Security OAuth2](https://spring.io/projects/spring-security-oauth)
- [KEYCLOAK_SSO_INTEGRATION.md](./KEYCLOAK_SSO_INTEGRATION.md)
- [NEXTAUTH_INTEGRATION_GUIDE.md](./NEXTAUTH_INTEGRATION_GUIDE.md)

---

**Last Updated**: 2025-11-11
**Version**: 1.0.0
**Maintainer**: Darevel Team
