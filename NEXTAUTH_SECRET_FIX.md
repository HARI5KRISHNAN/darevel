# Fix for NextAuth Secret Error

## Problem
The error "Invalid Content Encryption Key length. Expected 512 bits, got 256 bits" occurs because the `NEXTAUTH_SECRET` is too short. NextAuth requires at least 64 characters (512 bits) for proper encryption.

## Solution

### Step 1: Generate a Strong Secret

Run this command to generate a proper 64-character secret:

```bash
openssl rand -base64 48
```

Example output: `wNeHmZtLNiKOgDFOi5pEPc74I/FzdRRKkZDXYckZHxUGOHVMMgettSGWErcjIDht`

### Step 2: Update Auth App Environment

Edit `~/Downloads/darevel-suite/apps/auth/.env.local`:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3005
NEXTAUTH_SECRET=wNeHmZtLNiKOgDFOi5pEPc74I/FzdRRKkZDXYckZHxUGOHVMMgettSGWErcjIDht

# Keycloak Configuration
KEYCLOAK_CLIENT_ID=darevel-auth
KEYCLOAK_CLIENT_SECRET=darevel-auth-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180

# Node Environment
NODE_ENV=development
```

### Step 3: Update Slides App Environment

Edit `~/Downloads/darevel-suite/apps/slides/.env.local`:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=wNeHmZtLNiKOgDFOi5pEPc74I/FzdRRKkZDXYckZHxUGOHVMMgettSGWErcjIDht

# Keycloak Configuration
KEYCLOAK_CLIENT_ID=darevel-slides
KEYCLOAK_CLIENT_SECRET=darevel-slides-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180

# Node Environment
NODE_ENV=development
```

**IMPORTANT:** Use the **same secret** for both auth and slides apps!

### Step 4: Clear Browser Cookies

The corrupted session cookies need to be cleared:

1. **Option A - Clear all localhost cookies (easiest):**
   - Open DevTools (F12)
   - Go to Application tab → Cookies
   - Right-click on `http://localhost:3005` → Clear
   - Right-click on `http://localhost:3001` → Clear
   - Right-click on `http://localhost:3000` → Clear

2. **Option B - Use Incognito/Private browsing**
   - Open a new Incognito window
   - Test auth there (no need to clear cookies)

### Step 5: Restart Dev Servers

```bash
# Stop current servers (Ctrl+C)
# Then restart
npm run dev
```

Wait for all apps to be ready.

### Step 6: Test Authentication

1. **Clear browser cache** or use Incognito mode
2. Visit **http://localhost:3005/signin**
3. Click "Sign in with Keycloak"
4. Login with:
   - Email: `demo@darevel.com`
   - Password: `demo123`
5. You should see the welcome page!

### Step 7: Test Slides App

1. Visit **http://localhost:3001**
2. Should redirect to Keycloak login
3. Login (or already logged in from SSO)
4. Should see the Slides app!

## Why This Fixes It

- **512-bit secret**: Provides proper encryption strength for JWT tokens
- **Same secret**: Allows SSO to work across apps
- **Clear cookies**: Removes corrupted session data from the old short secret

## If Still Having Issues

1. **Verify secret length**: Must be 64+ characters
   ```bash
   # Count characters in your secret
   echo -n "YOUR_SECRET_HERE" | wc -c
   # Should output 64 or higher
   ```

2. **Check all apps use same secret**: Auth, Slides, and any other Next.js apps

3. **Ensure Keycloak is running**:
   ```bash
   curl http://localhost:8080
   # Should return HTML response
   ```

4. **Check logs** for any remaining errors

## Security Note

⚠️ **For Production**: Generate a NEW secret before deploying to production. Never commit secrets to git!

```bash
openssl rand -base64 48
```

Use this new secret in production environment variables.
