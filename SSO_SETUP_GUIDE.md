# Darevel Suite SSO Setup Guide

Complete step-by-step guide to enable Single Sign-On (SSO) across all Darevel apps using local domains.

## Overview

This setup enables Google Workspace-style SSO where:
- Login once at any Darevel app
- Automatic access to all other apps
- Session shared across all applications via Keycloak

## Architecture

```
User visits any app (*.darevel.local)
  ↓
Check authentication with Keycloak
  ├─ Authenticated? → Access granted
  └─ Not authenticated? → Redirect to Keycloak login
       ↓
    User logs in once
       ↓
    Keycloak creates session
       ↓
    Redirected back to original app
       ↓
    All apps now accessible without re-login!
```

## Apps and Ports

| App | Local Domain | Port | Type |
|-----|-------------|------|------|
| Suite | suite.darevel.local | 3000 | Next.js |
| Slides | slides.darevel.local | 3001 | Next.js |
| Chat | chat.darevel.local | 3002 | Vite |
| Mail | mail.darevel.local | 3003 | Vite |
| Excel | excel.darevel.local | 3004 | Vite |
| Auth | auth.darevel.local | 3005 | Next.js |
| Drive | drive.darevel.local | 3006 | Next.js |
| Notify | notify.darevel.local | 3007 | Next.js |
| Keycloak | localhost | 8080 | Backend |

## Step 1: Configure Local Domains

### Windows

1. **Open PowerShell as Administrator:**
   - Press `Win + X`
   - Click "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Add domain entries:**
   ```powershell
   Add-Content C:\Windows\System32\drivers\etc\hosts @"
127.0.0.1 suite.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 notify.darevel.local
"@
   ```

3. **Verify the changes:**
   ```powershell
   ping suite.darevel.local
   ```
   Should show: `Reply from 127.0.0.1`

4. **Flush DNS cache:**
   ```powershell
   ipconfig /flushdns
   ```

### macOS/Linux

1. **Edit hosts file:**
   ```bash
   sudo nano /etc/hosts
   ```

2. **Add these lines:**
   ```
   127.0.0.1 suite.darevel.local
   127.0.0.1 slides.darevel.local
   127.0.0.1 chat.darevel.local
   127.0.0.1 mail.darevel.local
   127.0.0.1 excel.darevel.local
   127.0.0.1 auth.darevel.local
   127.0.0.1 drive.darevel.local
   127.0.0.1 notify.darevel.local
   ```

3. **Save and exit:**
   - Press `Ctrl + X`
   - Press `Y`
   - Press `Enter`

4. **Verify:**
   ```bash
   ping suite.darevel.local
   ```

5. **Flush DNS cache:**

   **macOS:**
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

   **Linux:**
   ```bash
   sudo systemd-resolve --flush-caches
   ```

## Step 2: Start Darevel Suite

1. **Start all services:**
   ```bash
   npm run dev
   ```

   This will:
   - Start Docker services (PostgreSQL, Keycloak, Redis)
   - Wait for services to be healthy
   - Start all 8 Darevel apps
   - Import Keycloak realm automatically

2. **Wait for services to start:**
   - Docker services: ~30-60 seconds
   - All apps: ~20-30 seconds
   - Total: ~1-2 minutes

3. **Check services are running:**
   ```bash
   # Check Docker
   docker ps

   # Check Keycloak
   curl http://localhost:8080

   # Check apps
   curl http://localhost:3000
   curl http://localhost:3001
   # ... etc
   ```

## Step 3: Update Keycloak Realm (Optional - Already Done)

The Keycloak realm has been pre-configured with local domain redirect URIs. If you need to make changes:

1. **Access Keycloak Admin Console:**
   - URL: http://localhost:8080
   - Username: `admin`
   - Password: `admin`

2. **Select pilot180 realm** (dropdown top-left)

3. **Go to Clients** (left menu)

4. **For each client, verify redirect URIs include both localhost and .darevel.local:**
   - `http://localhost:PORT/*`
   - `http://APP.darevel.local:PORT/*`

## Step 4: Test SSO Flow

### Test 1: Login via Mail App

1. **Open Mail app with local domain:**
   ```
   http://mail.darevel.local:3003
   ```

2. **You should be redirected to Keycloak login**

3. **Login with demo user:**
   - Email: `demo@darevel.com`
   - Password: `demo123`

4. **After login:**
   - You should be redirected back to Mail app
   - You should see the Mail dashboard
   - Check browser console for: "Authenticated as: demo@darevel.com"

### Test 2: Access Chat App (No Re-login)

1. **Open Chat app in same browser:**
   ```
   http://chat.darevel.local:3002
   ```

2. **You should automatically be logged in!**
   - No password prompt
   - Direct access to Chat dashboard
   - This is SSO working!

### Test 3: Access All Apps

Try accessing each app - all should work without re-login:

```
http://suite.darevel.local:3000
http://slides.darevel.local:3001
http://chat.darevel.local:3002
http://mail.darevel.local:3003
http://excel.darevel.local:3004
http://auth.darevel.local:3005
http://drive.darevel.local:3006
http://notify.darevel.local:3007
```

### Test 4: Logout Propagation

1. **In any app, trigger logout** (if available in UI)

2. **Or logout via Keycloak:**
   ```
   http://localhost:8080/realms/pilot180/protocol/openid-connect/logout
   ```

3. **Try to access any app:**
   - Should redirect to login again
   - Logout from one = logout from all

## Test Users

### Demo User
- **Email:** `demo@darevel.com`
- **Password:** `demo123`
- **Roles:** `user`
- **Use for:** Testing regular user features

### Admin User
- **Email:** `admin@darevel.com`
- **Password:** `admin123`
- **Roles:** `user`, `admin`
- **Use for:** Testing admin features

## Troubleshooting

### Issue 1: Domain not resolving

**Symptoms:**
- "This site can't be reached"
- "ERR_NAME_NOT_RESOLVED"

**Solution:**
1. Check hosts file was updated correctly:
   ```bash
   # Windows
   type C:\Windows\System32\drivers\etc\hosts | findstr darevel

   # macOS/Linux
   cat /etc/hosts | grep darevel
   ```

2. Flush DNS cache (see Step 1)

3. Try with `localhost:PORT` instead

### Issue 2: Redirect URI Mismatch

**Symptoms:**
- Error: "Invalid redirect URI"
- Stuck on Keycloak login page

**Solution:**
1. Check Keycloak client configuration:
   - Login to http://localhost:8080
   - Select `pilot180` realm
   - Go to Clients
   - Find the app client (e.g., `ai-email-assistant` for Mail)
   - Check "Valid Redirect URIs" includes your domain

2. If missing, add:
   ```
   http://APP.darevel.local:PORT/*
   ```

3. Save and try again

### Issue 3: CORS Errors

**Symptoms:**
- Console error: "CORS policy: No 'Access-Control-Allow-Origin'"
- Network requests failing

**Solution:**
1. Check Keycloak client "Web Origins" includes:
   ```
   http://APP.darevel.local:PORT
   +
   ```

2. The `+` means "all redirect URIs are allowed origins"

### Issue 4: Apps not starting

**Symptoms:**
- Port already in use
- Apps crash on startup

**Solution:**
1. Kill processes on ports 3000-3007:
   ```bash
   # Windows
   .\kill-ports.ps1

   # Linux/macOS
   ./kill-ports.sh
   ```

2. Or manually:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill //PID <PID> //F

   # Linux/macOS
   lsof -ti:3000 | xargs kill -9
   ```

3. Restart: `npm run dev`

### Issue 5: Keycloak not importing realm

**Symptoms:**
- Clients missing in Keycloak
- Users not found

**Solution:**
1. Check Keycloak logs:
   ```bash
   npm run logs:keycloak
   ```

2. Look for:
   ```
   Import: realm 'pilot180' from file /opt/keycloak/data/import/realm-export.json
   ```

3. If missing, clean and restart:
   ```bash
   npm run clean
   npm run dev
   ```

### Issue 6: Token expired

**Symptoms:**
- "Token expired" error
- Logged out automatically

**Solution:**
- This is normal - tokens expire after a period
- Simply refresh the page to get a new token
- Auto-refresh is configured for 60-second intervals

## Advanced Configuration

### Add New User

1. **Via Keycloak Admin Console:**
   - Login to http://localhost:8080
   - Select `pilot180` realm
   - Click "Users" → "Add user"
   - Fill in details
   - Click "Create"
   - Go to "Credentials" tab
   - Set password
   - Uncheck "Temporary"
   - Save

2. **Via realm-export.json:**
   - Edit `keycloak/realm-export.json`
   - Add to `users` array:
     ```json
     {
       "username": "newuser@darevel.com",
       "enabled": true,
       "emailVerified": true,
       "firstName": "New",
       "lastName": "User",
       "email": "newuser@darevel.com",
       "realmRoles": ["user"],
       "credentials": [
         {
           "type": "password",
           "value": "password123",
           "temporary": false
         }
       ]
     }
     ```
   - Restart: `npm run clean && npm run dev`

### Add New Role

1. **In Keycloak Admin Console:**
   - Select `pilot180` realm
   - Click "Realm roles"
   - Click "Create role"
   - Name: `premium`, `moderator`, etc.
   - Save

2. **Assign to user:**
   - Go to "Users"
   - Select user
   - Go to "Role mapping" tab
   - Click "Assign role"
   - Select role
   - Click "Assign"

## Production Considerations

### Security

**⚠️ Current setup is for DEVELOPMENT ONLY!**

For production:

1. **Change admin credentials:**
   ```env
   KEYCLOAK_ADMIN=secure_admin_name
   KEYCLOAK_ADMIN_PASSWORD=VeryStrongPassword123!
   ```

2. **Use HTTPS:**
   - Configure SSL certificates
   - Update all URLs to `https://`
   - Set `secure: true` for cookies

3. **Use real domains:**
   - Register actual domains (e.g., `mail.darevel.com`)
   - Configure DNS
   - Update Keycloak redirect URIs

4. **Strong secrets:**
   ```env
   NEXTAUTH_SECRET=<Generate with: openssl rand -base64 32>
   ```

5. **Remove test users:**
   - Delete `demo@darevel.com` and `admin@darevel.com`
   - Require email verification
   - Enable brute force protection

### Performance

1. **Enable caching:**
   - Redis for session storage
   - Configure NextAuth Redis adapter

2. **Use production Keycloak:**
   ```yaml
   command:
     - start
     - --optimized
   ```

3. **Configure connection pooling:**
   - PostgreSQL connection limits
   - Redis connection pooling

## Next Steps

1. **Customize login page:**
   - Create custom Keycloak theme
   - Add company branding
   - Customize error messages

2. **Implement role-based access control:**
   - Check user roles in apps
   - Restrict features based on roles
   - Create admin-only pages

3. **Add social login:**
   - Google
   - GitHub
   - Microsoft

4. **Session management:**
   - View active sessions
   - Revoke sessions remotely
   - Session timeout configuration

5. **Monitoring:**
   - Track login attempts
   - Monitor failed logins
   - Alert on suspicious activity

## Useful Commands

```bash
# Start everything
npm run dev

# Stop Docker services
npm run stop

# Clean all data (destructive!)
npm run clean

# View all logs
npm run logs

# View specific service logs
npm run logs:keycloak
npm run logs:postgres
npm run logs:redis

# Build all apps
npm run build

# Kill ports
./kill-ports.sh   # Linux/macOS
./kill-ports.ps1  # Windows
```

## Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Keycloak JS Adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
- [SSO Implementation Guide](./SSO_IMPLEMENTATION.md)
- [Keycloak Setup Guide](./KEYCLOAK_SETUP.md)

---

**Summary:**

You now have a fully functional SSO setup for Darevel Suite! Users can:
- Login once at any app
- Access all apps without re-authentication
- Logout once to logout everywhere

This provides a seamless, Google Workspace-style experience across your entire application suite.
