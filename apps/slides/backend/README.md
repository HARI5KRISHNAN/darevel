# Slides Service - Java Spring Boot Microservice

## Overview

The Slides Service is a fully functional Java Spring Boot microservice for managing presentations and slides. It provides a RESTful API for creating, editing, and managing presentation slides with rich formatting options.

## Technology Stack

- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17+
- **Database**: PostgreSQL
- **Security**: Keycloak OAuth2 / JWT
- **Build Tool**: Maven

## Features

### Core Features
- ✅ Create, read, update, delete presentations
- ✅ Add, edit, delete, reorder slides
- ✅ Duplicate presentations and slides
- ✅ Rich slide formatting (colors, fonts, layouts)
- ✅ Multiple slide layouts (title, content, choice, poll)
- ✅ JWT-based authentication via Keycloak
- ✅ Ownership-based authorization

### Slide Customization
- Background colors and gradients
- Text colors and fonts
- Title and content font sizes
- Letter spacing and line height
- Multi-column text layout
- Image support (URL storage)
- Branching slides for interactive presentations

## API Endpoints

### Presentations

```
GET    /api/presentations              - List all user presentations
GET    /api/presentations/{id}         - Get presentation by ID
POST   /api/presentations              - Create new presentation
PUT    /api/presentations/{id}         - Update presentation
DELETE /api/presentations/{id}         - Delete presentation
POST   /api/presentations/{id}/duplicate - Duplicate presentation
```

### Slides

```
GET    /api/presentations/{presentationId}/slides  - List slides in presentation
GET    /api/slides/{slideId}?presentationId=...    - Get slide by ID
POST   /api/presentations/{presentationId}/slides  - Create new slide
PUT    /api/slides/{slideId}?presentationId=...    - Update slide
DELETE /api/slides/{slideId}?presentationId=...    - Delete slide
POST   /api/slides/{slideId}/duplicate?presentationId=... - Duplicate slide
PUT    /api/presentations/{presentationId}/slides/reorder - Reorder slides
```

### Health Check

```
GET    /api/health                     - Service health check
GET    /actuator/health                - Spring Boot actuator health
```

## Configuration

### Environment Variables

```env
# Server Configuration
SERVER_PORT=8084

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=darevel_slides

# Keycloak OAuth2 Configuration
KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/darevel
KEYCLOAK_JWK_SET_URI=http://localhost:8180/realms/darevel/protocol/openid-connect/certs

# File Upload Configuration (Optional)
FILE_UPLOAD_DIR=./uploads/slides

# AI Service Configuration (Optional - for future features)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

## Database Setup

### Create Database

```sql
CREATE DATABASE darevel_slides;
```

### Tables

Tables are automatically created by Hibernate with `ddl-auto: update`:

- **presentations** - Stores presentation metadata
- **slides** - Stores individual slides with content and styling

## Running the Service

### Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL 12+
- Keycloak 22+ (for authentication)

### Build

```bash
cd apps/slides/backend
mvn clean install
```

### Run

```bash
mvn spring-boot:run
```

Or with custom configuration:

```bash
java -jar target/slides-service-1.0.0.jar \
  --SERVER_PORT=8084 \
  --DB_HOST=localhost \
  --POSTGRES_PASSWORD=your_password
```

### Docker (Optional)

```bash
docker build -t darevel-slides-service .
docker run -p 8084:8084 \
  -e DB_HOST=postgres \
  -e POSTGRES_PASSWORD=your_password \
  darevel-slides-service
```

## API Authentication

All endpoints (except `/api/health`) require a valid JWT token from Keycloak.

### Example Request

```bash
curl -X GET http://localhost:8084/api/presentations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Token Format

The service expects a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Data Models

### Presentation

```json
{
  "id": 1,
  "title": "My Presentation",
  "description": "Presentation description",
  "ownerId": "user-keycloak-id",
  "createdBy": "user@example.com",
  "isPublic": false,
  "viewCount": 0,
  "createdAt": "2025-11-26T10:00:00",
  "updatedAt": "2025-11-26T10:00:00"
}
```

### Slide

```json
{
  "id": 1,
  "title": "Slide Title",
  "subtitle": "Subtitle",
  "content": "Slide content",
  "layout": "content",
  "slideOrder": 0,
  "backgroundColor": "#ffffff",
  "textColor": "#000000",
  "titleFontSize": 32,
  "contentFontSize": 18,
  "fontFamily": "Arial",
  "letterSpacing": 0,
  "lineHeight": 1.5,
  "textColumns": 1,
  "gradient": {
    "type": "linear",
    "colors": ["#ff0000", "#0000ff"],
    "angle": 45
  },
  "image": {
    "url": "https://example.com/image.jpg",
    "position": "background"
  },
  "isBranching": false,
  "createdAt": "2025-11-26T10:00:00",
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
2. Verify database `darevel_slides` exists
3. Check Keycloak is accessible at configured URL
4. Verify port 8084 is not in use

### Authentication fails

1. Verify Keycloak realm `darevel` exists
2. Check JWT token is valid (not expired)
3. Verify `KEYCLOAK_JWK_SET_URI` is correct

### Database connection fails

1. Check PostgreSQL credentials
2. Verify database exists
3. Check network connectivity to database host

## Future Enhancements

The following features are planned for future releases:

- 🔄 Real-time collaboration (WebSocket)
- 📊 Shape and diagram support
- 📎 File attachments
- 🎨 Templates library
- 🤖 AI-powered content generation
- 📄 PDF export
- 🖼️ Image upload

## Migration Status

✅ **Complete** - Core CRUD functionality
✅ **Complete** - Authentication & Authorization
✅ **Complete** - Database persistence
⏳ **Pending** - Frontend integration
⏳ **Pending** - Advanced features (shapes, templates, AI)

## Support

For issues or questions, please contact the development team or open an issue in the project repository.

## License

Proprietary - Darevel Platform
