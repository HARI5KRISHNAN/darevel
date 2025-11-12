# Phase 10: Auto-Healing + AI Incident Reports

Intelligent auto-healing system that detects pod restarts, generates AI-powered incident summaries, and sends email notifications automatically.

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Setup Guide](#setup-guide)
4. [Configuration](#configuration)
5. [Email Notifications](#email-notifications)
6. [API Reference](#api-reference)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Phase 10 adds intelligent auto-healing capabilities to Whooper:

### What Gets Detected

- **Pod Restarts** - Any container restart in the cluster
- **Restart Reasons** - OOMKilled, Error, CrashLoopBackOff, etc.
- **State Changes** - Failed → Running transitions
- **Exit Codes** - Container exit codes for debugging

### What Happens Automatically

1. **Detection** - Pod monitor watches all pods via Kubernetes API
2. **Analysis** - AI (Gemini) generates incident summary with root cause
3. **Notification** - Beautiful HTML email sent to administrators
4. **Tracking** - Incident stored with metrics for analysis
5. **Metrics** - Prometheus metrics updated for monitoring

### Key Features

- **Cluster-Wide Monitoring** - Watches all namespaces automatically
- **AI-Powered Analysis** - Gemini generates human-readable summaries
- **Email Notifications** - Professional HTML emails with full details
- **Self-Healing Watcher** - Auto-restarts if the watcher itself fails
- **Metrics Tracking** - MTTR, incident count, severity tracking
- **API Access** - REST API for incident history

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Kubernetes Cluster                          │
│                                                          │
│  ┌──────────┐    Restart      ┌──────────┐             │
│  │   Pod    │─────────────────►│   Pod    │             │
│  │ (Failed) │                  │ (Running)│             │
│  └──────────┘                  └──────────┘             │
│       │                             │                    │
│       │ Watch event                 │                    │
│       ▼                             ▼                    │
│  ┌────────────────────────────────────────┐             │
│  │     Whooper Backend - Pod Monitor      │             │
│  │                                         │             │
│  │  1. Detect restart                     │             │
│  │  2. Extract details (reason, exit code)│             │
│  │  3. Create incident record             │             │
│  └────────┬───────────────────────────────┘             │
│           │                                              │
└───────────┼──────────────────────────────────────────────┘
            │
            ▼
     ┌──────────────┐
     │   Gemini AI  │
     │              │
     │ Generate     │
     │ Summary      │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐        ┌──────────────┐
     │   Whooper    │───────►│    Email     │
     │   Backend    │        │  Assistant   │
     └──────────────┘        └──────┬───────┘
                                    │
                                    ▼
                            📧 Admin receives
                               incident report
```

### Flow Diagram

```
Pod Restarts
    │
    ├─► Pod Monitor detects via K8s watch
    │
    ├─► Extract incident details:
    │   • Pod name, namespace, container
    │   • Restart count
    │   • Reason (OOMKilled, Error, etc.)
    │   • Exit code
    │   • Error message
    │
    ├─► Create incident record
    │   • Generate unique ID
    │   • Store in memory
    │   • Update metrics
    │
    ├─► Generate AI summary
    │   • Send details to Gemini API
    │   • Get root cause analysis
    │   • Get recommended actions
    │
    ├─► Send email notification
    │   • Build HTML email
    │   • Include AI summary
    │   • Send via email service
    │
    └─► Mark incident as healed
        • Calculate MTTR
        • Update metrics
        • Log completion
```

### Restart Reasons Detected

| Reason | Severity | Description |
|--------|----------|-------------|
| `OOMKilled` | Critical | Out of memory - container exceeded memory limit |
| `Error` | High | Container exited with error code |
| `CrashLoopBackOff` | Critical | Repeated crashes - Kubernetes backing off restarts |
| `ContainerCannotRun` | High | Configuration issue or missing dependencies |
| `DeadlineExceeded` | Medium | Startup took too long |
| `Evicted` | Medium | Node resource pressure |

---

## Setup Guide

### Prerequisites

- Kubernetes cluster (v1.24+)
- Whooper backend deployed (Phase 7)
- RBAC permissions for watching pods
- Gemini API key (for AI summaries)
- Email service configured

### Step 1: Apply RBAC Permissions

The pod monitor needs permissions to watch pods across all namespaces.

```bash
# Apply RBAC manifests
kubectl apply -f k8s/autoheal/rbac.yaml
```

This creates:
- **ServiceAccount**: `whooper-backend` (if not exists)
- **ClusterRole**: `whooper-pod-watcher` with pod watch permissions
- **ClusterRoleBinding**: Grants permissions to the ServiceAccount

**Verify RBAC:**
```bash
# Check ClusterRole
kubectl get clusterrole whooper-pod-watcher

# Check ClusterRoleBinding
kubectl get clusterrolebinding whooper-pod-watcher-binding

# Verify ServiceAccount has correct permissions
kubectl auth can-i watch pods --as=system:serviceaccount:whooper:whooper-backend --all-namespaces
# Should output: yes
```

### Step 2: Update Backend Deployment

Ensure the backend deployment uses the ServiceAccount:

```yaml
# In k8s/whooper-deployment.yaml
spec:
  template:
    spec:
      serviceAccountName: whooper-backend  # ← Must be set
      containers:
        - name: backend
          # ... rest of container spec
```

Apply the deployment:
```bash
kubectl apply -f k8s/whooper-deployment.yaml
```

### Step 3: Configure Environment Variables

Set required environment variables in the backend secret:

```bash
kubectl create secret generic whooper-backend-secrets \
  --from-literal=GEMINI_API_KEY="your-gemini-api-key" \
  --from-literal=EMAIL_APP_URL="your-email-service-url" \
  --from-literal=DEFAULT_EMAIL_RECIPIENT="admin@example.com" \
  --from-literal=ALERT_EMAIL="alerts@example.com" \
  --namespace=whooper \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Step 4: Restart Backend

```bash
kubectl rollout restart deployment/whooper-backend -n whooper
```

### Step 5: Verify Auto-Healing is Active

Check backend logs:

```bash
kubectl logs -n whooper -l app=whooper,component=backend --tail=50 -f
```

Look for:
```
🚀 Whooper Pod Monitor started - watching for pod restarts...
```

Check monitoring status via API:

```bash
kubectl port-forward -n whooper svc/whooper-backend 5001:5001

curl http://localhost:5001/api/autoheal/status
```

Expected response:
```json
{
  "success": true,
  "status": {
    "isMonitoring": true,
    "trackedPods": 150,
    "incidents": 0
  }
}
```

---

## Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `GEMINI_API_KEY` | Yes* | Gemini API key for AI summaries | - |
| `EMAIL_APP_URL` | Yes* | Email service URL | - |
| `DEFAULT_EMAIL_RECIPIENT` | Yes* | Default email for notifications | - |
| `ALERT_EMAIL` | No | Alternative email for alerts | - |

\* Required for full functionality. System will work without them but with reduced features.

### Behavior Without Configuration

- **No GEMINI_API_KEY**: Uses default incident summaries (no AI)
- **No EMAIL_APP_URL**: Logs incidents but doesn't send emails
- **No DEFAULT_EMAIL_RECIPIENT**: Skips email sending

### Auto-Restart Configuration

The pod monitor automatically restarts if it fails:

- **Watch Error**: Restarts after 10 seconds
- **Startup Error**: Retries after 30 seconds
- **Self-Healing**: Monitor itself is auto-healing

### Incident Retention

By default, incidents are stored in memory:

- **Retention**: Until pod restart
- **Cleanup**: Can manually clear old incidents via API
- **Limit**: No hard limit (memory-based)

For production, consider:
- Implementing database storage
- Automated cleanup of old incidents
- Setting retention policies

---

## Email Notifications

### Email Format

When a pod restarts, administrators receive:

**Subject:**
```
🔄 Auto-Heal: my-app-7b8c9d-xyz Restarted (OOMKilled)
```

**Email Content:**
- **Header** - Color-coded by severity (critical=red, high=yellow, medium=blue)
- **Pod Details** - Name, namespace, container, restart count
- **Incident Info** - Reason, exit code, timestamps
- **AI Analysis** - Gemini-generated root cause and recommendations
- **Error Message** - Raw error message from Kubernetes
- **Footer** - Links to view logs and events

### Sample Email

```html
┌─────────────────────────────────────────┐
│   🔄 Auto-Healing Incident Report       │  (Green background)
└─────────────────────────────────────────┘

my-app-7b8c9d-xyz                          CRITICAL
Restart Count: 3

Incident Details
────────────────
Namespace:    production
Container:    app
Reason:       OOMKilled
Exit Code:    137
Detected:     2025-02-10 14:23:45
Healed:       2025-02-10 14:23:52

🤖 AI Analysis
──────────────
The container exceeded its memory limit and was killed by
Kubernetes. This is the 3rd restart, indicating a persistent
memory leak or insufficient resource allocation.

Root Cause: Memory usage exceeded 512Mi limit during peak load.

Recommended Actions:
• Increase memory limit to 1Gi in deployment spec
• Investigate memory leak using heap profiler
• Review recent code changes for memory-intensive operations
• Monitor memory usage over time

Error Message
─────────────
Container killed by OOM killer (Out of Memory)

────────────────────────────────────────────
This incident was automatically detected and
reported by Whooper Auto-Healing System
```

### Email Recipients

Emails are sent to (in priority order):
1. `DEFAULT_EMAIL_RECIPIENT` environment variable
2. `ALERT_EMAIL` environment variable (fallback)

To configure multiple recipients, use comma-separated emails:
```bash
--from-literal=DEFAULT_EMAIL_RECIPIENT="admin@example.com,ops@example.com"
```

---

## API Reference

### Get Recent Incidents

```http
GET /api/autoheal/incidents?limit=50
```

**Query Parameters:**
- `limit` (optional) - Number of incidents to return (default: 50)

**Response:**
```json
{
  "success": true,
  "incidents": [
    {
      "id": "production-my-app-7b8c9d-xyz-app-1707574625000",
      "podName": "my-app-7b8c9d-xyz",
      "namespace": "production",
      "containerName": "app",
      "restartCount": 3,
      "reason": "OOMKilled",
      "message": "Container killed by OOM killer",
      "exitCode": 137,
      "detectedAt": "2025-02-10T14:23:45.000Z",
      "healedAt": "2025-02-10T14:23:52.000Z",
      "aiSummary": "The container exceeded its memory limit...",
      "emailSent": true,
      "status": "healed"
    }
  ],
  "total": 1
}
```

### Get Incident by ID

```http
GET /api/autoheal/incidents/:id
```

**Response:**
```json
{
  "success": true,
  "incident": {
    "id": "production-my-app-7b8c9d-xyz-app-1707574625000",
    "podName": "my-app-7b8c9d-xyz",
    "namespace": "production",
    "containerName": "app",
    "restartCount": 3,
    "reason": "OOMKilled",
    "message": "Container killed by OOM killer",
    "exitCode": 137,
    "detectedAt": "2025-02-10T14:23:45.000Z",
    "healedAt": "2025-02-10T14:23:52.000Z",
    "aiSummary": "...",
    "emailSent": true,
    "status": "healed"
  }
}
```

### Clear Old Incidents

```http
DELETE /api/autoheal/incidents/old?hours=24
```

**Query Parameters:**
- `hours` (optional) - Clear incidents older than X hours (default: 24)

**Response:**
```json
{
  "success": true,
  "cleared": 15,
  "message": "Cleared 15 incidents older than 24 hours"
}
```

### Get Monitoring Status

```http
GET /api/autoheal/status
```

**Response:**
```json
{
  "success": true,
  "status": {
    "isMonitoring": true,
    "trackedPods": 150,
    "incidents": 3
  }
}
```

---

## Testing

### Test 1: Trigger a Pod Restart

Create a pod that will fail and restart:

```bash
# Create a pod that exits with error
kubectl run test-crash --image=busybox --restart=Always -- /bin/sh -c "exit 1"

# Wait a few seconds
sleep 10

# Check if restart was detected
kubectl logs -n whooper -l app=whooper,component=backend --tail=20 | grep -i restart
```

Expected output:
```
🔄 Restart detected: test-crash/busybox (count: 1)
📝 Incident created: default-test-crash-busybox-1707574625000
📧 Auto-healing email sent for incident: default-test-crash-busybox-1707574625000
✅ Incident healed: default-test-crash-busybox-1707574625000
```

### Test 2: Trigger OOMKill

Create a pod that will be OOM killed:

```bash
# Create pod with low memory limit that allocates too much
kubectl run test-oom --image=polinux/stress --restart=Always \
  --limits=memory=50Mi \
  -- stress --vm 1 --vm-bytes 100M

# Wait for OOM kill
sleep 30

# Check incident
curl http://localhost:5001/api/autoheal/incidents | jq '.incidents[] | select(.reason=="OOMKilled")'
```

### Test 3: Check Email Was Sent

Check your email inbox for:
- Subject: `🔄 Auto-Heal: test-crash Restarted (Error)`
- Contains AI summary
- Contains incident details
- Has recommended actions

### Test 4: View Incidents via API

```bash
# Get all incidents
curl http://localhost:5001/api/autoheal/incidents | jq

# Get monitoring status
curl http://localhost:5001/api/autoheal/status | jq

# Get specific incident
INCIDENT_ID="default-test-crash-busybox-1707574625000"
curl http://localhost:5001/api/autoheal/incidents/$INCIDENT_ID | jq
```

### Test 5: Verify Metrics

```bash
# Check Prometheus metrics
curl http://localhost:5001/metrics | grep -E "(whooper_incidents|whooper_alerts)"
```

Should show:
```
whooper_incidents_created_total{severity="high",namespace="default"} 1
whooper_incident_mttr_seconds_bucket{severity="high",le="60"} 1
whooper_alerts_triggered_total{severity="high",type="pod_restart"} 1
```

### Test 6: Self-Healing of Watcher

Simulate watcher failure:

```bash
# Get backend pod name
POD=$(kubectl get pod -n whooper -l app=whooper,component=backend -o jsonpath='{.items[0].metadata.name}')

# Check logs for watcher restart behavior
kubectl logs -n whooper $POD -f

# The watcher should automatically restart if it encounters errors
```

---

## Troubleshooting

### Issue 1: Pod Monitor Not Starting

**Symptoms:**
```
kubectl logs -n whooper -l app=whooper,component=backend
# No "🚀 Whooper Pod Monitor started" message
```

**Solutions:**

```bash
# Check RBAC permissions
kubectl auth can-i watch pods --as=system:serviceaccount:whooper:whooper-backend --all-namespaces
# Should output: yes

# If no:
kubectl apply -f k8s/autoheal/rbac.yaml

# Check ServiceAccount is set in deployment
kubectl get deployment whooper-backend -n whooper -o yaml | grep serviceAccountName

# Restart backend
kubectl rollout restart deployment/whooper-backend -n whooper
```

### Issue 2: No Email Notifications

**Symptoms:**
Incident detected but no email received.

**Solutions:**

```bash
# Check environment variables
kubectl exec -it -n whooper deployment/whooper-backend -- env | grep -E "(GEMINI|EMAIL)"

# Check if EMAIL_APP_URL is set
kubectl get secret whooper-backend-secrets -n whooper -o jsonpath='{.data.EMAIL_APP_URL}' | base64 -d

# Check backend logs for email errors
kubectl logs -n whooper -l app=whooper,component=backend | grep -i email

# Test email service manually
kubectl exec -it -n whooper deployment/whooper-backend -- curl -X POST $EMAIL_APP_URL -H "Content-Type: application/json" -d '{"test":"data"}'
```

### Issue 3: No AI Summaries

**Symptoms:**
Emails received but with default summaries instead of AI.

**Solutions:**

```bash
# Check if GEMINI_API_KEY is set
kubectl get secret whooper-backend-secrets -n whooper -o jsonpath='{.data.GEMINI_API_KEY}' | base64 -d

# Test Gemini API manually
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

# Check for API quota limits in logs
kubectl logs -n whooper -l app=whooper,component=backend | grep -i gemini
```

### Issue 4: Incidents Not Being Detected

**Symptoms:**
Pods restarting but no incidents created.

**Solutions:**

```bash
# Check if pod monitor is running
curl http://localhost:5001/api/autoheal/status

# Check backend logs for watch errors
kubectl logs -n whooper -l app=whooper,component=backend | grep -i "watch\|monitor"

# Verify pods are actually restarting
kubectl get pods --all-namespaces --field-selector=status.phase!=Running

# Check for specific pod
kubectl describe pod test-crash | grep -i restart
```

### Issue 5: Watcher Keeps Restarting

**Symptoms:**
Logs show repeated "Restarting pod monitor in 10 seconds..."

**Solutions:**

```bash
# Check for network issues
kubectl exec -it -n whooper deployment/whooper-backend -- ping kubernetes.default.svc.cluster.local

# Check API server connectivity
kubectl exec -it -n whooper deployment/whooper-backend -- wget -O- https://kubernetes.default.svc/api/v1/pods --no-check-certificate

# Check for resource limits
kubectl describe pod -n whooper -l app=whooper,component=backend | grep -A 5 Limits

# Increase resource limits if needed
kubectl set resources deployment whooper-backend -n whooper \
  --limits=cpu=500m,memory=512Mi \
  --requests=cpu=200m,memory=256Mi
```

### Issue 6: Too Many Email Notifications

**Symptoms:**
Receiving too many emails for same pod.

**Solution:**

The pod monitor tracks restart counts to avoid duplicate notifications for the same restart. If you're still getting duplicates:

```bash
# Check incident history
curl http://localhost:5001/api/autoheal/incidents | jq '.incidents[] | {pod: .podName, count: .restartCount, time: .detectedAt}'

# Clear old incidents if needed
curl -X DELETE http://localhost:5001/api/autoheal/incidents/old?hours=1
```

Consider implementing:
- Rate limiting in email service
- Alert aggregation (Phase 9 AlertManager)
- Custom notification thresholds

---

## Metrics

Auto-healing updates the following Prometheus metrics:

```promql
# Total incidents created
whooper_incidents_created_total{severity="critical|high|medium|warning", namespace="production"}

# Mean Time To Recovery (MTTR)
whooper_incident_mttr_seconds{severity="critical|high|medium|warning"}

# Alerts triggered by auto-healing
whooper_alerts_triggered_total{severity="high", type="pod_restart"}
```

**Example queries:**

```promql
# Incident rate per hour
rate(whooper_incidents_created_total[1h]) * 3600

# Average MTTR by severity
avg by (severity) (whooper_incident_mttr_seconds)

# Incidents by namespace
sum by (namespace) (whooper_incidents_created_total)
```

---

## Next Steps

### Phase 10.5: Auto-Heal Logs Frontend

Create a frontend dashboard to view incident history:
- List all auto-healing incidents
- Filter by namespace, severity, time range
- View AI summaries and recommendations
- Chart incident trends

### Enhancements

1. **Database Storage** - Persist incidents in PostgreSQL
2. **Advanced AI** - Use Gemini Pro for deeper analysis
3. **Root Cause Analysis** - Correlate logs, metrics, events
4. **Auto-Remediation** - Automatic resource adjustments
5. **Slack Integration** - Send notifications to Slack
6. **Incident Grouping** - Group related incidents
7. **SLA Tracking** - Track MTTR against SLAs

---

## Summary

Phase 10 successfully implemented:

- **Pod Monitor Service** - Watches all pods for restarts
- **AI Analysis** - Gemini generates incident summaries
- **Email Notifications** - Beautiful HTML emails to admins
- **Metrics Tracking** - MTTR and incident counts
- **API Endpoints** - REST API for incident management
- **RBAC Configuration** - Secure cluster-wide access
- **Self-Healing Watcher** - Auto-restarts on failure
- **Comprehensive Documentation** - Setup, API, troubleshooting

Your Whooper dashboard now **automatically detects, analyzes, and reports pod incidents** with zero manual intervention.
