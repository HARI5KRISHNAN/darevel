# Chat Application - Authentication & Testing Guide

## Overview

This guide covers how to manage users, test authentication, and use the chat application with audio/video calls.

## Fixed Issues

### Custom User Login Bug (FIXED)

**Problem:** Custom users couldn't login properly because the frontend was storing a fake token (`'test-token-' + user.id`) instead of the real JWT token from the backend.

**Solution:** Updated `components/AuthPage.tsx` to correctly extract and store the JWT token from the authentication response.

**Files Modified:**
- `apps/chat/components/AuthPage.tsx` (lines 48-57)

## User Management

### Delete All Users

There are **two ways** to delete all users from the database:

#### Method 1: Using the UI (Easiest)
1. Open the chat application at `http://localhost:5173`
2. On the login page, scroll down to "Testing Tools"
3. Click the **"Clear All Data"** button
4. Confirm the action

#### Method 2: Using the API
```bash
# Delete all users via REST API
curl -X DELETE http://localhost:8081/api/auth/users
```

#### Method 3: Using the Test Script
```bash
cd apps/chat
./test-auth.sh
# Follow the prompts and choose 'y' when asked to delete users
```

### View All Users

#### Using the UI:
1. On the login page, scroll down to "Testing Tools"
2. Click the **"View Users"** button

#### Using the API:
```bash
curl http://localhost:8081/api/auth/users | jq
```

## Testing Authentication

### Running the Automated Test Script

We've created a comprehensive test script that validates all authentication flows:

```bash
cd apps/chat
./test-auth.sh
```

This script will:
1. ✓ Check if auth service is running
2. ✓ View existing users
3. ✓ Optionally clear all users
4. ✓ Register a new test user
5. ✓ Test login with correct credentials
6. ✓ Test login with wrong password (should fail)
7. ✓ Retrieve user details
8. ✓ Show final user count

### Manual Testing

#### 1. Register a New User

**Via UI:**
1. Go to `http://localhost:5173`
2. Click "Don't have an account? Sign Up"
3. Enter name, email, and password
4. Click "Sign Up"

**Via API:**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-secure-password",
    "name": "Your Name",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=yourname"
  }'
```

#### 2. Login

**Via UI:**
1. Enter your email and password
2. Click "Sign In"

**Via API:**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-secure-password"
  }'
```

Response will include:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "Your Name",
      "email": "your-email@example.com",
      "avatar": "...",
      "level": "Elementary",
      "createdAt": "2025-11-18T..."
    }
  }
}
```

## Testing Chat with Audio & Video Calls

### Prerequisites

1. **Start all services:**
   ```bash
   # Terminal 1: Start backend services
   cd apps/chat/backend-java
   docker-compose up -d

   # Wait for services to be ready (check logs)
   docker-compose logs -f

   # Terminal 2: Start frontend
   cd apps/chat
   npm run dev
   ```

2. **Ensure services are running:**
   - Auth Service: `http://localhost:8081`
   - Chat Service: `http://localhost:8082`
   - Mail Service: `http://localhost:8083`
   - Frontend: `http://localhost:5173`

### Testing Audio/Video Calls

#### Step 1: Create Two Test Users

Open the frontend in **two different browsers** (or one normal + one incognito):

**Browser 1:** Register as User A
- Email: `user-a@test.com`
- Password: `TestPass123!`
- Name: `User A`

**Browser 2:** Register as User B
- Email: `user-b@test.com`
- Password: `TestPass123!`
- Name: `User B`

#### Step 2: Grant Microphone/Camera Permissions

When prompted by the browser:
- ✓ Allow microphone access
- ✓ Allow camera access

#### Step 3: Start a Chat

In **Browser 1 (User A)**:
1. Click on "User B" in the users list
2. Send a text message to verify chat works

In **Browser 2 (User B)**:
1. You should see the message from User A
2. Reply to confirm bidirectional messaging works

#### Step 4: Test Audio Call

In **Browser 1 (User A)**:
1. Click the **microphone icon** 🎤 at the top
2. Wait for User B to receive the call notification

In **Browser 2 (User B)**:
1. You should see "User A is calling..."
2. Click **Accept** (or the audio accept button)
3. Both users should hear each other

**What to verify:**
- ✓ Audio is clear
- ✓ No echo or feedback
- ✓ Call status shows "Connected"
- ✓ End call button works

#### Step 5: Test Video Call

In **Browser 1 (User A)**:
1. Click the **video camera icon** 📹 at the top
2. Your video should appear locally
3. Wait for User B to accept

In **Browser 2 (User B)**:
1. You should see "User A is calling (video)..."
2. Click **Accept**
3. Both users should see each other's video

**What to verify:**
- ✓ Video is visible on both sides
- ✓ Audio works during video call
- ✓ Video quality is acceptable
- ✓ No lag or freezing
- ✓ End call button works

#### Step 6: Test Call Features

During an active call, test:
- **Mute/Unmute**: Toggle microphone button
- **Video On/Off**: Toggle camera button
- **End Call**: Both users can end the call
- **Incoming message**: Send text messages during a call

### Troubleshooting

#### Authentication Issues
- **Problem:** Can't login with custom user
- **Solution:** Make sure you're using the latest code with the auth fix
- **Check:** `localStorage.getItem('whooper_token')` should show a JWT token, not `test-token-123`

#### No Audio/Video
- **Problem:** Can't hear or see the other user
- **Solution:** Check browser permissions (click the lock icon in address bar)
- **Check:** Browser console for WebRTC errors

#### STUN/TURN Errors
- **Problem:** Calls fail to connect
- **Solution:** Check WebRTC connection logs in browser console
- **Note:** The application uses Google's public STUN server by default

#### Backend Not Responding
```bash
# Check if services are running
docker ps

# Check logs for errors
cd apps/chat/backend-java
docker-compose logs auth-service
docker-compose logs chat-service

# Restart services if needed
docker-compose restart
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Check database credentials in application.yml
# Default: darevel_chat / darevel_chat123
```

## API Endpoints Reference

### Authentication Service (Port 8081)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/users` | Get all users |
| GET | `/api/auth/users/{id}` | Get user by ID |
| DELETE | `/api/auth/users` | **Delete all users** |

### Chat Service (Port 8082)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/messages` | Get all messages |
| POST | `/api/chat/messages` | Send message |
| WS | `/ws/chat` | WebSocket connection |

## Default Credentials

**Database:**
- Username: `darevel_chat`
- Password: `darevel_chat123`
- Database: `darevel_chat`

**Grafana (Monitoring):**
- URL: `http://localhost:3001`
- Username: `admin`
- Password: `admin`

## Security Notes

⚠️ **Important for Production:**
1. Change the JWT secret from default value
2. Update database credentials
3. Disable CORS wildcard (`*`)
4. Add rate limiting to auth endpoints
5. Enable HTTPS for WebRTC
6. Use proper TURN server for production

## Additional Resources

- **Frontend Code:** `apps/chat/`
- **Backend Code:** `apps/chat/backend-java/`
- **Docker Compose:** `apps/chat/backend-java/docker-compose.yml`
- **Test Script:** `apps/chat/test-auth.sh`

---

## Quick Commands Cheatsheet

```bash
# Start backend services
cd apps/chat/backend-java && docker-compose up -d

# Start frontend
cd apps/chat && npm run dev

# Run auth tests
cd apps/chat && ./test-auth.sh

# View logs
cd apps/chat/backend-java && docker-compose logs -f

# Stop all services
cd apps/chat/backend-java && docker-compose down

# Delete all users via API
curl -X DELETE http://localhost:8081/api/auth/users

# View all users
curl http://localhost:8081/api/auth/users | jq

# Check service health
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
```
