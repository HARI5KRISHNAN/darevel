# DNS Setup for Darevel Suite - Quick Start Guide

**The final step to enable your Google Workspace-style SSO experience.**

## What's the Issue?

Your Darevel Suite is fully configured and ready to run, but browsers can't resolve custom `.local` domains like `suite.darevel.local` because they're not in public DNS.

## The Solution

Map these domains to `127.0.0.1` (localhost) in your system's hosts file.

## Choose Your Setup Method

### Method 1: Automated Script (Fastest) ⚡

**Recommended for most users**

#### Windows

1. **Right-click PowerShell** → Select **"Run as Administrator"**
2. Run:
   ```powershell
   cd C:\Users\acer\Downloads\darevel-suite
   .\setup-hosts.ps1
   ```
3. Press **Enter** when prompted
4. Done! DNS configured automatically.

#### macOS / Linux

1. Open Terminal
2. Run:
   ```bash
   cd /path/to/darevel-suite
   chmod +x setup-hosts.sh
   sudo ./setup-hosts.sh
   ```
3. Enter your password
4. Press **Enter** when prompted
5. Done!

### Method 2: Manual Configuration 📝

**If you prefer manual control or scripts don't work**

Full step-by-step instructions: [HOSTS_SETUP_MANUAL.md](HOSTS_SETUP_MANUAL.md)

Quick version:

**Windows:**
1. Open Notepad as Administrator
2. Open: `C:\Windows\System32\drivers\etc\hosts`
3. Add these lines at the end:

```
# Darevel Suite - Local Development
127.0.0.1 suite.darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 notify.darevel.local
```

4. Save and run: `ipconfig /flushdns`

**macOS/Linux:**
```bash
sudo nano /etc/hosts
# Add the same lines above
# Save and flush DNS
sudo dscacheutil -flushcache  # macOS
sudo systemd-resolve --flush-caches  # Linux
```

## Verify It's Working

### Step 1: Test DNS Resolution

**Windows:**
```cmd
ping suite.darevel.local
ping auth.darevel.local
```

**macOS/Linux:**
```bash
ping -c 1 suite.darevel.local
ping -c 1 auth.darevel.local
```

You should see responses from `127.0.0.1` ✅

### Step 2: Start Development Server

```bash
cd C:\Users\acer\Downloads\darevel-suite
npm run dev
```

Wait for all apps to start:
```
✓ Ready on http://localhost:3000 (Suite)
✓ Ready on http://localhost:3001 (Slides)
✓ Ready on http://localhost:3002 (Chat)
✓ Ready on http://localhost:3003 (Mail)
✓ Ready on http://localhost:3004 (Excel)
✓ Ready on http://localhost:3005 (Auth)
✓ Ready on http://localhost:3006 (Drive)
✓ Ready on http://localhost:3007 (Notify)
```

### Step 3: Test in Browser

1. Visit: **http://suite.darevel.local:3000**
2. You'll be redirected to: **http://auth.darevel.local:3005/signin**
3. See your custom Darevel branded login page with animations 🎨
4. Click **"Sign in with Keycloak"**
5. Login with:
   - Email: `demo@darevel.com`
   - Password: `demo123`
6. You'll be redirected back to Suite dashboard ✅

### Step 4: Test SSO Across Apps

Without logging in again, visit:

- **Slides:** http://slides.darevel.local:3001 ✅ Instant access
- **Drive:** http://drive.darevel.local:3006 ✅ Instant access
- **Mail:** http://mail.darevel.local:3003 ✅ Instant access
- **Excel:** http://excel.darevel.local:3004 ✅ Instant access

**That's SSO working!** Single login = access to all apps 🎉

## What Got Fixed in This Update

### 1. NextAuth v5 Migration ✅
- Removed deprecated `withAuth` middleware
- Created centralized [apps/auth/lib/auth.ts](apps/auth/lib/auth.ts)
- Cookie-based authentication check
- Works with Next.js 15/16 + Turbopack

### 2. Custom Branded Login ✅
- Professional animated login page
- Framer Motion smooth transitions
- Your custom logo integrated
- Darevel gradient theme

### 3. Centralized SSO Architecture ✅
- Single auth gateway at `auth.darevel.local:3005`
- Redis session caching
- Cross-app session sharing
- Keycloak OAuth2 integration

### 4. DNS Configuration Tools ✅
- Automated PowerShell script (Windows)
- Automated Bash script (Linux/macOS)
- Complete manual guide (all platforms)

## Troubleshooting

### "This site can't be reached" Error

**Problem:** Browser can't find suite.darevel.local

**Solutions:**
1. Verify hosts file has Darevel entries
2. Flush DNS cache again
3. Restart browser
4. Check dev server is running: `npm run dev`

See full troubleshooting guide: [HOSTS_SETUP_MANUAL.md](HOSTS_SETUP_MANUAL.md#troubleshooting)

### Login Fails or Redirects Wrong

**Problem:** Login page loads but doesn't work

**Solutions:**
1. Check Keycloak is running: `docker ps | grep keycloak`
2. Check Redis is running: `docker ps | grep redis`
3. Verify `.env.local` files have correct URLs

### Still Getting withAuth Error

**Problem:** `Export 'withAuth' was not found`

**Solutions:**
```bash
# Delete .next folders
rm -rf apps/*/.next

# Restart dev server
npm run dev
```

## All Your Darevel Apps

| App | URL | Port |
|-----|-----|------|
| Suite (Dashboard) | http://suite.darevel.local:3000 | 3000 |
| Slides (Presentations) | http://slides.darevel.local:3001 | 3001 |
| Chat (AI Assistant) | http://chat.darevel.local:3002 | 3002 |
| Mail (Email) | http://mail.darevel.local:3003 | 3003 |
| Excel (Spreadsheets) | http://excel.darevel.local:3004 | 3004 |
| Auth (Central Login) | http://auth.darevel.local:3005 | 3005 |
| Drive (File Storage) | http://drive.darevel.local:3006 | 3006 |
| Notify (Notifications) | http://notify.darevel.local:3007 | 3007 |

## Documentation Files

- **[DNS_SETUP_README.md](DNS_SETUP_README.md)** - This file (Quick start)
- **[HOSTS_SETUP_MANUAL.md](HOSTS_SETUP_MANUAL.md)** - Detailed manual instructions
- **[CENTRALIZED_SSO_GUIDE.md](CENTRALIZED_SSO_GUIDE.md)** - SSO architecture guide
- **[NEXTAUTH_V5_MIGRATION_GUIDE.md](NEXTAUTH_V5_MIGRATION_GUIDE.md)** - NextAuth v5 migration details
- **[CUSTOM_BRANDED_LOGIN_GUIDE.md](CUSTOM_BRANDED_LOGIN_GUIDE.md)** - Custom login page guide

## Support & Resources

### Running the Suite
```bash
# Start all apps
npm run dev

# Build all apps
npm run build

# Clean and restart
rm -rf apps/*/.next
npm run dev
```

### Keycloak Admin
- URL: http://localhost:8080
- Username: `admin`
- Password: `admin`

### Redis Admin (if needed)
```bash
# Connect to Redis
docker exec -it darevel-redis redis-cli

# View all keys
KEYS *

# Get session data
GET session:demo@darevel.com
```

### Demo User
- Email: `demo@darevel.com`
- Password: `demo123`

## Architecture Overview

```
User Browser
    ↓
suite.darevel.local:3000 (checks cookie)
    ↓ (no session)
auth.darevel.local:3005/signin (custom branded login)
    ↓
Keycloak (localhost:8080)
    ↓ (successful login)
auth.darevel.local:3005/api/auth/callback
    ↓ (sets session cookie)
Redis (localhost:6379) - stores session
    ↓ (cookie shared)
suite.darevel.local:3000 ✅ Access granted
slides.darevel.local:3001 ✅ Access granted (same cookie)
drive.darevel.local:3006 ✅ Access granted (same cookie)
... all other apps ✅
```

## What Makes This Google Workspace-Style?

1. **Centralized Authentication**
   - Single login page (`auth.darevel.local`)
   - All apps trust this gateway

2. **Seamless SSO**
   - Login once → access all apps
   - No repeated authentication
   - Session shared via Redis

3. **Subdomain Architecture**
   - Each app has its own subdomain
   - Professional URL structure
   - Mimics Google (mail.google.com, drive.google.com, etc.)

4. **Enterprise Branding**
   - Custom animated login page
   - Consistent Darevel theme
   - Professional user experience

## Next Steps

After DNS setup is complete:

1. **Customize Your Suite**
   - Update logo: [apps/auth/public/logo.jpg](apps/auth/public/logo.jpg)
   - Modify colors: [apps/auth/app/signin/page.tsx](apps/auth/app/signin/page.tsx)
   - Adjust animations

2. **Add More Users**
   - Login to Keycloak admin
   - Create users in `pilot180` realm
   - Assign roles and permissions

3. **Develop Features**
   - All apps hot reload automatically
   - Make changes, see results instantly
   - Turborepo handles parallel builds

4. **Production Deployment**
   - Use real domains (suite.darevel.com)
   - Configure SSL certificates
   - Update all environment variables

---

**Status:** ✅ **Ready to Run**

**Last Updated:** 2025-11-10

**Run the DNS setup script now and enjoy your enterprise-grade SSO experience!** 🚀
