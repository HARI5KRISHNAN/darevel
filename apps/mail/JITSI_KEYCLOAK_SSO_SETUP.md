# Jitsi + Keycloak SSO Integration Setup

## Overview
This configuration integrates Jitsi Meet with Keycloak SSO authentication using JWT tokens.

## Architecture
1. **Frontend (React)**: Users log in via Keycloak in the mail app
2. **Backend (Spring Boot)**: Generates JWT tokens for authenticated users
3. **Jitsi Meet**: Validates JWT tokens and allows access to video calls

## Configuration Applied

### 1. Frontend Configuration (`apps/mail/.env`)
```env
VITE_JITSI_DOMAIN=localhost
VITE_JITSI_PORT=8000
VITE_JITSI_SECURE=false
```

### 2. Backend Configuration (`apps/mail/backend/mail-service/.env`)
```env
JITSI_DOMAIN=localhost
JITSI_PORT=8000
JITSI_SECURE=false
JITSI_APP_ID=darevel
JITSI_SECRET=DarevelJitsiSecretKey_2024_MinLength32Chars!
```

**Important**: The secret must be at least 32 characters for HMAC-SHA256 signing.

### 3. Jitsi Docker Configuration (`apps/shared/jitsi/docker-compose.yml`)

JWT authentication is enabled on:
- **jitsi-web**: `ENABLE_AUTH=1`, `AUTH_TYPE=jwt`
- **jitsi-prosody**: JWT validation with `JWT_APP_ID=darevel` and matching secret
- **jitsi-jicofo**: JWT-aware conference management

### 4. Keycloak Configuration (`infrastructure/keycloak/darevel-realm.json`)

Added new client:
```json
{
  "clientId": "darevel-jitsi",
  "secret": "darevel-jitsi-secret",
  "redirectUris": ["http://localhost:8000/*"],
  "webOrigins": ["http://localhost:8000"]
}
```

## How Authentication Works

1. **User Login**: User logs into the Mail app via Keycloak
2. **Token Request**: Frontend calls `GET /api/jitsi/token?room=<roomname>`
3. **Token Generation**: Backend validates Keycloak JWT and generates Jitsi JWT
4. **Jitsi Join**: Frontend passes Jitsi JWT to JitsiMeetExternalAPI
5. **Token Validation**: Prosody validates JWT signature, issuer, audience, expiration
6. **Access Granted**: User joins the video call

## JWT Token Claims

The backend generates tokens with these claims:
```json
{
  "iss": "darevel",              // Issuer (app-id)
  "sub": "localhost",            // Subject (domain)
  "aud": ["*"],                  // Audience
  "room": "room-name",           // Room name
  "context": {
    "user": {
      "id": "user-uuid",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": ""
    }
  },
  "iat": 1234567890,            // Issued at
  "nbf": 1234567890,            // Not before
  "exp": 1234575090             // Expires (2 hours)
}
```

## Testing the Integration

### 1. Verify Services are Running

```powershell
# Check Jitsi containers
docker compose -f .\apps\shared\jitsi\docker-compose.yml ps

# Check backend (Mail Service)
Test-NetConnection -ComputerName localhost -Port 8086

# Check Keycloak
Test-NetConnection -ComputerName localhost -Port 8180
```

### 2. Test Token Endpoint

```powershell
# Get Keycloak token
$token = Invoke-RestMethod -Uri 'http://localhost:8180/realms/darevel/protocol/openid-connect/token' -Method Post -Body @{
    client_id='darevel-mail'
    grant_type='password'
    username='bob'
    password='password'
}

# Get Jitsi token
$jitsiToken = Invoke-RestMethod -Uri "http://localhost:8086/api/jitsi/token?room=testroom" -Headers @{
    Authorization = "Bearer $($token.access_token)"
}

# Display token
$jitsiToken | ConvertTo-Json
```

### 3. Test Video Call via Frontend

1. Navigate to `http://localhost:3008` (mail app)
2. Login with Keycloak (username: `bob`, password: `password`)
3. Click to start a video call
4. Frontend should automatically:
   - Request Jitsi token from backend
   - Load Jitsi external API from `http://localhost:8000`
   - Pass JWT token to Jitsi
   - Join the meeting successfully

### 4. Check Logs

```powershell
# Prosody logs (authentication)
docker compose -f .\apps\shared\jitsi\docker-compose.yml logs -f prosody

# Jicofo logs (conference focus)
docker compose -f .\apps\shared\jitsi\docker-compose.yml logs -f jicofo

# JVB logs (video bridge)
docker compose -f .\apps\shared\jitsi\docker-compose.yml logs -f jvb
```

## Troubleshooting

### "Authentication failed" Error

**Cause**: Token signature mismatch or invalid claims

**Solution**:
1. Verify secrets match in backend and Jitsi:
   ```powershell
   # Check backend
   cat .\apps\mail\backend\mail-service\.env
   
   # Check Jitsi (JWT_APP_SECRET in apps/shared/jitsi/docker-compose.yml)
   ```

2. Ensure issuer matches:
   - Backend `JITSI_APP_ID` must equal Jitsi `JWT_APP_ID` (both "darevel")

3. Check token expiration:
   - Tokens expire after 2 hours
   - Ensure clocks are synchronized

### "Cannot connect to Jitsi server" Error

**Cause**: Network/firewall or Jitsi not running

**Solution**:
1. Verify Jitsi is accessible:
   ```powershell
   curl http://localhost:8000
   ```

2. Check firewall:
   - Port 8000 (HTTP)
   - Port 10000/UDP (RTP for video/audio)
   - Port 4443 (TCP fallback)

3. Check frontend points to correct domain:
   ```powershell
   cat .\apps\mail\.env | Select-String VITE_JITSI
   ```

### Port Conflicts

If ports 8000, 4443, or 10000 are in use:

```powershell
# Find process using port
netstat -aon | Select-String ":8000"
Get-Process -Id <PID>

# Stop conflicting containers
docker ps | Select-String jitsi
docker stop <container-id>
```

## Restarting Services

### Restart Everything

```powershell
# From repo root
cd C:\Users\acer\Downloads\darevel-main\darevel-main

# Restart Keycloak
cd .\infrastructure
docker compose restart keycloak

# Restart Jitsi
cd ..\apps\shared\jitsi
docker compose restart

# Restart Backend (if using Docker)
docker compose restart backend

# Restart Frontend
npm run dev
```

### Clean Restart (removes volumes)

```powershell
cd .\apps\shared\jitsi

# Stop and remove Jitsi
docker compose down -v

# Start fresh
docker compose up -d
```

## Security Notes

1. **Change the JWT Secret in Production**: 
   - Use a strong, randomly generated secret (64+ characters)
   - Keep it secure and never commit to version control

2. **Use HTTPS in Production**:
   - Set `VITE_JITSI_SECURE=true`
   - Configure SSL certificates for Jitsi
   - Update `PUBLIC_URL` to use HTTPS

3. **Token Expiration**:
   - Current setting: 2 hours
   - Adjust in `JitsiService.java` if needed

4. **Audience Validation**:
   - Currently set to `["*"]` (accepts any audience)
   - Restrict to specific values in production

## Additional Resources

- [Jitsi JWT Documentation](https://jitsi.github.io/handbook/docs/devops-guide/secure-domain)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- Backend JWT generation: `apps/mail/backend/mail-service/src/main/java/com/darevel/mail/service/JitsiService.java`
- Frontend integration: `apps/mail/components/VideoCall.tsx`
