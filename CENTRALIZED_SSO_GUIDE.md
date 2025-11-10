# Centralized SSO Setup Guide - Google Workspace Style

Complete guide for setting up a centralized authentication gateway for Darevel Suite, providing a Google Workspace-style single sign-on experience.

## Overview

This setup implements a **centralized authentication service** where:
- All apps redirect to a single Auth app (`auth.darevel.local:3005`) for login
- Auth app handles all Keycloak communication
- Session tokens are shared via Redis across all apps
- Login once, access all apps seamlessly

## Architecture

```
User visits suite.darevel.local:3000
  ↓
No session found
  ↓
Redirect to auth.darevel.local:3005 (Central Auth Gateway)
  ↓
Auth app checks Keycloak
  ↓
User logs in with demo@darevel.com
  ↓
Auth app stores session in Redis
  ↓
Redirect back to suite.darevel.local:3000
  ↓
User accesses Mail, Chat, Excel, Slides, Drive, Notify
  ↓
All apps read shared session from Redis
  ↓
✅ No re-login required!
```

## Step 1: Configure Local Subdomains

### Windows

**1. Open PowerShell as Administrator**

```powershell
# Method 1: Direct edit
notepad C:\Windows\System32\drivers\etc\hosts
```

**2. Add these lines at the bottom:**

```
127.0.0.1 suite.darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 notify.darevel.local
```

**3. Save and flush DNS:**

```powershell
ipconfig /flushdns
```

**4. Verify:**

```powershell
ping suite.darevel.local
# Should reply from 127.0.0.1
```

### macOS/Linux

**1. Edit hosts file:**

```bash
sudo nano /etc/hosts
```

**2. Add these lines:**

```
127.0.0.1 suite.darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 notify.darevel.local
```

**3. Save (Ctrl+X, Y, Enter) and flush DNS:**

**macOS:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Linux:**
```bash
sudo systemd-resolve --flush-caches
```

**4. Verify:**

```bash
ping suite.darevel.local
```

## Step 2: Understand the Updated Configuration

### What's Been Configured

#### 1. **Auth App (Centralized Gateway)**

**File:** `apps/auth/next.config.ts`
- Configured as standalone app
- Points to `auth.darevel.local:3005`

**File:** `apps/auth/app/api/auth/[...nextauth]/route.ts`
- NextAuth with Keycloak provider
- Redis integration for session caching
- JWT strategy with 30-day expiry
- Stores session in Redis for cross-app access

**File:** `apps/auth/types/next-auth.d.ts`
- TypeScript definitions for extended session types

#### 2. **All Next.js Apps (Suite, Slides, Drive, Notify)**

**Files:** `apps/*/middleware.ts`
- Intercepts all routes
- Checks for authentication
- Redirects to `auth.darevel.local:3005` if not logged in

**Files:** `apps/*/.env.local`
- Each app configured with its subdomain
- All share same NEXTAUTH_SECRET for session sharing
- All point to same Redis instance

#### 3. **Vite Apps (Mail, Chat, Excel)**

**Configuration:**
- Still use direct Keycloak JS authentication
- Can be optionally migrated to centralized auth later
- Currently work independently with Keycloak SSO

#### 4. **Keycloak Realm**

**File:** `keycloak/realm-export.json`
- All clients updated with wildcard redirect URIs: `http://*.darevel.local:PORT/*`
- Web origins configured for CORS
- All 8 apps pre-configured

## Step 3: Start the Services

**1. Clean restart to import updated Keycloak realm:**

```bash
npm run clean
npm run dev
```

**2. Wait for services:**
- Docker services (Postgres, Keycloak, Redis): ~60 seconds
- All apps: ~30 seconds
- Total: ~1-2 minutes

**3. Check services are running:**

```bash
# Check Docker containers
docker ps

# Should see:
# - darevel_postgres
# - darevel_keycloak
# - darevel_redis
```

## Step 4: Test the Centralized SSO Flow

### Test 1: Login via Suite App

**1. Open Suite app:**
```
http://suite.darevel.local:3000
```

**2. You should be redirected to:**
```
http://auth.darevel.local:3005/api/auth/signin
```

**3. Click "Sign in with Keycloak"**

**4. Login at Keycloak:**
- Email: `demo@darevel.com`
- Password: `demo123`

**5. After successful login:**
- Redirected back to `http://suite.darevel.local:3000`
- You should see the Suite dashboard
- Session stored in Redis

### Test 2: Access Other Next.js Apps (No Re-login!)

**1. Open Slides app:**
```
http://slides.darevel.local:3001
```

**✅ You should be automatically logged in!**
- No redirect to auth
- No password prompt
- Direct access to Slides

**2. Try other Next.js apps:**
```
http://drive.darevel.local:3006
http://notify.darevel.local:3007
```

**All should work without re-login!** This is centralized SSO in action.

### Test 3: Access Vite Apps (Standard Keycloak SSO)

**1. Open Mail app:**
```
http://mail.darevel.local:3003
```

**2. Keycloak recognizes your session:**
- Instant login (no password)
- Uses existing Keycloak session
- No interaction with Auth app

**3. Try other Vite apps:**
```
http://chat.darevel.local:3002
http://excel.darevel.local:3004
```

**All work with Keycloak SSO.**

### Test 4: Logout Flow

**Option 1: Logout from Next.js app**

In any Next.js app (Suite, Slides, Drive, Notify), call:
```javascript
import { signOut } from 'next-auth/react';
signOut({ callbackUrl: '/' });
```

**Option 2: Logout from Keycloak directly**

Visit:
```
http://localhost:8080/realms/pilot180/protocol/openid-connect/logout
```

**Result:**
- Session cleared from Redis
- Keycloak session destroyed
- All apps require re-login

## Step 5: How to Use in Your App Code

### Next.js Apps (Suite, Slides, Drive, Notify)

#### Get User Session

**In Server Components:**
```typescript
import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession();

  if (session?.user) {
    return <div>Welcome {session.user.name}!</div>;
  }

  return <div>Not logged in</div>;
}
```

**In Client Components:**
```typescript
'use client';

import { useSession, signOut } from 'next-auth/react';

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div>
        <p>Logged in as {session.user.email}</p>
        <button onClick={() => signOut()}>Logout</button>
      </div>
    );
  }

  return <div>Not logged in</div>;
}
```

#### Protected API Routes

```typescript
// app/api/protected/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Protected data',
    user: session.user
  });
}
```

#### Using Access Token

```typescript
const session = await getServerSession();
const accessToken = session?.accessToken;

// Use token for backend API calls
const response = await fetch('http://your-api.com/endpoint', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Vite Apps (Mail, Chat, Excel)

**Already configured with Keycloak JS:**

```typescript
import keycloak from './src/keycloak';

// Check if authenticated
if (keycloak.authenticated) {
  console.log('Logged in as:', keycloak.tokenParsed?.email);
}

// Get user info
const user = {
  email: keycloak.tokenParsed?.email,
  name: keycloak.tokenParsed?.name,
  roles: keycloak.tokenParsed?.realm_access?.roles
};

// Logout
keycloak.logout({
  redirectUri: window.location.origin
});

// Get access token
const token = keycloak.token;
```

## System Architecture Details

### Session Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
│  (Cookies store NextAuth session token)                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ├──── Visit Suite ────────────┐
                   │                              │
                   ├──── Visit Slides ────────────┤
                   │                              │
                   ├──── Visit Drive ─────────────┤
                   │                              ▼
                   │                    ┌──────────────────┐
                   │                    │  Next.js Apps    │
                   │                    │  (Middleware)    │
                   │                    └────────┬─────────┘
                   │                             │
                   │                             │ Check session
                   │                             ▼
┌──────────────────▼──────────────┐    ┌────────────────────┐
│  Auth App (Gateway)              │◄───┤  Redis (Session)   │
│  auth.darevel.local:3005         │    │  localhost:6379    │
│  - NextAuth.js                   │    └────────────────────┘
│  - Keycloak provider             │              ▲
└──────────────────┬──────────────┘              │
                   │                              │
                   │ OAuth2 flow                  │ Store session
                   ▼                              │
         ┌──────────────────┐                    │
         │    Keycloak       │────────────────────┘
         │  localhost:8080   │
         │  pilot180 realm   │
         └──────────────────┘
```

### Key Components

**1. NextAuth.js (Auth App)**
- Handles OAuth2 flow with Keycloak
- Generates JWT tokens
- Manages session lifecycle

**2. Redis (Session Store)**
- Stores session data: `session:user@email.com`
- 30-day expiry
- Shared across all Next.js apps

**3. Keycloak (Identity Provider)**
- Central user database
- OAuth2/OIDC endpoints
- Token generation and validation

**4. Middleware (All Next.js Apps)**
- Intercepts requests
- Validates session token
- Redirects to Auth app if no session

## Troubleshooting

### Issue 1: Redirect Loop

**Symptoms:**
- Infinite redirects between app and auth service
- Browser shows "Too many redirects"

**Cause:**
- NEXTAUTH_SECRET mismatch between apps
- Session not being saved

**Solution:**
1. Ensure all apps have identical NEXTAUTH_SECRET:
   ```bash
   # Check all .env.local files
   grep NEXTAUTH_SECRET apps/*/.env.local
   ```

2. All should show:
   ```
   NEXTAUTH_SECRET=darevel-sso-secret-change-in-production
   ```

3. Restart apps:
   ```bash
   npm run stop
   npm run dev
   ```

### Issue 2: Redis Connection Failed

**Symptoms:**
- Error: "Error connecting to Redis"
- Auth fails with 500 error

**Cause:**
- Redis not running
- Wrong Redis URL

**Solution:**
1. Check Redis is running:
   ```bash
   docker ps | grep redis
   ```

2. Test Redis connection:
   ```bash
   docker exec -it darevel_redis redis-cli ping
   # Should return: PONG
   ```

3. Check REDIS_URL in `.env.local`:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

### Issue 3: Session Not Shared Across Apps

**Symptoms:**
- Login works in one app
- Other apps still ask for login

**Cause:**
- Cookie domain mismatch
- Different NEXTAUTH_SECRET

**Solution:**
1. Ensure using `.darevel.local` domains (not `localhost`)
2. Clear browser cookies
3. Verify all apps use same secret
4. Check Redis has session data:
   ```bash
   docker exec -it darevel_redis redis-cli
   > KEYS session:*
   > GET session:demo@darevel.com
   ```

### Issue 4: TypeScript Errors in Auth App

**Symptoms:**
- Property 'accessToken' does not exist on type 'Session'

**Cause:**
- Missing type definitions

**Solution:**
- Type definitions already created in `apps/auth/types/next-auth.d.ts`
- Restart TypeScript server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Issue 5: Middleware Not Redirecting

**Symptoms:**
- App accessible without login
- No redirect to auth service

**Cause:**
- Middleware not configured
- Wrong matcher pattern

**Solution:**
1. Check `middleware.ts` exists in app root
2. Verify content:
   ```typescript
   import { withAuth } from "next-auth/middleware";

   export default withAuth({
     pages: {
       signIn: "http://auth.darevel.local:3005/api/auth/signin",
     },
   });

   export const config = {
     matcher: ["/((?!_next|api|favicon.ico|public).*)"],
   };
   ```

3. Restart app

## Advanced Configuration

### Custom Login Page

Create `apps/auth/app/signin/page.tsx`:

```typescript
'use client';

import { signIn } from 'next-auth/react';

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to Darevel Suite</h1>
        <p className="mb-6">Sign in to access all apps</p>
        <button
          onClick={() => signIn('keycloak')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Sign in with Keycloak
        </button>
      </div>
    </div>
  );
}
```

Update `apps/auth/app/api/auth/[...nextauth]/route.ts`:

```typescript
pages: {
  signIn: '/signin',  // Changed from default
  error: '/error',
},
```

### Session Expiry Configuration

Edit `apps/auth/app/api/auth/[...nextauth]/route.ts`:

```typescript
session: {
  strategy: "jwt",
  maxAge: 7 * 24 * 60 * 60, // 7 days instead of 30
},
```

### Role-Based Access Control

In middleware:

```typescript
// apps/suite/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "http://auth.darevel.local:3005/api/auth/signin",
  },
  callbacks: {
    authorized: ({ token }) => {
      // Only allow admins
      return token?.roles?.includes('admin');
    },
  },
});
```

### Custom Logout Page

Create `apps/auth/app/signout/page.tsx`:

```typescript
'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function SignOut() {
  useEffect(() => {
    signOut({ callbackUrl: '/' });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Signing out...</p>
    </div>
  );
}
```

## Production Checklist

- [ ] Change `NEXTAUTH_SECRET` to strong random value (use `openssl rand -base64 32`)
- [ ] Use HTTPS for all apps
- [ ] Register real domains (e.g., `suite.darevel.com`)
- [ ] Configure production Redis (Redis Cloud, AWS ElastiCache, etc.)
- [ ] Enable Redis password authentication
- [ ] Set up Redis clustering for high availability
- [ ] Configure Keycloak for production mode
- [ ] Use external PostgreSQL for Keycloak
- [ ] Enable Keycloak HTTPS
- [ ] Configure email SMTP for password reset
- [ ] Set up monitoring (Redis, Keycloak, Apps)
- [ ] Configure backup for Redis and PostgreSQL
- [ ] Enable rate limiting
- [ ] Set up logging and alerting
- [ ] Remove test users (demo@darevel.com)
- [ ] Configure session timeout appropriately
- [ ] Enable CSRF protection
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Set up CDN for static assets

## Useful Commands

```bash
# Start all services
npm run dev

# Stop Docker services
npm run stop

# Clean and restart (imports updated Keycloak realm)
npm run clean && npm run dev

# View logs
npm run logs
npm run logs:keycloak
npm run logs:redis

# Build all apps
npm run build

# Access Redis CLI
docker exec -it darevel_redis redis-cli

# Check Redis keys
docker exec -it darevel_redis redis-cli KEYS '*'

# Check session data
docker exec -it darevel_redis redis-cli GET 'session:demo@darevel.com'

# Flush Redis (clear all sessions)
docker exec -it darevel_redis redis-cli FLUSHALL
```

## Comparison: Centralized vs Distributed SSO

### Centralized (What We Built)

**Pros:**
- Single login page across all apps
- Centralized session management
- Easier to add custom login UI
- Full control over auth flow
- Session data cached in Redis

**Cons:**
- Extra redirect to auth service
- More complex setup
- Single point of failure (Auth app)

### Distributed (Previous Implementation)

**Pros:**
- Direct Keycloak authentication
- No extra redirect
- Simpler architecture
- Each app independent

**Cons:**
- Each app has own login page
- Harder to customize login UI
- Less centralized control

**Both approaches provide SSO** - choose based on your needs!

## Next Steps

1. **Test the flow** with local domains
2. **Customize login page** in Auth app
3. **Add user profile UI** to all apps
4. **Implement role-based access control**
5. **Add social login** (Google, GitHub, Microsoft)
6. **Set up monitoring** and logging
7. **Prepare for production** deployment

---

**Status:** ✅ **Complete and Ready for Testing**

**Last Updated:** 2025-11-10

**Implementation:** Centralized Authentication Gateway with Redis Session Sharing
