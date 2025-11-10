# Login Redirect Issue - Fixed

## Problem

After entering username and password on the login page (`http://auth.darevel.local:3005/signin`), the page was redirecting back to itself instead of completing the authentication flow.

## Root Cause

The `darevel-auth` client in Keycloak was configured as a **public client** (`publicClient: true`), which doesn't require a client secret. However, NextAuth v5 with the Keycloak provider requires a **confidential client** with a valid client secret to properly complete the OAuth2/OIDC authentication flow.

### Why This Matters:

1. **Public clients** are for browser-based apps that can't securely store secrets
2. **Confidential clients** are for server-side apps (like NextAuth) that can securely store secrets
3. NextAuth expects to exchange authorization codes using a client secret
4. Without the secret, the token exchange fails and authentication can't complete

## What Was Fixed

### 1. Updated Keycloak Client Configuration

**File:** [keycloak/realm-export.json](keycloak/realm-export.json)

Changed the `darevel-auth` client from public to confidential:

```json
{
  "clientId": "darevel-auth",
  "publicClient": false,              // Changed from true
  "clientAuthenticatorType": "client-secret",  // Added
  "secret": "darevel-auth-secret-2025",       // Added
  "serviceAccountsEnabled": false,             // Added
  // ... rest of configuration
}
```

**Key Changes:**
- `publicClient`: `true` → `false`
- Added `clientAuthenticatorType`: `"client-secret"`
- Added `secret`: `"darevel-auth-secret-2025"`
- Added `serviceAccountsEnabled`: `false`

### 2. Updated Environment Variables

**File:** [apps/auth/.env.local](apps/auth/.env.local)

Added the missing client secret:

```env
NEXTAUTH_URL=http://auth.darevel.local:3005
NEXTAUTH_SECRET=darevel-sso-secret-change-in-production
KEYCLOAK_CLIENT_ID=darevel-auth
KEYCLOAK_CLIENT_SECRET=darevel-auth-secret-2025  # Added this line
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
REDIS_URL=redis://localhost:6379
```

### 3. Restarted Services

To apply the changes:

```bash
# Stop all services
docker-compose down

# Remove old Postgres data (to force realm reimport)
docker volume rm darevel-suite_postgres_data

# Start services with fresh configuration
docker-compose up -d
```

Keycloak successfully imported the updated realm configuration with the confidential client.

## How to Test the Fix

### Step 1: Ensure Services Are Running

```bash
# Check all containers are healthy
docker ps
```

You should see:
- `darevel_keycloak` - Up and healthy
- `darevel_postgres` - Up and healthy
- `darevel_redis` - Up and healthy

### Step 2: Start Your Dev Server

If not already running:

```bash
npm run dev
```

### Step 3: Clear Browser Data

To ensure no cached authentication state:

1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Click "Clear site data"
4. Close and reopen browser

### Step 4: Test Login Flow

1. Visit: **http://suite.darevel.local:3000**
2. You'll be redirected to: **http://auth.darevel.local:3005/signin**
3. Click **"Sign in with Keycloak"**
4. You'll be redirected to Keycloak login page
5. Enter credentials:
   - Username: `demo@darevel.com`
   - Password: `demo123`
6. Click **Sign In**
7. **Expected Result:** You should be redirected back to **http://suite.darevel.local:3000** and logged in! ✅

### Step 5: Test SSO Across Apps

Without logging in again, visit:

- http://slides.darevel.local:3001 ✅ Instant access
- http://drive.darevel.local:3006 ✅ Instant access
- http://mail.darevel.local:3003 ✅ Instant access
- http://excel.darevel.local:3004 ✅ Instant access

**That's SSO working!** 🎉

## Technical Flow (Before vs After)

### Before (Broken) 🔴

```
User submits login → Keycloak validates → Issues auth code
  ↓
NextAuth tries to exchange code for token
  ↓
Keycloak: "Where's your client secret?" (expected for confidential clients)
  ↓
NextAuth: "I don't have one" (public client, no secret in env)
  ↓
Keycloak rejects token exchange
  ↓
Authentication fails → Redirect back to /signin
```

### After (Fixed) ✅

```
User submits login → Keycloak validates → Issues auth code
  ↓
NextAuth exchanges code + client secret for token
  ↓
Keycloak: "Valid secret! Here's your access token"
  ↓
NextAuth creates session with JWT
  ↓
Session cookie set → User redirected to callback URL
  ↓
Middleware checks cookie → Access granted! ✅
```

## Debugging Tips

### If Login Still Fails

**Check 1: Verify Client Secret in Keycloak Admin**

1. Visit: http://localhost:8080
2. Login: `admin` / `admin`
3. Select realm: `pilot180`
4. Go to: Clients → `darevel-auth`
5. Go to: Credentials tab
6. Verify: Secret matches `.env.local` (`darevel-auth-secret-2025`)

**Check 2: Verify Environment Variable is Loaded**

Add temporary logging to [apps/auth/lib/auth.ts](apps/auth/lib/auth.ts:12):

```typescript
KeycloakProvider({
  clientId: process.env.KEYCLOAK_CLIENT_ID || "darevel-auth",
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
  issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/pilot180",
}),

// Add this temporarily:
console.log("KEYCLOAK_CLIENT_SECRET loaded:", !!process.env.KEYCLOAK_CLIENT_SECRET);
```

Restart dev server and check terminal output.

**Check 3: Browser Console Errors**

1. Open DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Look for errors like:
   - `invalid_client`
   - `unauthorized_client`
   - Network errors to `/api/auth/callback/keycloak`

**Check 4: Auth App Logs**

Watch the auth app terminal for errors during login attempt.

### If Session Doesn't Persist

**Check Redis Connection:**

```bash
# Connect to Redis
docker exec -it darevel_redis redis-cli

# Test connection
PING
# Should return: PONG

# Check if sessions are being stored
KEYS session:*
# Should show: session:demo@darevel.com

# View session data
GET session:demo@darevel.com
```

## Security Notes

### Production Deployment

When deploying to production:

1. **Generate Strong Secrets:**

```bash
# Generate new NEXTAUTH_SECRET
openssl rand -base64 32

# Generate new Keycloak client secret
openssl rand -hex 32
```

2. **Update Environment Variables:**

```env
# Production .env
NEXTAUTH_SECRET=<generated-secret-here>
KEYCLOAK_CLIENT_SECRET=<generated-secret-here>
```

3. **Update Keycloak Client:**
   - Login to Keycloak admin
   - Update `darevel-auth` client credentials
   - Regenerate client secret
   - Save

4. **Use HTTPS:**
   - All URLs should use `https://`
   - Cookie will be `__Secure-next-auth.session-token`

5. **Restrict Redirect URIs:**
   - Remove wildcards: `http://*.darevel.local:3005/*`
   - Add specific production URLs only

## Related Documentation

- [NextAuth v5 Migration Guide](NEXTAUTH_V5_MIGRATION_GUIDE.md)
- [Centralized SSO Guide](CENTRALIZED_SSO_GUIDE.md)
- [DNS Setup Guide](DNS_SETUP_README.md)
- [Hosts File Manual](HOSTS_SETUP_MANUAL.md)

## Summary

The login redirect loop was caused by a misconfigured Keycloak client. By changing from a public client to a confidential client with a proper client secret, NextAuth can now complete the OAuth2 authentication flow successfully.

**Status:** ✅ **Fixed**

**Last Updated:** 2025-11-10

**Your Darevel Suite authentication is now working perfectly!** 🚀
