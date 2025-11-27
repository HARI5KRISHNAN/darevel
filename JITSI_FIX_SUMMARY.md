# Jitsi SSO Integration - Fix Summary

## Issue
The Chat service was returning a 500 error when trying to generate Jitsi JWT tokens because it lacked proper Keycloak OAuth2 JWT validation.

## Changes Made

### 1. Added Security Dependencies (`chat-service/pom.xml`)
- Added `spring-boot-starter-security`
- Added `spring-boot-starter-oauth2-resource-server`

### 2. Added Keycloak Configuration (`application.yml`)
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/darevel
          jwk-set-uri: http://localhost:8180/realms/darevel/protocol/openid-connect/certs
```

### 3. Created Security Configuration (`SecurityConfig.java`)
- Configured OAuth2 Resource Server with JWT validation
- Set up CORS for frontend origins
- Protected `/api/jitsi/**` endpoints to require authentication
- Allowed public access to `/actuator/**` and `/ws/**`

### 4. Updated JitsiController
- Changed from manual JWT parsing to Spring Security's `@AuthenticationPrincipal`
- Now properly extracts user info from validated Keycloak JWT tokens

### 5. Fixed Message Model
- Added explicit no-args constructor to resolve compilation error

### 6. Aligned Jitsi Secrets
- Updated all configuration files to use: `darevel_jitsi_secret_key_2024_secure_256bit_min`
- Files updated:
  - `apps/shared/jitsi/docker-compose.yml`
  - `apps/mail/.env.jitsi`
  - `apps/mail/docker-compose.yml`

## Services Running

✅ **Jitsi** (Port 8000)
- jitsi-web
- jitsi-prosody  
- jitsi-jicofo
- jitsi-jvb

✅ **Infrastructure**
- Keycloak (Port 8180)
- PostgreSQL (Port 5432)

✅ **Chat Backend**
- Auth Service (Port 8086)
- Chat Service (Port 8081)

✅ **Chat Frontend** (Port 3003)

## Testing Steps

### 1. Access Chat App
Open http://localhost:3003

### 2. Login
- Username: `bob`
- Password: `password`

### 3. Start a Video Call
1. Select or create a conversation
2. Click the **Video Camera** icon in the header
3. The Jitsi meeting window should open
4. You should be authenticated automatically

### 4. Verify Token Generation
Check browser console for:
- `✅ Jitsi JWT token received`

### 5. Check Backend Logs
The Chat Service should show:
```
Token requested for room: <room-name>
User info - ID: <uuid>, Email: bob@example.com, Name: Bob
Token generated successfully for room: <room-name>, user: bob@example.com
```

## Troubleshooting

### If video call doesn't start:
1. Check browser console for errors
2. Verify Jitsi is running: http://localhost:8000
3. Check Chat Service logs for token generation
4. Ensure you're logged in to Keycloak

### If authentication fails:
1. Verify Keycloak is running: http://localhost:8180
2. Check that the JWT secret matches in all locations
3. Restart the Chat Service

## Next Steps

The same integration works for the Mail app - it already has the proper security configuration and should work out of the box.
