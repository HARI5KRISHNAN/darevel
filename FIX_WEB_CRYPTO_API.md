# Fix: Web Crypto API Not Available Error

## Problem

When accessing the Mail app via `http://mail.darevel.local:3004`, Keycloak initialization fails with:

```
Error: Web Crypto API is not available
```

This error occurs because:
1. Keycloak's PKCE (Proof Key for Code Exchange) authentication requires the Web Crypto API
2. Web Crypto API is only available in **secure contexts**:
   - HTTPS connections
   - `localhost`, `127.0.0.1`, or `::1` (exact hostnames only)
3. Custom `.local` domains over HTTP are **not** considered secure contexts

## Solution: Enable HTTPS for Vite Development

### Changes Made

#### 1. Updated Mail App Vite Configuration

**File:** `apps/mail/vite.config.ts`

- Installed `@vitejs/plugin-basic-ssl` plugin
- Enabled HTTPS in dev server
- Added SSL plugin to generate self-signed certificates

```typescript
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3004,
        host: '0.0.0.0',
        https: true,  // ✅ Enable HTTPS
        allowedHosts: ['auth.darevel.local', 'mail.darevel.local'],
      },
      plugins: [react(), basicSsl()],  // ✅ Add SSL plugin
      // ...
    };
});
```

#### 2. Updated Environment Variables

**File:** `apps/mail/.env.local`

- Changed `NEXTAUTH_URL` from HTTP to HTTPS
- Added explicit Vite Keycloak configuration

```env
NEXTAUTH_URL=https://mail.darevel.local:3004
VITE_KEYCLOAK_URL=http://localhost:8080/
VITE_KEYCLOAK_REALM=pilot180
VITE_KEYCLOAK_CLIENT_ID=ai-email-assistant
```

#### 3. Updated Keycloak Realm Configuration

**File:** `keycloak/realm-export.json`

Added HTTPS redirect URIs and web origins for the `ai-email-assistant` client:

```json
{
  "clientId": "ai-email-assistant",
  "redirectUris": [
    "https://localhost:3004/*",
    "https://mail.darevel.local:3004/*",
    // ... HTTP URLs preserved for backwards compatibility
  ],
  "webOrigins": [
    "https://localhost:3004",
    "https://mail.darevel.local:3004",
    // ...
  ]
}
```

## How to Apply the Fix

### Step 1: Install Dependencies

The `@vitejs/plugin-basic-ssl` package has already been installed for the mail app:

```bash
cd apps/mail
npm install --save-dev @vitejs/plugin-basic-ssl
```

### Step 2: Import Updated Keycloak Configuration

To import the updated Keycloak realm with HTTPS redirect URIs:

```bash
# From project root
npm run clean
npm run dev
```

This will:
1. Stop and remove existing Docker containers
2. Start fresh containers
3. Import the updated `keycloak/realm-export.json`
4. Start all apps with new configuration

### Step 3: Accept Self-Signed Certificate

When you first visit `https://mail.darevel.local:3004`:

1. Browser will show a security warning (certificate not trusted)
2. Click **"Advanced"** → **"Proceed to mail.darevel.local (unsafe)"**
3. This is safe for local development - the certificate is self-signed by Vite

### Step 4: Test Keycloak Authentication

1. Visit `https://mail.darevel.local:3004`
2. Keycloak should initialize successfully (no Web Crypto API error)
3. Login with: `demo@darevel.com` / `demo123`
4. Mail app should authenticate successfully

## Technical Details

### Why HTTPS Solves the Problem

The [Web Crypto API specification](https://www.w3.org/TR/WebCryptoAPI/) requires secure contexts because:
- Cryptographic operations are sensitive
- Prevents man-in-the-middle attacks during key generation
- Ensures integrity of cryptographic operations

**Secure contexts:**
- ✅ `https://mail.darevel.local:3004`
- ✅ `https://localhost:3004`
- ✅ `http://localhost:3004` (exact hostname)
- ❌ `http://mail.darevel.local:3004` (custom domain over HTTP)

### Self-Signed Certificates in Development

The `@vitejs/plugin-basic-ssl` plugin:
- Automatically generates self-signed certificates
- Stores them in `.vite/ssl/` (gitignored)
- Certificates are valid for localhost and .local domains
- No manual certificate management needed

### Browser Support

All modern browsers support the Web Crypto API in secure contexts:
- Chrome/Edge 37+
- Firefox 34+
- Safari 11+
- Opera 24+

## Applying to Other Vite Apps

If you have other Vite apps (Chat, Excel) that use Keycloak, apply the same fix:

```bash
# For each Vite app
cd apps/[app-name]
npm install --save-dev @vitejs/plugin-basic-ssl
```

Update `vite.config.ts`:
```typescript
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  server: {
    https: true,
    // ...
  },
  plugins: [react(), basicSsl()],
});
```

Update `.env.local` with HTTPS URLs and update Keycloak realm accordingly.

## Troubleshooting

### Issue: Certificate Error Persists

**Solution:** Clear browser cache and reload:
- Chrome: `Ctrl+Shift+Delete` → Clear cached images and files
- Firefox: `Ctrl+Shift+Delete` → Clear cache

### Issue: Still Getting "Web Crypto API Not Available"

**Checklist:**
1. ✅ Vite dev server shows `https://` in startup log
2. ✅ Browser address bar shows `https://` with padlock icon
3. ✅ You've accepted the self-signed certificate warning
4. ✅ Keycloak realm has been re-imported with updated redirect URIs

### Issue: Keycloak Redirect Loop

**Cause:** Keycloak doesn't have HTTPS redirect URIs configured

**Solution:** Re-import the realm:
```bash
npm run clean && npm run dev
```

## Production Considerations

For production deployment:

1. **Use proper SSL certificates:**
   - Let's Encrypt for free SSL
   - Commercial SSL certificates
   - CloudFlare SSL

2. **Update Keycloak URLs to production domains:**
   ```json
   "redirectUris": [
     "https://mail.yourdomain.com/*"
   ]
   ```

3. **Remove development URLs** from Keycloak configuration

4. **Enable HSTS headers** for enhanced security

## References

- [Web Crypto API Specification](https://www.w3.org/TR/WebCryptoAPI/)
- [Secure Contexts (MDN)](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
- [Keycloak PKCE Support](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
- [Vite HTTPS Configuration](https://vitejs.dev/config/server-options.html#server-https)

---

**Status:** ✅ Fixed
**Last Updated:** 2025-11-11
**Issue:** Web Crypto API not available error in Mail app
**Resolution:** Enable HTTPS for Vite dev server with self-signed certificates
