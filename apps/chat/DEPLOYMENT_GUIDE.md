# Whooper Kubernetes Dashboard - Complete Deployment Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Local Development](#local-development)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Email Integration Setup](#email-integration-setup)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required
- Node.js 18+
- npm or yarn
- Kubernetes cluster (optional for development)
- Gemini API Key

# Optional
- Docker (for containerization)
- kubectl (for K8s deployment)
- SMTP server or email service
```

### 1. Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment Variables

**Frontend `.env`:**
```env
VITE_BACKEND_URL=http://localhost:5001
```

**Backend `backend/.env`:**
```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
PORT=5001

# Kubernetes Configuration
KUBECONFIG_PATH=

# Email App Integration (optional)
EMAIL_APP_URL=http://localhost:6000/api/send-summary
```

### 3. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Access Application
- Frontend: `http://localhost:5177` (or shown port)
- Backend API: `http://localhost:5001`
- API Health Check: `http://localhost:5001/`

---

## 💻 Local Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Development mode (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Production mode
npm start
```

**Backend Structure:**
```
backend/
├── src/
│   ├── server.ts              # Main server file
│   ├── types.ts               # TypeScript types
│   ├── controllers/
│   │   ├── ai.controller.ts   # AI summary logic
│   │   └── pods.controller.ts # Pod management
│   ├── routes/
│   │   ├── ai.routes.ts       # AI endpoints
│   │   ├── pods.routes.ts     # Pod endpoints
│   │   ├── auth.routes.ts     # Authentication
│   │   └── chat.routes.ts     # Chat endpoints
│   └── services/
│       ├── k8s.service.ts     # Kubernetes client
│       └── pod.service.ts     # Pod utilities
└── .env                        # Environment config
```

### Frontend Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Frontend Structure:**
```
src/
├── components/
│   ├── PodStatusView.tsx           # Pod dashboard
│   ├── PodDashboard.tsx            # Alternative pod view
│   ├── MessageSummaryGenerator.tsx # AI summaries
│   ├── MeetingSchedulerV2.tsx      # Meeting scheduler
│   └── RightSidebar.tsx            # Right sidebar
├── hooks/
│   ├── useRealTimeK8s.ts           # K8s real-time hook
│   └── useLocalMeetings.ts         # Meeting storage hook
├── types.ts                         # TypeScript types
├── App.tsx                          # Main app
└── .env                             # Frontend config
```

---

## ☸️ Kubernetes Deployment

### Step 1: Build Docker Image

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5001

# Start server
CMD ["node", "dist/server.js"]
```

Build and push:
```bash
cd backend

# Build image
docker build -t your-registry/whooper-backend:latest .

# Push to registry
docker push your-registry/whooper-backend:latest
```

### Step 2: Create Kubernetes Secret

```bash
# Encode your Gemini API key
echo -n "your-gemini-api-key" | base64

# Apply the secret
kubectl create secret generic whooper-backend-secrets \
  --from-literal=GEMINI_API_KEY=your_base64_encoded_key \
  --namespace=default
```

### Step 3: Deploy to Kubernetes

```bash
# Apply all resources
kubectl apply -f k8s-deployment.yaml

# Check deployment status
kubectl get pods -l app=whooper-backend

# Check service
kubectl get svc whooper-backend-service

# View logs
kubectl logs -l app=whooper-backend --tail=100 -f
```

### Step 4: Verify RBAC

```bash
# Check ServiceAccount
kubectl get serviceaccount whooper-backend

# Check ClusterRole
kubectl get clusterrole whooper-pod-reader

# Check ClusterRoleBinding
kubectl get clusterrolebinding whooper-pod-reader-binding

# Test permissions
kubectl auth can-i list pods --as=system:serviceaccount:default:whooper-backend
# Should return: yes
```

### Step 5: Access the Service

**Option A: Port Forward (Development)**
```bash
kubectl port-forward svc/whooper-backend-service 5001:5001
```

**Option B: Ingress (Production)**
```bash
# Install nginx ingress controller (if not already installed)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Apply ingress from k8s-deployment.yaml
kubectl apply -f k8s-deployment.yaml

# Get ingress IP
kubectl get ingress whooper-backend-ingress
```

**Option C: LoadBalancer**
```bash
# Change service type to LoadBalancer in k8s-deployment.yaml
# Then apply:
kubectl apply -f k8s-deployment.yaml

# Get external IP
kubectl get svc whooper-backend-service
```

---

## 📧 Email Integration Setup

### Option 1: Simple Nodemailer Service

Create `email-service/index.js`:
```javascript
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
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
    res.json({ sent: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({
      sent: false,
      message: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Email service running' });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Email service running on port ${PORT}`);
});
```

Create `email-service/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=6000
```

Start the service:
```bash
cd email-service
npm install express nodemailer dotenv
node index.js
```

### Option 2: Gmail App Password

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use the generated password in `EMAIL_PASS`

### Option 3: SendGrid Integration

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/send-summary', async (req, res) => {
  const { subject, html, recipients } = req.body;

  try {
    await sgMail.sendMultiple({
      from: process.env.EMAIL_USER,
      to: recipients,
      subject,
      html
    });
    res.json({ sent: true });
  } catch (error) {
    res.status(500).json({ sent: false, message: error.message });
  }
});
```

---

## 🧪 Testing

### 1. Test Backend API

```bash
# Health check
curl http://localhost:5001/

# Get pods
curl http://localhost:5001/api/pods/list

# Generate summary
curl -X POST http://localhost:5001/api/ai/generate-summary \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Discussed Q4 planning and project timeline",
    "title": "Q4 Meeting",
    "participants": ["alice@example.com", "bob@example.com"]
  }'

# Test email sending
curl -X POST http://localhost:5001/api/ai/send-summary \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Summary",
    "summary": "This is a test summary",
    "recipients": ["your-email@example.com"]
  }'
```

### 2. Test Socket.IO Connection

Open browser console at `http://localhost:5177` and run:
```javascript
// Check WebSocket connection
const socket = io('http://localhost:5001');

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('initial_pods', (pods) => {
  console.log('📦 Received pods:', pods);
});

socket.on('pod_update', (event) => {
  console.log('🔄 Pod update:', event);
});
```

### 3. Test Frontend Features

**Test Pod Dashboard:**
1. Navigate to "Status" view
2. Verify pod list loads
3. Test namespace filter
4. Test status filter
5. Test search functionality
6. Check connection status indicator

**Test Meeting Summaries:**
1. Open RightSidebar
2. Select sample messages
3. Click "Generate Summary"
4. Verify AI summary appears
5. Click email icon and test sending
6. Click download icon and verify PDF

### 4. Load Testing

```bash
# Install artillery
npm install -g artillery

# Create test.yml
cat > artillery-test.yml << EOF
config:
  target: 'http://localhost:5001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/api/pods/list"
      - post:
          url: "/api/ai/generate-summary"
          json:
            transcript: "Test meeting discussion"
EOF

# Run load test
artillery run artillery-test.yml
```

---

## 🔧 Troubleshooting

### Issue: Backend won't start

**Symptom:** `Error: Cannot find module`
```bash
# Solution: Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Symptom:** `Port 5001 is already in use`
```bash
# Solution: Kill the process or use different port
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5001 | xargs kill -9

# Or change PORT in .env
PORT=5002
```

### Issue: Kubernetes connection failed

**Symptom:** `ENOENT: no such file or directory, open '.../ca.crt'`
```bash
# This is expected when running outside K8s cluster
# Server continues to work without K8s integration

# Solution 1: Set KUBECONFIG_PATH
export KUBECONFIG_PATH=~/.kube/config

# Solution 2: Deploy to K8s cluster
kubectl apply -f k8s-deployment.yaml
```

### Issue: Socket.IO not connecting

**Check CORS settings:**
```typescript
// backend/src/server.ts
const corsOptions = {
  origin: 'http://localhost:5177', // Update with your frontend URL
  methods: ['GET', 'POST'],
  credentials: true
};
```

**Check frontend URL:**
```bash
# .env
VITE_BACKEND_URL=http://localhost:5001
```

### Issue: Gemini API errors

**Symptom:** `Error: GEMINI_API_KEY not found`
```bash
# Check .env file exists
cat backend/.env | grep GEMINI_API_KEY

# Verify API key is valid
curl -H "x-goog-api-key: YOUR_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

**Symptom:** `models/gemini-1.5-pro is not found`
```typescript
// Use gemini-2.5-flash instead
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
```

### Issue: Email not sending

**Check EMAIL_APP_URL:**
```bash
# Test email service
curl http://localhost:6000/

# Check backend logs
cd backend
npm run dev
# Look for "EMAIL_APP_URL not configured" warning
```

**Test email service independently:**
```bash
curl -X POST http://localhost:6000/api/send-summary \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test",
    "html": "<p>Test email</p>",
    "recipients": ["test@example.com"]
  }'
```

### Issue: Frontend build errors

**Symptom:** TypeScript errors
```bash
# Clear cache and rebuild
rm -rf node_modules .vite dist
npm install
npm run dev
```

**Symptom:** Import errors
```bash
# Check imports match file structure
# Use relative imports: import { X } from '../components/X'
```

---

## 📊 Monitoring

### Backend Logs
```bash
# Development
cd backend && npm run dev

# Production (PM2)
npm install -g pm2
pm2 start dist/server.js --name whooper-backend
pm2 logs whooper-backend
pm2 monit
```

### Kubernetes Monitoring
```bash
# Pod status
kubectl get pods -l app=whooper-backend -w

# Logs
kubectl logs -l app=whooper-backend --tail=100 -f

# Resource usage
kubectl top pods -l app=whooper-backend

# Events
kubectl get events --sort-by='.lastTimestamp'
```

### Application Metrics
```bash
# Add to backend/src/server.ts
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    podCount: getPods().length,
    socketConnections: io.engine.clientsCount
  });
});
```

---

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use Kubernetes Secrets in production
   - Rotate API keys regularly

2. **RBAC**
   - Use least privilege principle
   - Restrict pod access to specific namespaces if possible
   - Review permissions regularly

3. **Network Security**
   - Enable HTTPS in production
   - Use WSS for Socket.IO
   - Configure firewall rules

4. **API Security**
   - Implement rate limiting
   - Add authentication middleware
   - Validate all inputs

5. **Dependencies**
   ```bash
   # Audit dependencies
   npm audit
   npm audit fix

   # Update packages
   npm update
   ```

---

## 📈 Performance Optimization

1. **Backend**
   - Enable compression: `app.use(compression())`
   - Implement caching for pod data
   - Use connection pooling for database

2. **Frontend**
   - Code splitting: Use React.lazy()
   - Optimize images: Use WebP format
   - Enable production build optimizations

3. **Socket.IO**
   - Use Redis adapter for multiple instances
   - Implement backpressure handling
   - Configure timeout values

---

## 🎯 Next Steps

After successful deployment:

1. **Phase 3 - Advanced Features**
   - Pod logs viewing
   - Pod restart/delete actions
   - Multi-cluster support
   - Advanced metrics (Prometheus)

2. **Integration Enhancements**
   - Slack notifications
   - Microsoft Teams integration
   - Calendar sync (Google Calendar)

3. **UI/UX Improvements**
   - Dark/light theme toggle
   - Customizable dashboards
   - Export to CSV/JSON
   - Advanced filtering

4. **Monitoring & Alerting**
   - Prometheus metrics
   - Grafana dashboards
   - Alert rules for pod failures
   - Performance monitoring

---

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)

---

## 🆘 Support

For issues or questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

**Happy Deploying! 🚀**
