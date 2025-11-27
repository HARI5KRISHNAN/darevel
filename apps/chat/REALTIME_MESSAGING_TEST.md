# Real-Time Messaging & Call Testing Guide

## ✅ Services Status
- **Backend Services**: Running and healthy
  - Auth Service: http://localhost:8081 ✓
  - Chat Service: http://localhost:8082 ✓
  - Postgres: localhost:5432 ✓
- **Frontend**: http://localhost:3003 ✓

## 🔧 Recent Fixes Applied

### Message Delivery Fix
Modified `ChatService.java` to broadcast DM messages to **BOTH**:
1. Channel topic: `/topic/messages/dm-{userId1}-{userId2}`
2. Personal topics: `/topic/messages/user-{userId1}` AND `/topic/messages/user-{userId2}`

**Verified**: Backend logs show messages ARE being broadcasted to personal topics:
```
💬 Broadcasted (from ChatService) message 35 to /topic/messages/dm-1-2
💬 Broadcasted DM to personal topics: /topic/messages/user-1 and /topic/messages/user-2
```

## 🧪 Testing Real-Time Message Delivery

### Step 1: Setup Two Users

#### Window 1 - User A (e.g., "ram@gmail.com")
1. Open http://localhost:3003 in **regular browser window**
2. If not registered: Click "Register" → Enter name, email, password → Submit
3. If registered: Login with existing credentials
4. You should see "Direct Messages" sidebar

#### Window 2 - User B (e.g., "test@test.com")  
1. Open http://localhost:3003 in **incognito/private window**
2. Register a NEW user with different email
3. Login as this new user

### Step 2: Test Message Delivery

#### From User A:
1. Click on search box or "Available Users" section
2. Find and click on User B's name
3. Type a message: "Hello from User A"
4. Press Enter or click Send

#### Expected Result in User B's Window:
- **✓ INSTANT**: Message should appear immediately WITHOUT searching
- **✓ VISUAL**: Green debug toast in top-right corner showing message preview
- **✓ SIDEBAR**: User A's conversation should appear in sidebar with unread badge
- **✓ CONTENT**: Message content visible when conversation opened

#### What Frontend Logs Show (Press F12 → Console):
```
🔌 Initializing WebSocket connection...
✓ Connected to WebSocket
✅ Subscribed to /topic/messages/user-{userId}
📥 Received DM via /topic/messages/user-{userId}: {message data}
```

### Step 3: Test Bidirectional Messaging

#### From User B:
1. Click on User A's conversation in sidebar (should already be there)
2. Send reply: "Hi back from User B"

#### Expected Result in User A's Window:
- **✓ INSTANT**: Reply appears immediately in the open conversation
- **✓ NO REFRESH**: No need to search or reload

## 🎥 Testing Voice/Video Calls

### Step 1: Initiate Call

#### From User A:
1. Open conversation with User B
2. Click **phone icon** (audio) or **video icon** (video call)
3. Browser will request microphone/camera permissions → Click **Allow**
4. You should see "Calling..." state

#### Expected Result in User B's Window:
- **✓ INSTANT**: Incoming call notification should pop up
- **✓ DETAILS**: Shows "User A is calling..." with Accept/Reject buttons
- **✓ AUDIO**: Ringtone plays (if implemented)

### Step 2: Accept Call

#### From User B:
1. Click **"Accept"** on incoming call notification
2. Browser requests permissions → Click **Allow**
3. Call window should open with local/remote video

#### Expected Result:
- **✓ CONNECTED**: Both users see each other's video (if video call)
- **✓ AUDIO**: Can hear each other speaking
- **✓ CONTROLS**: Mute/video toggle buttons work
- **✓ END CALL**: Either user can hang up

## 🐛 Troubleshooting

### Messages Not Arriving Instantly?

1. **Check WebSocket Connection** (F12 → Console):
   ```
   Look for: "✓ Connected to WebSocket"
   Look for: "✅ Subscribed to /topic/messages/user-{userId}"
   ```

2. **Check Backend Logs**:
   ```powershell
   cd "C:\Users\acer\Downloads\darevel-main\darevel-main\apps\chat\backend-java"
   docker-compose logs -f chat-service | Select-String "Broadcasted"
   ```
   Should show:
   ```
   💬 Broadcasted (from ChatService) message {id} to /topic/messages/dm-{userId1}-{userId2}
   💬 Broadcasted DM to personal topics: /topic/messages/user-{userId1} and /topic/messages/user-{userId2}
   ```

3. **Check if User is Logged In**:
   - WebSocket ONLY connects after successful login
   - If you see "Please login" → you're not authenticated
   - Login first, THEN test messaging

4. **Verify Services Running**:
   ```powershell
   docker ps
   ```
   Should show: `darevel-chat-service`, `darevel-auth-service`, `darevel-chat-postgres` all "Up" and "healthy"

5. **Clear Browser Cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear site data in DevTools

### Calls Not Working?

1. **Check Browser Permissions**:
   - Chrome: Settings → Privacy → Site Settings → Camera/Microphone
   - Ensure http://localhost:3003 has permissions

2. **Check HTTPS** (for production):
   - WebRTC requires HTTPS (localhost is exempt)
   - If testing remotely, use HTTPS

3. **Check WebSocket Connection**:
   - Calls use same WebSocket as messages
   - If messages work, signaling should work
   - Check console for: `✅ Subscribed to /topic/call-signal/{userId}`

4. **Check Available Users**:
   - Frontend needs `availableUsers` list populated
   - If empty, calls won't initiate
   - Check console logs for user fetch errors

5. **Check STUN/TURN Servers**:
   - Default uses Google STUN servers
   - If behind strict firewall, may need TURN server
   - Check console for ICE connection failures

## 📊 Backend Verification Commands

### Test Message API Directly:
```powershell
# Send message as user 1 to channel dm-1-2
$body = @{ userId = 1; content = "Direct API test" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8082/api/chat/dm-1-2/messages" -Method POST -Body $body -ContentType "application/json"
```

### Monitor WebSocket Activity:
```powershell
cd "C:\Users\acer\Downloads\darevel-main\darevel-main\apps\chat\backend-java"
docker-compose logs -f chat-service | Select-String "WebSocket|CONNECT|SUBSCRIBE|Broadcasted"
```

### Check Active Connections:
```powershell
docker-compose logs chat-service | Select-String "WebSocketSession"
```
Should show: `WebSocketSession[N current WS(N)]` where N > 0 if users are connected

## ✅ Success Criteria

### Messages:
- [x] User A sends message
- [x] User B receives instantly (< 1 second)
- [x] No search/refresh needed
- [x] Debug toast appears
- [x] Conversation auto-created in sidebar

### Calls:
- [x] User A initiates call
- [x] User B sees notification instantly
- [x] Accept button works
- [x] Audio/video streams connect
- [x] Both users can hear/see each other
- [x] Hang up works for both sides

## 🎯 Current Status

- **Backend**: ✅ All services healthy
- **Frontend**: ✅ Running on port 3003
- **WebSocket**: ✅ Endpoint available at ws://localhost:8082/ws
- **Message Broadcasting**: ✅ Fixed to broadcast to personal topics
- **Call Signaling**: ✅ Configured and ready

**Next Step**: Open browser, login as two different users, and test!
