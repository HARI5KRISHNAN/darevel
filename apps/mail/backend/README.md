# Mail Service - Java Spring Boot Microservice

## Overview

The Mail Service is a Java Spring Boot microservice that provides email management, calendar functionality, and Jitsi video conferencing integration for the Darevel platform.

## Technology Stack

- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17+
- **Database**: PostgreSQL
- **Security**: Keycloak OAuth2 / JWT
- **Build Tool**: Maven
- **Mail Protocols**: SMTP (sending), IMAP (receiving)

## Features

### Core Features
- ✅ Email management (IMAP integration)
- ✅ Email sending (SMTP)
- ✅ Calendar events management
- ✅ Jitsi video conferencing integration
- ✅ JWT-based authentication via Keycloak
- ✅ Secure token generation for Jitsi meetings

### Jitsi Integration
- JWT token generation for authenticated users
- Seamless video conferencing integration
- User identity mapping (Keycloak → Jitsi)
- Configurable meeting rooms

## API Endpoints

### Mail Management

```
GET    /api/mails                   - List all emails
GET    /api/mails/{id}              - Get email by ID
POST   /api/mails/send              - Send new email
DELETE /api/mails/{id}              - Delete email
```

### Calendar

```
GET    /api/calendar/events         - List calendar events
GET    /api/calendar/events/{id}    - Get event by ID
POST   /api/calendar/events         - Create calendar event
PUT    /api/calendar/events/{id}    - Update calendar event
DELETE /api/calendar/events/{id}    - Delete calendar event
```

### Jitsi Video Conferencing

```
GET    /api/jitsi/token?room={room} - Generate JWT token for Jitsi meeting
```

### Health Check

```
GET    /api/health                  - Service health check
GET    /actuator/health             - Spring Boot actuator health
```

## Configuration

### Environment Variables

```env
# Server Configuration
SERVER_PORT=8086

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=darevel_mail

# Keycloak OAuth2 Configuration
KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/darevel
KEYCLOAK_JWK_SET_URI=http://localhost:8180/realms/darevel/protocol/openid-connect/certs

# SMTP Configuration (for sending emails)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=

# IMAP Configuration (for receiving emails)
IMAP_HOST=localhost
IMAP_PORT=143
IMAP_SSL=false

# Mail Domain
MAIL_DOMAIN=darevel.local

# Jitsi Configuration
JITSI_DOMAIN=localhost
JITSI_PORT=8000
JITSI_SECURE=false
JITSI_APP_ID=darevel
JITSI_SECRET=DarevelJitsiSecretKey_2024_MinLength32Chars!
```

**Important**: The Jitsi secret must be at least 32 characters for HMAC-SHA256 signing.

## Database Setup

### Create Database

```sql
CREATE DATABASE darevel_mail;
```

### Tables

Tables are automatically created by Hibernate with `ddl-auto: update`:

- **emails** - Stores email messages
- **calendar_events** - Stores calendar events

## Running the Service

### Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL 12+
- Keycloak 22+ (for authentication)
- (Optional) MailHog or similar SMTP server for testing
- (Optional) Jitsi Meet server for video conferencing

### Build

```bash
cd apps/mail/backend/mail-service
mvn clean install
```

### Run

```bash
mvn spring-boot:run
```

Or with custom configuration:

```bash
java -jar target/mail-service-1.0.0.jar \
  --SERVER_PORT=8086 \
  --PGHOST=localhost \
  --PGPASSWORD=your_password
```

### Docker (Optional)

```bash
docker build -t darevel-mail-service .
docker run -p 8086:8086 \
  -e PGHOST=postgres \
  -e PGPASSWORD=your_password \
  -e KEYCLOAK_ISSUER_URI=http://keycloak:8180/realms/darevel \
  darevel-mail-service
```

## API Authentication

All endpoints (except `/api/health`) require a valid JWT token from Keycloak.

### Example Request

```bash
curl -X GET http://localhost:8086/api/mails \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Token Format

The service expects a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Jitsi Integration

### How It Works

1. **User Login**: User authenticates via Keycloak in the frontend
2. **Token Request**: Frontend calls `GET /api/jitsi/token?room=<roomname>`
3. **Token Generation**: Backend validates Keycloak JWT and generates Jitsi JWT
4. **Meeting Join**: Frontend passes Jitsi JWT to JitsiMeetExternalAPI
5. **Access Granted**: User joins the video call

### JWT Token Claims

The service generates Jitsi tokens with these claims:

```json
{
  "iss": "darevel",
  "sub": "localhost",
  "aud": ["*"],
  "room": "room-name",
  "context": {
    "user": {
      "id": "user-uuid",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": ""
    }
  },
  "iat": 1234567890,
  "nbf": 1234567890,
  "exp": 1234575090
}
```

### Testing Jitsi Integration

```bash
# Get Keycloak token
TOKEN=$(curl -X POST http://localhost:8180/realms/darevel/protocol/openid-connect/token \
  -d "client_id=darevel-mail" \
  -d "grant_type=password" \
  -d "username=bob" \
  -d "password=password" \
  | jq -r '.access_token')

# Get Jitsi token
curl http://localhost:8086/api/jitsi/token?room=testroom \
  -H "Authorization: Bearer $TOKEN"
```

## SMTP/IMAP Setup

### Development with MailHog

MailHog is recommended for local testing:

```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

- SMTP: `localhost:1025` (no auth required)
- Web UI: http://localhost:8025

### Production SMTP Configuration

For production, use a real SMTP server:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

Update `application.yml` to enable STARTTLS:

```yaml
spring:
  mail:
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

## Testing

```bash
# Run unit tests
mvn test

# Run with coverage
mvn clean verify
```

## Troubleshooting

### Service won't start

1. Check PostgreSQL is running
2. Verify database `darevel_mail` exists
3. Check Keycloak is accessible at configured URL
4. Verify port 8086 is not in use

### Jitsi token generation fails

1. Verify `JITSI_SECRET` is at least 32 characters
2. Check `JITSI_APP_ID` matches Jitsi configuration
3. Ensure Keycloak JWT is valid
4. Verify user claims are present in JWT

### Email sending fails

1. Check SMTP server is running
2. Verify SMTP credentials (if required)
3. Check network connectivity to SMTP server
4. Review logs for specific SMTP errors

### Email receiving fails

1. Verify IMAP server is accessible
2. Check IMAP credentials
3. Ensure IMAP SSL/TLS settings match server
4. Check firewall rules for IMAP port

## Integration with Frontend

The Mail frontend application (running on port 3008) connects to this backend service.

### Frontend Environment Configuration

```env
# In apps/mail/.env
VITE_API_URL=http://localhost:8086
VITE_JITSI_DOMAIN=localhost
VITE_JITSI_PORT=8000
VITE_JITSI_SECURE=false
```

## Security Notes

1. **Change Jitsi Secret in Production**:
   - Use a strong, randomly generated secret (64+ characters)
   - Keep it secure and never commit to version control

2. **Use HTTPS in Production**:
   - Set `JITSI_SECURE=true`
   - Configure SSL certificates for Jitsi
   - Use secure connections for SMTP/IMAP

3. **Token Expiration**:
   - Jitsi tokens expire after 2 hours by default
   - Adjust in `JitsiService.java` if needed

4. **SMTP Security**:
   - Always use authenticated SMTP in production
   - Enable STARTTLS for secure connections
   - Use app-specific passwords for Gmail

## Migration Status

✅ **Complete** - Core email functionality
✅ **Complete** - Calendar management
✅ **Complete** - Jitsi integration
✅ **Complete** - Authentication & Authorization
✅ **Complete** - Database persistence
⏳ **Pending** - Advanced email features (attachments, folders)
⏳ **Pending** - Real-time email notifications

## Future Enhancements

- 📎 Email attachments support
- 📁 Email folders/labels management
- 🔍 Email search functionality
- 🔔 Real-time email notifications via WebSocket
- 📅 Advanced calendar features (recurring events, reminders)
- 🤝 Calendar sharing and invitations
- 📊 Email analytics and statistics

## Related Documentation

- [Jitsi + Keycloak SSO Setup](../JITSI_KEYCLOAK_SSO_SETUP.md)
- [Keycloak Configuration](../../../infrastructure/keycloak/README.md)

## Support

For issues or questions, please contact the development team or open an issue in the project repository.

## License

Proprietary - Darevel Platform
