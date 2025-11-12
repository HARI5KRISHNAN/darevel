# Whooper Kubernetes Dashboard - Phase 2 Implementation

## Overview

Phase 2 adds **real-time Kubernetes pod monitoring** and **enhanced meeting summary features** with email integration to the Whooper application.

## Features Implemented

### 1. Real-Time Kubernetes Pod Monitoring
- **Socket.IO Integration**: Real-time pod status updates via WebSocket
- **Kubernetes Client**: Official `@kubernetes/client-node` library for pod data
- **Live Pod Dashboard**: Real-time visualization with status indicators
- **Pod Filtering**: Filter by namespace, status, and search by name
- **Connection Status**: Visual indicator for Socket.IO connection state

### 2. Meeting Summary with Email Integration
- **AI Summary Generation**: Gemini AI-powered meeting summaries
- **PDF Export**: Professional PDF generation with jsPDF
- **Email Integration**: Send summaries via external SMTP/email app
- **localStorage Persistence**: Summaries saved locally for offline access
- **Fallback Support**: Mock summaries when API is unavailable

### 3. Backend API Endpoints

#### Pods
- `GET /api/pods/list` - Get current list of pods (with optional namespace filter)
- `POST /api/pods/watch/start` - Manually start pod watching (auto-started on server init)

#### AI Summaries
- `POST /api/ai/generate-summary` - Generate AI summary from transcript
  ```json
  {
    "transcript": "Meeting discussion text...",
    "title": "Q4 Planning Meeting",
    "participants": ["alice@example.com", "bob@example.com"]
  }
  ```

- `POST /api/ai/send-summary` - Send summary via email
  ```json
  {
    "subject": "Meeting Summary",
    "summary": "Summary text...",
    "recipients": ["email1@example.com", "email2@example.com"]
  }
  ```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  PodStatusView   │  │ MessageSummary   │  │ useRealTimeK8s│ │
│  │  (Table View)    │  │  Generator       │  │    Hook       │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│           │                      │                     │         │
│           │                      │                     │         │
│           └──────────────────────┴─────────────────────┘         │
│                                  │                                │
│                            Socket.IO Client                       │
│                                  │                                │
└──────────────────────────────────┼────────────────────────────────┘
                                   │
                                   │ WebSocket
                                   │
┌──────────────────────────────────┼────────────────────────────────┐
│                         BACKEND (Node + Express)                  │
├──────────────────────────────────┴────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │   Socket.IO      │  │   AI Routes      │  │  Pods Routes  │ │
│  │    Server        │  │  (Gemini API)    │  │               │ │
│  └────────┬─────────┘  └──────────────────┘  └───────┬───────┘ │
│           │                                             │         │
│           │                                             │         │
│  ┌────────┴─────────┐                         ┌────────┴───────┐ │
│  │  k8s.service.ts  │                         │  Gemini AI     │ │
│  │  (Watch Pods)    │                         │  Integration   │ │
│  └────────┬─────────┘                         └────────────────┘ │
│           │                                                       │
└───────────┼───────────────────────────────────────────────────────┘
            │
            │ Kubernetes API
            │
┌───────────┴───────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                              │
│                                                                   │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐        │
│  │  Pod  │  │  Pod  │  │  Pod  │  │  Pod  │  │  Pod  │  ...   │
│  └───────┘  └───────┘  └───────┘  └───────┘  └───────┘        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Kubernetes cluster (optional - server runs without it)
- Gemini API key
- SMTP/Email app for sending summaries (optional)

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**

   Create/update `backend/.env`:
   ```env
   # Gemini API Configuration
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   PORT=5001

   # Kubernetes Configuration
   # Leave empty to use in-cluster config or default kubeconfig
   KUBECONFIG_PATH=

   # Poll interval for fallback polling (milliseconds)
   POLL_INTERVAL_MS=15000

   # Email App Integration (optional)
   # Point this to your SMTP/email app endpoint
   EMAIL_APP_URL=http://localhost:6000/api/send-summary
   ```

3. **Kubernetes Access (Optional)**

   **For Development (Local Machine):**
   - Set `KUBECONFIG_PATH` to your kubeconfig file path
   - Or leave empty to use `~/.kube/config`

   **For Production (In-Cluster):**
   - Deploy backend as a Kubernetes Pod
   - Create ServiceAccount with proper RBAC permissions:

   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: whooper-backend
     namespace: default
   ---
   apiVersion: rbac.authorization.k8s.io/v1
   kind: ClusterRole
   metadata:
     name: whooper-pod-reader
   rules:
   - apiGroups: [""]
     resources: ["pods"]
     verbs: ["get", "list", "watch"]
   ---
   apiVersion: rbac.authorization.k8s.io/v1
   kind: ClusterRoleBinding
   metadata:
     name: whooper-pod-reader-binding
   roleRef:
     apiGroup: rbac.authorization.k8s.io
     kind: ClusterRole
     name: whooper-pod-reader
   subjects:
   - kind: ServiceAccount
     name: whooper-backend
     namespace: default
   ```

4. **Start Backend**
   ```bash
   npm run dev  # Development mode with auto-reload
   # or
   npm run build && npm start  # Production mode
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd .. # root directory
   npm install
   ```

2. **Configure Environment Variables**

   Create `.env` in root:
   ```env
   VITE_BACKEND_URL=http://localhost:5001
   ```

3. **Start Frontend**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Open browser to `http://localhost:5177` (or shown port)
   - Click "Status" in the sidebar to view Pod Dashboard
   - Use RightSidebar to generate meeting summaries

## Email Integration

To enable email sending for meeting summaries, you need to set up an external email app:

### Option 1: Use Existing SMTP App

If you have an existing email/SMTP service:

1. Set `EMAIL_APP_URL` in `backend/.env` to your service endpoint
2. Ensure your service accepts this payload:
   ```json
   {
     "subject": "Meeting Summary",
     "html": "<pre>Summary content...</pre>",
     "recipients": ["email1@example.com", "email2@example.com"]
   }
   ```

### Option 2: Create Simple Email Service

Example using Nodemailer:

```javascript
// email-service.js
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/send-summary', async (req, res) => {
  const { subject, html, recipients } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipients.join(', '),
      subject,
      html
    });
    res.json({ sent: true });
  } catch (error) {
    res.status(500).json({ sent: false, message: error.message });
  }
});

app.listen(6000, () => console.log('Email service on port 6000'));
```

## API Reference

### Socket.IO Events

#### Client → Server
- `connect` - Client connected to server
- `disconnect` - Client disconnected from server

#### Server → Client
- `initial_pods` - Initial pod list sent on connection
  ```typescript
  { pods: Pod[] }
  ```

- `pod_update` - Real-time pod update
  ```typescript
  {
    type: 'ADDED' | 'MODIFIED' | 'DELETED',
    object: Pod
  }
  ```

### REST API

#### GET /api/pods/list
Get current list of pods.

**Query Parameters:**
- `namespace` (optional) - Filter by namespace (default: 'all')

**Response:**
```json
{
  "pods": [
    {
      "id": "default/nginx-pod-abc123",
      "name": "nginx-pod-abc123",
      "namespace": "default",
      "status": "Running",
      "age": 3600,
      "restarts": 0,
      "cpuUsage": 45,
      "memoryUsage": 256
    }
  ]
}
```

#### POST /api/ai/generate-summary
Generate AI-powered meeting summary.

**Request Body:**
```json
{
  "transcript": "Meeting discussion content...",
  "title": "Q4 Planning Meeting",
  "participants": ["alice@example.com", "bob@example.com"]
}
```

**Response:**
```json
{
  "summary": "AI-generated summary with bullet points..."
}
```

#### POST /api/ai/send-summary
Send meeting summary via email.

**Request Body:**
```json
{
  "subject": "Meeting Summary - 2025-11-01",
  "summary": "Summary content...",
  "recipients": ["email1@example.com", "email2@example.com"]
}
```

**Response (Success):**
```json
{
  "sent": true,
  "message": "Summary sent successfully",
  "recipients": ["email1@example.com", "email2@example.com"]
}
```

**Response (Email App Not Configured):**
```json
{
  "sent": false,
  "message": "Email app not configured. Summary generated but not sent.",
  "summary": "..."
}
```

## Troubleshooting

### Kubernetes Connection Issues

**Problem**: `Failed to start watching pods: ENOENT: no such file or directory`

**Solution**: This is expected when running outside a Kubernetes cluster. The server continues to function without K8s integration. To fix:
- Set `KUBECONFIG_PATH` in `.env` to your kubeconfig file
- Or deploy the backend inside the Kubernetes cluster

### Socket.IO Connection Errors

**Problem**: Frontend shows "disconnected" status

**Solutions**:
1. Ensure backend is running on `http://localhost:5001`
2. Check `VITE_BACKEND_URL` in frontend `.env`
3. Check browser console for CORS errors
4. Verify firewall/network allows WebSocket connections

### Gemini API Errors

**Problem**: `Error generating summary: [GoogleGenerativeAI Error]`

**Solutions**:
1. Verify `GEMINI_API_KEY` is set correctly in `backend/.env`
2. Check API key has access to Gemini API
3. Ensure using correct model name (`gemini-2.5-flash`)
4. Check network connectivity to Google AI services

### Email Sending Fails

**Problem**: Summary generated but email not sent

**Solutions**:
1. Check `EMAIL_APP_URL` is configured in `backend/.env`
2. Verify email service is running and accessible
3. Check email service logs for errors
4. Test email service independently with curl:
   ```bash
   curl -X POST http://localhost:6000/api/send-summary \
     -H "Content-Type: application/json" \
     -d '{
       "subject": "Test",
       "html": "<p>Test</p>",
       "recipients": ["test@example.com"]
     }'
   ```

## Performance Considerations

### Backend
- **WebSocket Connections**: Each client maintains one WebSocket connection
- **Pod Watch**: Single Kubernetes watch connection for all clients
- **Memory Usage**: ~50MB base + ~1KB per pod
- **CPU Usage**: Minimal when idle, spikes during pod updates

### Frontend
- **Re-renders**: Optimized with `useMemo` for filtering
- **Socket.IO**: Automatic reconnection with exponential backoff
- **localStorage**: Summaries persisted for offline access

## Security Considerations

### Kubernetes RBAC
- Use ServiceAccount with minimal permissions
- Only grant `get`, `list`, `watch` verbs
- Restrict to specific namespaces if possible

### API Security
- **Gemini API Key**: Store in `.env`, never commit to version control
- **CORS**: Configure allowed origins in production
- **Email Validation**: Validate recipient email addresses
- **Rate Limiting**: Implement on summary generation endpoint

### Network Security
- Use HTTPS in production
- Enable WSS (WebSocket Secure) for Socket.IO
- Firewall rules to restrict backend access

## Next Steps & Enhancements

### Potential Improvements
1. **Authentication**: Add user authentication for backend API
2. **Pod Actions**: Add restart, delete, and logs viewing
3. **Metrics Integration**: Add Prometheus metrics for CPU/memory
4. **Alerting**: Real-time alerts for pod failures
5. **Multi-Cluster**: Support multiple Kubernetes clusters
6. **Summary History**: Store summary history in database
7. **Calendar Integration**: Sync meetings with Google Calendar
8. **Advanced Filtering**: Add date range and custom filters
9. **Export Options**: Add CSV, JSON export for pod data
10. **Dark/Light Theme**: Complete theme implementation

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: [Your Repository URL]
- Email: [Your Support Email]
- Documentation: [Your Docs URL]
