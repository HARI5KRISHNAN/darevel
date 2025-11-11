# Jitsi Video Call Fix Instructions

## Current Issue
The browser is trying to connect to Jitsi using HTTPS/WSS (Secure WebSocket), but the self-hosted Jitsi server is configured for HTTP only. This causes SSL handshake errors.

## Root Cause
The Vite frontend dev server needs to be restarted to pick up the updated `.env` environment variables.

## Solution: Restart Frontend Dev Server

### Step 1: Stop the current Vite dev server
Find and stop the running Vite dev server:
```bash
# Find the process (usually running on port 3007)
netstat -ano | findstr :3007

# Or on Linux/Mac:
# lsof -i :3007

# Kill the process using Task Manager (Windows) or:
# kill -9 <PID>
```

### Step 2: Restart the frontend
```bash
# In the mailbox-ui-clone directory
npm run dev
```

### Step 3: Verify the configuration
After restarting, open the browser console and look for the log message:
```
🌐 Jitsi config: domain=localhost, port=8000, protocol=http
```

This confirms the frontend is using HTTP (not HTTPS) for Jitsi.

## Verification Checklist

### ✅ Backend Configuration (.env)
```env
JITSI_JWT_SECRET=ChangeMeToRandomSecret123!
VITE_JITSI_DOMAIN=localhost
VITE_JITSI_PORT=8000
```

### ✅ Jitsi Docker Configuration
Anonymous authentication is enabled:
- `ENABLE_AUTH=0`
- `ENABLE_GUESTS=1`
- `AUTH_TYPE=internal`

### ✅ Jitsi Services Running
```bash
docker compose -f docker-compose.jitsi.yml ps
```
Should show all 4 services UP:
- jitsi-web (ports 8000:80, 8443:443)
- jitsi-prosody
- jitsi-jvb
- jitsi-jicofo

## Testing the Video Call

1. Restart the frontend dev server (see Step 1-2 above)
2. Navigate to the calendar/meeting section
3. Click "Join Meeting" or start a video call
4. You should now be able to join without authentication errors

## If Still Not Working

### Check browser console for errors
Look for:
- Network errors trying to load `external_api.js`
- WebSocket connection errors
- CORS errors

### Verify Jitsi server is accessible
```bash
curl http://localhost:8000
```
Should return the Jitsi Meet HTML page.

### Check Jitsi logs
```bash
docker compose -f docker-compose.jitsi.yml logs jitsi-web --tail=50
docker compose -f docker-compose.jitsi.yml logs jitsi-prosody --tail=50
```

## Re-enabling JWT Authentication (Optional - For Later)

Once anonymous authentication is working, you can re-enable JWT:

1. Update `docker-compose.jitsi.yml`:
```yaml
# In jitsi-web and jitsi-prosody services:
- ENABLE_AUTH=1
- AUTH_TYPE=jwt
- JWT_APP_ID=pilot180-jitsi
- JWT_APP_SECRET=${JITSI_JWT_SECRET:-ChangeMeToRandomSecret123!}
- JWT_ACCEPTED_ISSUERS=pilot180-jitsi
- JWT_ACCEPTED_AUDIENCES=pilot180-jitsi
```

2. Restart Jitsi services:
```bash
docker compose -f docker-compose.jitsi.yml down -v
docker compose -f docker-compose.jitsi.yml up -d
```

3. Ensure backend's `.env` has:
```env
JITSI_JWT_SECRET=ChangeMeToRandomSecret123!
```

4. Restart backend:
```bash
docker compose up -d --build backend
```
