# WebRTC Call Setup & Debugging Guide

## Issue Fixed
**Problem:** User Hari could initiate audio/video calls, but user Ram couldn't receive them.

**Root Cause:** Missing proper DTO classes for call signal serialization and insufficient logging to track the signal flow.

**Solution Implemented:**
1. Created `CallSignalDto`, `SdpDto`, and `IceCandidateDto` classes for proper message serialization
2. Enhanced `WebSocketController` with comprehensive logging
3. Added detailed logging on frontend to track signal flow

---

## Setup Instructions

### 1. Backend Setup

#### Step 1: Rebuild the Chat Service
```bash
cd microservices/chat-service

# Clean build
mvn clean install

# Or just compile
mvn clean compile
```

#### Step 2: Start the Java Backend Services
Ensure all three services are running:

```bash
# Terminal 1: Auth Service (port 8081)
cd microservices
mvn -pl auth-service spring-boot:run

# Terminal 2: Chat Service (port 8082)  
mvn -pl chat-service spring-boot:run

# Terminal 3: Permissions Service (port 8083)
mvn -pl notify-service spring-boot:run
```

Or use Docker Compose if configured:
```bash
docker-compose up -d auth-service chat-service notify-service
```

### 2. Frontend Setup

#### Step 1: Ensure Environment Variables
Check/update `.env.local` in `apps/chat/`:
```env
VITE_AUTH_SERVICE_URL=http://localhost:8081
VITE_CHAT_SERVICE_URL=http://localhost:8082
VITE_WEBSOCKET_URL=http://localhost:8082
VITE_PERMISSIONS_SERVICE_URL=http://localhost:8083
```

#### Step 2: Start Frontend
```bash
cd apps/chat
npm install
npm run dev
```

The app will run on http://localhost:3003

---

## Testing Audio/Video Calls

### Prerequisites
- **Two users created** (e.g., "Hari" with ID 1, "Ram" with ID 2)
- **Both users logged in** on different browser tabs/windows
- **Allow microphone and camera permissions** when prompted
- **For video calls:** Webcam must be connected

### Test Steps

#### Step 1: Open App in Two Browser Tabs
- Tab 1: Login as "Hari" (or user 1)
- Tab 2: Login as "Ram" (or user 2)

#### Step 2: Start Direct Message
In Tab 1 (Hari):
- Click on Ram's conversation or initiate a direct message
- Look for call buttons in the conversation header

#### Step 3: Make Audio Call
In Tab 1 (Hari):
- Click the **phone icon** (audio call button)
- A notification will say "Calling..."

In Tab 2 (Ram):
- You should see an **incoming call notification**
- Click **Accept** to receive the call
- Microphone indicator should show red (active)

#### Step 4: Make Video Call
In Tab 1 (Hari):
- Click the **video camera icon** (video call button)
- A notification will say "Calling..."

In Tab 2 (Ram):
- You should see an **incoming call notification**
- Click **Accept** to receive the call
- Video should display for both users

---

## Debugging Log Messages

### Check Frontend Logs (Browser Console)

**Open both browser tabs and open Developer Tools (F12 or Ctrl+Shift+I)**

#### Expected Logs When Hari Calls Ram:

**Tab 1 (Hari's Console):**
```
🎬 ============ STARTING CALL ============
🎬 Caller: 1 (Hari)
🎬 Receiver: 2 (Ram)
🎬 Channel ID: dm-1-2
🎬 Call type: audio

📤 ============ SENDING CALL SIGNAL ============
📤 Signal type: call-offer
📤 From user: 1
📤 To user: 2
📤 Destination: /app/call-signal/2
📤 WebSocket connected: true
✅ Call signal sent successfully
```

**Tab 2 (Ram's Console):**
```
========================================
📞 CALL SIGNAL RECEIVED ON FRONTEND
========================================
📞 Raw message body received
📞 Receiver user ID: 2 (String or Number)
📞 Receiver user name: Ram
📞 ✅ PARSED call signal successfully
📞 Signal type: call-offer
📞 From user: 1
📞 To user: 2
📞 Channel ID: dm-1-2
========================================
📞 Calling onCallSignal handler...
```

### Check Backend Logs (Terminal)

**Chat Service Terminal (port 8082):**

When Hari sends the call signal:
```
========================================
📞 CALL SIGNAL RECEIVED
========================================
📞 Receiver User ID (from path): 2
📞 Signal Type: call-offer
📞 From User: 1
📞 To User: 2
📞 Channel: dm-1-2
📞 Call Type: audio
========================================
📞 BROADCASTING to /topic/call-signal/2
========================================
```

---

## Troubleshooting

### Problem: Ram doesn't see incoming call notification

**Check 1: Frontend logs show no "CALL SIGNAL RECEIVED" on Ram's tab**
- **Cause:** Signal not reaching frontend
- **Solution:**
  1. Check backend logs - look for "CALL SIGNAL RECEIVED"
  2. If no backend logs, check Hari's console for "✅ Call signal sent successfully"
  3. If yes, but no backend logs - WebSocket connection issue

**Check 2: Frontend logs show received signal, but no incoming call popup**
- **Cause:** Signal handler not working
- **Solution:**
  1. Check browser console for errors after "Calling onCallSignal handler..."
  2. Verify `ConversationView.tsx` `handleCallSignal` function is properly defined
  3. Check if `availableUsers` includes the caller

**Check 3: WebSocket says "not connected"**
- **Cause:** WebSocket connection failed
- **Solution:**
  1. Check if chat service is running on port 8082
  2. Verify no CORS errors in browser console
  3. Check if firewall allows port 8082

### Problem: "Cannot get user media" error

- Check browser permissions for camera/microphone
- Go to site settings and allow camera/microphone
- Try a different browser (Chrome, Firefox recommended)
- Restart browser and try again

### Problem: Incoming call notification appears but no video/audio

- **Check microphone/camera permissions** - browser must have access
- **Check device access** - open camera app to verify it works
- **For video calls** - ensure webcam is connected
- Check browser console for media access errors

### Problem: Call connects but no audio/video transmission

- **Check WebRTC connection:**
  1. Open browser console
  2. Search for "🔧 Creating RTCPeerConnection"
  3. Look for "✓ Peer connection established!" or "❌ Connection failed"
  4. If failed, ICE candidates may not be exchanged properly

- **Check ICE candidates:**
  - Look for logs: "🧊 onicecandidate fired"
  - Look for logs: "🧊 Sending ICE candidate"
  - If not sending, STUN server config might be wrong

---

## Log Tracking Checklist

Use this to systematically debug:

### Caller (Hari) Side:
- [ ] "🎬 ============ STARTING CALL" - Call initiated
- [ ] "✅ Call signal sent successfully" - Signal sent via WebSocket
- [ ] "🎬 ✓ Offer created" - WebRTC offer generated
- [ ] "🧊 ICE candidates" - ICE gathering started
- [ ] "🔄 Connection state changed" - Connection state updates

### Backend (Chat Service):
- [ ] "📞 CALL SIGNAL RECEIVED" - Backend received signal
- [ ] "📞 BROADCASTING to /topic/call-signal/2" - About to broadcast
- [ ] No errors or exceptions

### Receiver (Ram) Side:
- [ ] "📞 CALL SIGNAL RECEIVED ON FRONTEND" - Signal arrived
- [ ] "📞 ✅ PARSED call signal successfully" - Parsed correctly
- [ ] "📞 Calling onCallSignal handler..." - Handler invoked
- [ ] Incoming call popup appears
- [ ] On "Accept": "🎬 STARTING CALL" (answerCall triggered)
- [ ] "✓ Peer connection established!" - Connection successful

---

## Useful Commands

### Check Services Health
```bash
# Auth Service
curl http://localhost:8081/actuator/health

# Chat Service
curl http://localhost:8082/actuator/health

# Permissions Service
curl http://localhost:8083/actuator/health
```

### View Chat Service Logs (if using Docker)
```bash
docker logs -f chat-service
```

### Restart Services
```bash
# Kill specific port
# On Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 8082).OwningProcess | Stop-Process

# On Linux/Mac:
lsof -ti:8082 | xargs kill -9

# On Windows CMD:
netstat -ano | findstr :8082
taskkill /PID <PID> /F
```

---

## Key Architecture

```
Hari's Browser (User 1)
    ↓ (Initiates call)
    ↓ Frontend WebSocket sends to /app/call-signal/2
    ↓
Java Backend (Chat Service)
    ↓ WebSocketController receives signal
    ↓ Deserializes using CallSignalDto
    ↓ Broadcasts to /topic/call-signal/2
    ↓
Ram's Browser (User 2)
    ↓ Frontend listens on /topic/call-signal/2
    ↓ Receives and displays incoming call notification
    ↓ On accept: sends call-answer signal
    ↓
(Signal goes back to Hari via same path)
    ↓
WebRTC Peer Connection Established
    ↓
Audio/Video Streams Flow
```

---

## Next Steps

If calls still don't work after this:

1. **Enable STOMP debug logging** in backend:
   - Add to `application.yml`:
   ```yaml
   logging:
     level:
       org.springframework.messaging.simp: DEBUG
       org.springframework.web.socket: DEBUG
   ```

2. **Check WebSocket Message Format**:
   - Ensure `CallSignalDto` fields match frontend message structure
   - Verify `@JsonProperty` annotations for camelCase conversion

3. **Enable Browser Network Monitoring**:
   - Open DevTools → Network tab
   - Filter for "ws" or "wss" connections
   - Look at WebSocket frames sent/received

4. **Test with Curl (Basic WebSocket Testing)**:
   - Use wscat or similar tool to connect to `/ws` endpoint
   - Manually send test signals to verify backend routing
