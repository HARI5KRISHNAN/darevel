# Jitsi Meet Integration - Quick Start

## What Changed

✅ **Removed**: Custom WebRTC implementation (was blocked by network/firewall)  
✅ **Added**: Jitsi Meet integration (works everywhere, no network configuration needed)

## How It Works

1. **Click phone/video icon** in any conversation
2. **Jitsi window opens** with unique room name
3. **Other user sees notification** in chat with room link
4. **Both join same room** for audio/video call
5. **Works instantly** - no STUN/TURN server needed!

## Features

### ✅ Working
- 🎙️ Audio calls
- 📹 Video calls  
- 🖥️ Screen sharing
- 💬 In-call chat
- 🎚️ Audio/video controls
- 👥 Multiple participants
- 🌍 Works on any network (bypasses firewall issues)

### 🔧 Technical Details

**Jitsi Meet Server**: https://meet.jit.si (free public server)
- No installation required
- No account needed
- Unlimited calls
- Open source

**Integration**:
- External API loaded from meet.jit.si
- Unique room names per conversation
- Auto-notification in chat
- Full-screen call experience

## Usage

### Start a Call

```typescript
// User clicks phone/video icon
→ Generates unique room: `darevel-dm-1-2-1732123456789`
→ Opens Jitsi in full-screen overlay
→ Sends message: "🎥 Alice started an audio call. Join: darevel-dm-1-2-..."
```

### Join a Call

Other user sees the notification message and can:
1. **Copy room name** from message
2. **Click call button** 
3. System will detect same conversation and join automatically

OR manually enter room name if needed.

### During Call

- **Mute/Unmute**: Click microphone icon
- **Video On/Off**: Click camera icon
- **Screen Share**: Click desktop icon
- **Chat**: Click chat bubble icon
- **End Call**: Click red "End Call" button or hang up icon

## Customization

### Use Private Jitsi Server

If you want to host your own Jitsi server:

#### 1. Update JitsiCall.tsx

```typescript
const domain = 'your-jitsi-server.com'; // Change this line
```

#### 2. Deploy Jitsi (Docker)

```bash
git clone https://github.com/jitsi/docker-jitsi-meet
cd docker-jitsi-meet
cp env.example .env
./gen-passwords.sh
docker-compose up -d
```

Access at: `https://your-domain.com`

### Configure Jitsi Options

Edit `apps/chat/components/JitsiCall.tsx`:

```typescript
const options = {
    roomName: roomName,
    // ... existing options ...
    configOverwrite: {
        startWithAudioMuted: false,        // Start muted?
        startWithVideoMuted: callType === 'audio', // Video off for audio calls
        prejoinPageEnabled: false,         // Skip lobby
        disableDeepLinking: true,          // Prevent app redirect
        enableWelcomePage: false,          // Skip welcome
        
        // Advanced options
        enableNoisyMicDetection: true,     // Detect noisy mic
        enableTalkWhileMuted: true,        // Show indicator when talking while muted
        enableClosePage: false,            // Custom close handling
    },
    interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'desktop',      // Screen share
            'fullscreen',
            'hangup',
            'chat',
            'raisehand',
            'videoquality',
            'filmstrip',
            'tileview',
        ],
        SHOW_JITSI_WATERMARK: false,      // Hide watermark
        SHOW_WATERMARK_FOR_GUESTS: false, // Hide for guests too
        DEFAULT_REMOTE_DISPLAY_NAME: 'Guest',
    },
};
```

## Advantages Over Custom WebRTC

| Feature | Custom WebRTC | Jitsi Meet |
|---------|---------------|------------|
| **Network Issues** | ❌ Blocked by firewall | ✅ Always works |
| **STUN/TURN Setup** | ❌ Required | ✅ Not needed |
| **Signaling Server** | ❌ Custom backend | ✅ Built-in |
| **Screen Sharing** | ❌ Not implemented | ✅ Built-in |
| **Group Calls** | ❌ Complex | ✅ Free |
| **Mobile Support** | ❌ Limited | ✅ Full support |
| **Recording** | ❌ Not implemented | ✅ Available |
| **Maintenance** | ❌ High | ✅ Zero |

## Testing

### Test Call Flow

1. **Login as User A** (e.g., ram@gmail.com)
2. **Login as User B** in incognito (e.g., hari@gmail.com)
3. **From User A**: Click phone icon in User B's chat
4. **Result**: 
   - User A sees Jitsi call window
   - User B sees chat message: "🎥 ram started an audio call. Join: darevel-dm-..."
5. **From User B**: Click phone icon to join same room
6. **Both users** now in same call!

### Troubleshoot

**"Jitsi window blank"**:
- Check browser console for errors
- Ensure internet connection
- Try different browser (Chrome recommended)

**"Can't hear other person"**:
- Check microphone permissions
- Click microphone icon to unmute
- Check system audio settings

**"Video not working"**:
- Check camera permissions
- Ensure camera not in use by another app
- Try audio-only call first

## Alternative: Self-Hosted Jitsi

For production environments or privacy:

### Quick Deploy (Docker Compose)

```yaml
# docker-compose.jitsi.yml
version: '3'
services:
  web:
    image: jitsi/web:latest
    ports:
      - '8000:80'
      - '8443:443'
    environment:
      - ENABLE_LETSENCRYPT=1
      - LETSENCRYPT_DOMAIN=meet.yourdomain.com
      - LETSENCRYPT_EMAIL=admin@yourdomain.com
    networks:
      - jitsi
      
  prosody:
    image: jitsi/prosody:latest
    networks:
      - jitsi
      
  jicofo:
    image: jitsi/jicofo:latest
    networks:
      - jitsi
      
  jvb:
    image: jitsi/jvb:latest
    ports:
      - '10000:10000/udp'
    networks:
      - jitsi

networks:
  jitsi:
```

Then update domain in `JitsiCall.tsx` to your server.

## Resources

- [Jitsi Meet Documentation](https://jitsi.github.io/handbook/)
- [External API Guide](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
- [Self-Hosting Guide](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker)
- [Configuration Options](https://github.com/jitsi/jitsi-meet/blob/master/config.js)

## Summary

✅ **Voice/Video calls now work perfectly**  
✅ **No network configuration needed**  
✅ **Professional meeting experience**  
✅ **Free and open source**  
✅ **Production ready**

The Jitsi integration solves all the WebRTC network issues while providing even more features than the custom implementation!
