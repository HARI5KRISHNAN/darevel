# WebRTC Network Issue - Calls Blocked

## Problem Identified

**WebRTC connections are being blocked by your network/firewall.**

### Evidence:
- `createOffer()` times out after 10 seconds
- https://test.webrtc.org/ is unreachable (ERR_CONNECTION_CLOSED)
- STUN servers cannot be contacted

## Root Cause

WebRTC requires specific network protocols and ports that are currently blocked:
- **UDP ports 3478-3479** (STUN)
- **UDP ports 49152-65535** (ICE/media streams)
- **Access to STUN servers** (stun.l.google.com:19302)

Common blockers:
1. **Windows Firewall** - Blocking UDP traffic
2. **Antivirus Software** (Kaspersky, Norton, etc.) - WebRTC inspection/blocking
3. **Router/ISP** - Corporate or educational network restrictions
4. **VPN** - Some VPNs block WebRTC for privacy

## Solutions

### Option 1: Fix Network (Recommended for Production)

#### A. Allow WebRTC through Windows Firewall
```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "WebRTC STUN" -Direction Outbound -Protocol UDP -RemotePort 3478,3479 -Action Allow
New-NetFirewallRule -DisplayName "WebRTC Media" -Direction Outbound -Protocol UDP -RemotePort 49152-65535 -Action Allow
```

#### B. Check Antivirus Settings
- Temporarily disable antivirus and test
- Add exception for localhost/WebRTC if it works
- Common culprits: Kaspersky, AVG, Norton

#### C. Test Without VPN
- Disconnect from VPN
- Try calls again
- If works, configure VPN to allow WebRTC

#### D. Use Different Network
- Test on mobile hotspot
- Test on different WiFi network
- Confirms if issue is network-specific

### Option 2: Use TURN Server (Enterprise Solution)

TURN servers relay media when direct P2P connections fail.

#### Deploy Free TURN Server (Coturn):
```bash
# Docker Compose for TURN server
version: '3'
services:
  coturn:
    image: coturn/coturn
    network_mode: host
    volumes:
      - ./turnserver.conf:/etc/coturn/turnserver.conf
    command: -c /etc/coturn/turnserver.conf
```

**turnserver.conf:**
```
listening-port=3478
fingerprint
lt-cred-mech
user=username:password
realm=yourdomain.com
```

#### Update WebRTC Config:
```typescript
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:your-turn-server.com:3478',
            username: 'username',
            credential: 'password'
        }
    ],
};
```

### Option 3: Use Third-Party Service (Easiest)

Replace custom WebRTC with managed service:

#### A. Jitsi Meet (Open Source)
```bash
cd apps/chat/backend-java
docker-compose up -d jitsi
```
Already configured in `docker-compose.jitsi.yml`

#### B. Twilio Video (Commercial)
```typescript
// npm install twilio-video
import Video from 'twilio-video';

const room = await Video.connect(token, {
  name: 'my-room',
  audio: true,
  video: true
});
```

#### C. Agora.io (Commercial)
```typescript
// npm install agora-rtc-sdk-ng
import AgoraRTC from 'agora-rtc-sdk-ng';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
await client.join(appId, channel, token, uid);
```

### Option 4: Disable Calls (Temporary)

If calls aren't critical, hide the UI:

```typescript
// In ConversationView.tsx
const ENABLE_CALLS = false; // Set to false

{ENABLE_CALLS && (
  <>
    <TooltipButton ... /> // Phone icon
    <TooltipButton ... /> // Video icon
  </>
)}
```

## Testing WebRTC Connectivity

### Test 1: Check STUN Server Access
Open browser console and run:
```javascript
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

pc.createOffer().then(offer => {
  console.log('✓ WebRTC works!', offer);
}).catch(err => {
  console.error('✗ WebRTC blocked:', err);
});
```

### Test 2: Online Test Sites
- https://test.webrtc.org/ (Currently blocked for you)
- https://networktest.twilio.com/
- https://webrtc.github.io/samples/

### Test 3: Browser Settings
**Chrome:**
- Visit `chrome://webrtc-internals/`
- Should show connection attempts
- Check for errors

**Firefox:**
- Visit `about:webrtc`
- View ICE stats and connection logs

## Current Status

✅ **Message Delivery**: Working perfectly
- Real-time message broadcasting ✓
- Per-user topic subscriptions ✓
- WebSocket connections stable ✓

❌ **Voice/Video Calls**: Blocked by network
- WebRTC connections fail
- STUN servers unreachable
- Need network configuration or TURN server

## Recommended Next Steps

1. **Short-term**: Disable call UI to avoid user confusion
2. **Mid-term**: Set up TURN server or use Jitsi Meet
3. **Long-term**: Deploy to proper hosting with WebRTC support

## Additional Resources

- [WebRTC Troubleshooting Guide](https://webrtc.org/getting-started/testing)
- [Coturn TURN Server Setup](https://github.com/coturn/coturn)
- [Jitsi Meet Installation](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker)
- [Twilio WebRTC Guide](https://www.twilio.com/docs/video/javascript-v2-getting-started)
