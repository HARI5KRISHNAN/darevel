# Sheet Service - Java Spring Boot Microservice

## Overview

The Sheet Service is a Java Spring Boot microservice that provides spreadsheet management functionality for the Darevel platform. It offers a RESTful API for creating, editing, and managing spreadsheet data with support for cell data and merged cells.

## Technology Stack

- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17+
- **Database**: PostgreSQL
- **Security**: Keycloak OAuth2 / JWT
- **Build Tool**: Maven
- **Real-time**: WebSocket support

## Features

### Core Features
- ✅ Create, read, update, delete spreadsheets
- ✅ Cell data management (content, formatting, formulas)
- ✅ Merged cells support
- ✅ Auto-save functionality
- ✅ JWT-based authentication via Keycloak
- ✅ Ownership-based authorization
- ✅ WebSocket support for real-time collaboration

### Spreadsheet Capabilities
- Store cell data in JSON format
- Track merged cell ranges
- Automatic timestamp management
- Spreadsheet versioning (createdAt, updatedAt, lastSavedAt)

## API Endpoints

### Spreadsheet Management

```
GET    /api/sheets/load             - List all spreadsheets (ordered by recent)
GET    /api/sheets/{id}             - Get spreadsheet by ID
POST   /api/sheets/save             - Create new spreadsheet
PUT    /api/sheets/{id}             - Update spreadsheet
DELETE /api/sheets/{id}             - Delete spreadsheet
```

### Health Check

```
GET    /actuator/health             - Spring Boot actuator health
```

## Configuration

### Environment Variables

```env
# Server Configuration
SERVER_PORT=8089

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Keycloak OAuth2 Configuration
KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/darevel
KEYCLOAK_JWK_SET_URI=http://localhost:8180/realms/darevel/protocol/openid-connect/certs
```

## Database Setup

### Create Database

```sql
CREATE DATABASE darevel_sheet;
```

### Tables

Tables are automatically created by Hibernate with `ddl-auto: update`:

- **sheets** - Stores spreadsheet metadata and data

### Schema Details

The `sheets` table includes:
- `id` - Primary key
- `name` - Spreadsheet name
- `data` - Cell data stored as JSONB (PostgreSQL)
- `merges` - Merged cell ranges stored as JSONB
- `last_saved_at` - Last save timestamp
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Running the Service

### Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL 12+
- Keycloak 22+ (for authentication)

### Build

```bash
cd apps/sheet/backend
mvn clean install
```

### Run

```bash
mvn spring-boot:run
```

Or with custom configuration:

```bash
java -jar target/sheet-service-1.0.0.jar \
  --SERVER_PORT=8089 \
  --DB_HOST=localhost \
  --POSTGRES_PASSWORD=your_password
```

### Docker (Optional)

```bash
docker build -t darevel-sheet-service .
docker run -p 8089:8089 \
  -e DB_HOST=postgres \
  -e POSTGRES_PASSWORD=your_password \
  darevel-sheet-service
```

## API Authentication

All endpoints require a valid JWT token from Keycloak.

### Example Request

```bash
curl -X GET http://localhost:8089/api/sheets/load \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Token Format

The service expects a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Data Models

### Sheet Request

```json
{
  "name": "My Spreadsheet",
  "data": {
    "A1": { "value": "Hello", "style": { "bold": true } },
    "B1": { "value": 42, "formula": "=SUM(A1:A10)" },
    "C1": { "value": "World" }
  },
  "merges": [
    { "start": "A1", "end": "B1" },
    { "start": "C3", "end": "D5" }
  ]
}
```

### Sheet Response

```json
{
  "id": 1,
  "name": "My Spreadsheet",
  "data": {
    "A1": { "value": "Hello", "style": { "bold": true } },
    "B1": { "value": 42, "formula": "=SUM(A1:A10)" },
    "C1": { "value": "World" }
  },
  "merges": [
    { "start": "A1", "end": "B1" }
  ],
  "lastSavedAt": "2025-11-26T10:00:00",
  "createdAt": "2025-11-26T09:00:00",
  "updatedAt": "2025-11-26T10:00:00"
}
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
2. Verify database `darevel_sheet` exists
3. Check Keycloak is accessible at configured URL
4. Verify port 8089 is not in use

### Authentication fails

1. Verify Keycloak realm `darevel` exists
2. Check JWT token is valid (not expired)
3. Verify `KEYCLOAK_JWK_SET_URI` is correct

### Database connection fails

1. Check PostgreSQL credentials
2. Verify database exists
3. Check network connectivity to database host
4. Ensure PostgreSQL accepts connections from application

### Data not persisting

1. Check database connection
2. Verify Hibernate is configured correctly (`ddl-auto: update`)
3. Check application logs for SQL errors
4. Ensure JSONB data is properly formatted

## Integration with Frontend

The Sheet frontend application (running on port 3004) connects to this backend service.

### Frontend Environment Configuration

```env
# In apps/sheet/.env
VITE_API_URL=http://localhost:8089
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=darevel
VITE_KEYCLOAK_CLIENT_ID=darevel-sheet
```

## WebSocket Real-time Collaboration

The service includes WebSocket support for real-time collaboration features.

### WebSocket Configuration

WebSocket endpoint: `ws://localhost:8089/ws`

### Example Connection (JavaScript)

```javascript
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8089/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, (frame) => {
  console.log('Connected:', frame);

  // Subscribe to sheet updates
  stompClient.subscribe('/topic/sheets/{sheetId}', (message) => {
    const update = JSON.parse(message.body);
    console.log('Sheet updated:', update);
  });

  // Send updates
  stompClient.send('/app/sheets/{sheetId}/update', {}, JSON.stringify({
    cell: 'A1',
    value: 'Updated value'
  }));
});
```

## Data Format Details

### Cell Data Format

Each cell can contain:
- `value` - The displayed value (string, number, boolean)
- `formula` - The formula (e.g., "=SUM(A1:A10)")
- `style` - Formatting options (bold, italic, color, etc.)
- `type` - Data type (text, number, date, etc.)

### Merged Cells Format

Merged cell ranges are defined as:
```json
{
  "start": "A1",  // Top-left cell
  "end": "B2"     // Bottom-right cell
}
```

## Migration Status

✅ **Complete** - Core CRUD functionality
✅ **Complete** - Authentication & Authorization
✅ **Complete** - Database persistence
✅ **Complete** - WebSocket support
⏳ **Pending** - Real-time collaboration implementation
⏳ **Pending** - Formula evaluation engine
⏳ **Pending** - Export to Excel/CSV

## Future Enhancements

- 🔄 Real-time multi-user editing
- 📊 Formula evaluation engine
- 📈 Charts and graphs support
- 📎 Cell comments and notes
- 🔍 Search functionality
- 📤 Export to Excel, CSV, PDF
- 📥 Import from Excel, CSV
- 🎨 Rich formatting options
- ↩️ Undo/redo functionality
- 🔗 Cell references and links
- 🔒 Cell-level permissions
- 📱 Mobile-optimized API

## Performance Considerations

- Use JSONB for efficient JSON storage and querying
- Implement pagination for large spreadsheet lists
- Consider caching frequently accessed spreadsheets
- Optimize WebSocket message handling for real-time updates
- Index frequently queried columns (name, updated_at)

## Security Best Practices

1. **Always validate user ownership** before allowing operations
2. **Sanitize cell formulas** to prevent code injection
3. **Limit spreadsheet size** to prevent memory issues
4. **Rate limit WebSocket connections** to prevent abuse
5. **Use HTTPS in production** for all connections
6. **Regularly update dependencies** for security patches

## Support

For issues or questions, please contact the development team or open an issue in the project repository.

## License

Proprietary - Darevel Platform
