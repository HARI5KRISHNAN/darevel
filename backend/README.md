# Darevel Backend API

RESTful API backend for the Darevel Suite applications.

## Features

- ✅ JWT Authentication with Keycloak
- ✅ PostgreSQL database integration
- ✅ File upload support
- ✅ User profile management
- ✅ Role-based access control
- ✅ Health check endpoints
- ✅ TypeScript support
- ✅ Docker support

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Authentication**: Keycloak (via JWT)
- **Language**: TypeScript
- **File Upload**: Multer

## API Endpoints

### Health Check
```http
GET /api/health
```
Returns system health status including database connectivity.

### User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```
Get authenticated user's profile.

```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```
Update user profile.

### File Upload
```http
POST /api/drive/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
```
Upload a file (max 10MB).

```http
GET /api/drive/files
Authorization: Bearer <token>
```
Get all files for authenticated user.

## Development

### Install Dependencies
```bash
cd backend
npm install
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/darevel
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
KEYCLOAK_JWKS_URI=http://localhost:8080/realms/pilot180/protocol/openid-connect/certs
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Run Development Server
```bash
npm run dev
```

Server will start at http://localhost:4000

### Build for Production
```bash
npm run build
npm start
```

## Docker

### Build Image
```bash
docker build -t darevel-backend .
```

### Run with Docker Compose
```bash
# From repository root
docker-compose up backend
```

## Database Schema

### users
- `id` (VARCHAR, PRIMARY KEY) - Keycloak user ID
- `email` (VARCHAR, UNIQUE) - User email
- `name` (VARCHAR) - User display name
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### files
- `id` (SERIAL, PRIMARY KEY)
- `user_id` (VARCHAR, FK to users)
- `filename` (VARCHAR) - Stored filename
- `original_name` (VARCHAR) - Original filename
- `mimetype` (VARCHAR)
- `size` (INTEGER) - File size in bytes
- `path` (VARCHAR) - File path
- `created_at` (TIMESTAMP)

## Authentication

All protected routes require a valid JWT token from Keycloak:

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

The backend validates tokens using Keycloak's public keys (JWKS).

## Error Handling

All errors return JSON:
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## License

MIT
