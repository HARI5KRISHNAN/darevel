# Darevel Mail Application

AI-powered email management application with integrated Calendar and Meetings features.

## Features

### Mail Management
- **Inbox**: View and manage received emails
- **Sent**: Access sent emails
- **Drafts**: Save and edit draft emails
- **Starred**: Quick access to important emails
- **Trash**: Manage deleted emails
- **Search**: Full-text search across all emails
- **Compose**: Create and send new emails with attachments

### Calendar
- **Event Management**: Create, update, and delete calendar events
- **Date Range View**: View events by date range
- **Event Search**: Search through calendar events
- **Recurring Events**: Support for recurring events using RRULE
- **Reminders**: Set reminders for upcoming events
- **Attendees**: Invite multiple attendees to events

### Meetings
- **Meeting Scheduling**: Schedule meetings with agenda and attendees
- **Video Conferencing**: Integration with meeting links (Zoom, Teams, Google Meet)
- **Status Tracking**: Track meeting status (scheduled, in_progress, completed, cancelled)
- **Meeting Notes**: Add notes and minutes during/after meetings
- **Recurring Meetings**: Support for recurring meetings
- **Attendee Management**: Manage attendee list with RSVP status

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth v5 with Keycloak
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Icons**: Lucide React

### Backend
- **Framework**: Spring Boot 3
- **Language**: Java 17+
- **Database**: PostgreSQL
- **Authentication**: OAuth2 Resource Server (Keycloak JWT)
- **ORM**: Spring Data JPA with Hibernate
- **API**: RESTful API with OpenAPI documentation

## Architecture

### SSO Integration
- Single Sign-On powered by Keycloak
- JWT-based authentication
- Shared session across all Darevel apps
- Automatic token refresh

### API Structure
```
Backend Service (Port 8084)
├── /api/mail/* - Email management endpoints
├── /api/calendar/events/* - Calendar event endpoints
└── /api/meetings/* - Meeting management endpoints
```

### Frontend Routes
```
├── / - Landing page
├── /dashboard - Mail inbox and management
├── /calendar - Calendar view and event management
└── /meetings - Meeting scheduler and management
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Java 17+
- PostgreSQL 14+
- Keycloak 24+
- Maven 3.8+

### Environment Variables

Create `.env.local` in the `apps/mail` directory:

```env
# Keycloak Configuration
KEYCLOAK_CLIENT_ID=ai-email-assistant
KEYCLOAK_CLIENT_SECRET=darevel-mail-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8084

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3004
NEXTAUTH_SECRET=your-nextauth-secret-here

# Node Environment
NODE_ENV=development
```

### Backend Configuration

The backend configuration is in `microservices/mail-service/src/main/resources/application.yml`:

```yaml
server:
  port: 8084

spring:
  application:
    name: mail-service
  datasource:
    url: jdbc:postgresql://localhost:5433/darevel
    username: postgres
    password: postgres
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/pilot180
```

### Running the Application

#### Backend
```bash
cd microservices/mail-service
mvn clean install
mvn spring-boot:run
```

#### Frontend
```bash
cd apps/mail
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3004
- Backend API: http://localhost:8084

## API Documentation

### Mail Endpoints

#### Get Inbox
```
GET /api/mail/inbox?page=0&size=20
```

#### Get Sent Emails
```
GET /api/mail/sent?page=0&size=20
```

#### Compose Email
```
POST /api/mail/compose
Content-Type: application/json

{
  "toEmail": "recipient@example.com",
  "subject": "Subject",
  "body": "Email body",
  "isDraft": false
}
```

### Calendar Endpoints

#### Get Events
```
GET /api/calendar/events?page=0&size=20
```

#### Create Event
```
POST /api/calendar/events
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Weekly sync",
  "startTime": "2025-11-15T10:00:00",
  "endTime": "2025-11-15T11:00:00",
  "location": "Conference Room A",
  "attendees": ["user1@example.com", "user2@example.com"]
}
```

### Meeting Endpoints

#### Get Meetings
```
GET /api/meetings?page=0&size=20
```

#### Create Meeting
```
POST /api/meetings
Content-Type: application/json

{
  "title": "Product Review",
  "description": "Q4 Product Review",
  "startTime": "2025-11-20T14:00:00",
  "endTime": "2025-11-20T15:30:00",
  "meetingLink": "https://zoom.us/j/123456789",
  "attendees": [
    {"email": "user1@example.com", "name": "User 1", "status": "pending"}
  ]
}
```

## Database Schema

### Emails Table
- id, user_id, from_email, to_email, subject, body
- is_read, is_starred, is_draft, is_sent, is_deleted
- folder, attachment_urls, reply_to_id
- created_at, sent_at

### Calendar Events Table
- id, user_id, title, description, location
- start_time, end_time, all_day
- color, attendees, recurrence_rule
- reminder_minutes, is_cancelled
- created_at, updated_at

### Meetings Table
- id, organizer_id, organizer_email, organizer_name
- title, description, start_time, end_time
- location, meeting_link, attendees
- agenda, notes, status
- is_recurring, recurrence_rule, reminder_minutes
- created_at, updated_at

## Security

### Authentication Flow
1. User logs in through Keycloak
2. Frontend receives JWT access token
3. Frontend stores token in session
4. All API requests include Bearer token
5. Backend validates JWT against Keycloak

### Authorization
- All endpoints require authentication
- Resource access restricted to token owner
- Email/event/meeting ownership validated server-side

## Development

### Code Structure

#### Backend
```
microservices/mail-service/
├── src/main/java/com/darevel/mail/
│   ├── controller/ - REST controllers
│   ├── service/ - Business logic
│   ├── entity/ - JPA entities
│   ├── repository/ - Data access
│   └── dto/ - Data transfer objects
```

#### Frontend
```
apps/mail/
├── app/ - Next.js app router pages
├── lib/ - Utilities and API clients
└── types/ - TypeScript type definitions
```

### Testing
```bash
# Backend
mvn test

# Frontend
npm test
```

## Deployment

### Production Checklist
- [ ] Update Keycloak issuer URL to production
- [ ] Set secure NEXTAUTH_SECRET
- [ ] Configure production database
- [ ] Enable HTTPS
- [ ] Set up email SMTP for actual sending
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and logging

## Troubleshooting

### Common Issues

#### Authentication fails
- Verify Keycloak is running
- Check client ID and secret
- Ensure realm name is correct

#### API requests fail
- Verify backend service is running on port 8084
- Check CORS configuration
- Ensure JWT token is valid

#### Database connection fails
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists

## License

Copyright © 2025 Darevel. All rights reserved.
