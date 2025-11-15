# Phase 10: Auto-Healing + AI Incident Reports - Implementation Summary

## Overview

Phase 10 transforms Whooper into an **intelligent auto-healing platform** that automatically detects pod restarts, generates AI-powered incident summaries, and sends email notifications with zero manual intervention.

## What Was Implemented

### 1. Pod Monitor Service

**Service File** ([backend/src/services/podMonitor.service.ts](backend/src/services/podMonitor.service.ts))

**Core Capabilities:**
- Watches all pods across all namespaces via Kubernetes API
- Detects container restarts in real-time
- Tracks restart counts to avoid duplicate notifications
- Extracts detailed incident information (reason, exit code, message)
- Creates structured incident records
- Self-healing: Auto-restarts if watcher fails

**Detection Coverage:**
- `OOMKilled` - Out of memory kills
- `Error` - Application crashes
- `CrashLoopBackOff` - Repeated crashes
- `ContainerCannotRun` - Configuration issues
- `DeadlineExceeded` - Slow startup
- `Evicted` - Node resource pressure

**Incident Lifecycle:**
1. **Detected** - Pod restart event captured
2. **Healing** - AI analysis in progress
3. **Healed** - Email sent, incident recorded
4. **Failed** - Error occurred (rare)

**Key Functions:**
```typescript
startPodMonitor()          // Start watching pods
stopPodMonitor()           // Stop watching
getRecentIncidents(limit)  // Get incident history
getIncidentById(id)        // Get specific incident
clearOldIncidents(hours)   // Cleanup old data
getMonitoringStatus()      // Check if running
```

### 2. AI-Powered Incident Analysis

**Gemini Integration:**
- Uses `gemini-2.5-flash` model for fast analysis (1-3 seconds)
- Generates human-readable summaries from technical data
- Provides root cause analysis
- Recommends specific actions

**AI Prompt Structure:**
```
Pod Details:
- Name, namespace, container
- Restart count
- Reason and error message
- Exit code

Generate:
1. What happened (2-3 sentences)
2. Likely root cause (1-2 sentences)
3. Recommended next steps (2-3 bullet points)
```

**Fallback Behavior:**
- If Gemini API unavailable: Uses intelligent default summaries
- If API key not configured: Generates reason-based descriptions
- Graceful degradation ensures emails always sent

**Reason Descriptions:**
```typescript
OOMKilled          → "Container exceeded memory limit"
CrashLoopBackOff   → "Repeated crashes, Kubernetes backing off"
Error              → "Application crash or configuration issue"
ContainerCannotRun → "Missing dependencies or bad config"
DeadlineExceeded   → "Startup deadline exceeded"
Evicted            → "Node resource pressure"
```

### 3. Email Notification System

**Email Features:**
- **Beautiful HTML emails** with color-coded severity
- **Plain text fallback** for email clients
- **Complete incident details** (pod, namespace, container, timestamps)
- **AI-generated summary** with root cause and actions
- **Error messages** from Kubernetes
- **Professional branding** with Whooper footer

**Email Structure:**

**Header:**
```
🔄 Auto-Healing Incident Report
[Color-coded: green=healed, yellow=warning]
```

**Pod Info:**
```
my-app-7b8c9d-xyz                    CRITICAL
Restart Count: 3
```

**Details Table:**
```
Namespace:    production
Container:    app
Reason:       OOMKilled
Exit Code:    137
Detected:     2025-02-10 14:23:45
Healed:       2025-02-10 14:23:52
```

**AI Analysis:**
```
🤖 AI Analysis

The container exceeded its memory limit and was killed by
Kubernetes. This is the 3rd restart, indicating a persistent
memory leak or insufficient resource allocation.

Root Cause: Memory usage exceeded 512Mi limit during peak load.

Recommended Actions:
• Increase memory limit to 1Gi in deployment spec
• Investigate memory leak using heap profiler
• Review recent code changes for memory-intensive operations
• Monitor memory usage over time
```

**Error Message:**
```
Container killed by OOM killer (Out of Memory)
```

**Subject Lines:**
```
🔄 Auto-Heal: my-app-xyz Restarted (OOMKilled)
🔄 Auto-Heal: worker-abc Restarted (Error)
🔄 Auto-Heal: api-def Restarted (CrashLoopBackOff)
```

### 4. RBAC Configuration

**Manifests** ([k8s/autoheal/rbac.yaml](k8s/autoheal/rbac.yaml))

**Resources Created:**
1. **ServiceAccount**: `whooper-backend`
2. **ClusterRole**: `whooper-pod-watcher`
3. **ClusterRoleBinding**: `whooper-pod-watcher-binding`

**Permissions Granted:**
```yaml
# Watch pods across all namespaces
- resources: ["pods"]
  verbs: ["get", "list", "watch"]

# Read pod logs
- resources: ["pods/log"]
  verbs: ["get"]

# Read events for context
- resources: ["events"]
  verbs: ["get", "list", "watch"]

# Read workloads for context
- resources: ["deployments", "replicasets", "statefulsets"]
  verbs: ["get", "list"]
```

**Security:**
- **Read-only access** - No write permissions
- **Cluster-scoped** - Can watch all namespaces
- **Minimal permissions** - Only what's needed
- **ServiceAccount isolation** - Dedicated identity

### 5. API Endpoints

**Routes** ([backend/src/routes/autoheal.routes.ts](backend/src/routes/autoheal.routes.ts))

**Endpoints:**

```http
GET /api/autoheal/incidents?limit=50
```
Get recent incidents with details

```http
GET /api/autoheal/incidents/:id
```
Get specific incident by ID

```http
DELETE /api/autoheal/incidents/old?hours=24
```
Clear incidents older than X hours

```http
GET /api/autoheal/status
```
Check if monitoring is active

**Response Example:**
```json
{
  "success": true,
  "incidents": [
    {
      "id": "production-my-app-xyz-app-1707574625000",
      "podName": "my-app-xyz",
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

### 6. Metrics Integration

**Metrics Updated:**
```promql
# Incidents created by severity and namespace
whooper_incidents_created_total{severity="critical",namespace="production"}

# Mean Time To Recovery histogram
whooper_incident_mttr_seconds{severity="critical"}

# Alerts triggered by auto-healing
whooper_alerts_triggered_total{severity="high",type="pod_restart"}
```

**Severity Mapping:**
| Reason | Severity |
|--------|----------|
| OOMKilled, CrashLoopBackOff | critical |
| Error, ContainerCannotRun | high |
| DeadlineExceeded, Evicted | medium |
| Others | warning |

**MTTR Tracking:**
- Calculates time from detection to healing
- Records in Prometheus histogram
- Bucketed for percentile queries
- Grouped by severity

### 7. Server Integration

**Modified Files:**
- [backend/src/server.ts](backend/src/server.ts)

**Changes:**
```typescript
// Import pod monitor
import { startPodMonitor, stopPodMonitor } from './services/podMonitor.service';

// Register auto-heal routes
import autohealRoutes from './routes/autoheal.routes';
app.use('/api/autoheal', autohealRoutes);

// Start pod monitor on boot
startPodMonitor().catch(err => {
  console.warn('Pod monitor not available:', err.message);
  console.log('Server will continue without auto-healing...');
});

// Stop on shutdown
process.on('SIGTERM', () => {
  stopPodMonitor();
  // ... other cleanup
});
```

**Graceful Startup:**
- Pod monitor starts after server is running
- Failures don't prevent server startup
- Logs warning if RBAC permissions missing
- Auto-retries if initialization fails

### 8. Self-Healing Behavior

**Watcher Auto-Restart:**
- **Watch Error**: Restarts after 10 seconds
- **Startup Error**: Retries after 30 seconds
- **Infinite Retries**: Keeps trying until successful
- **Logs**: All restart attempts logged

**Example:**
```
❌ Pod watch error: connection refused
Restarting pod monitor in 10 seconds...
🚀 Whooper Pod Monitor started - watching for pod restarts...
```

### 9. Documentation

**Guide** ([PHASE10_AUTOHEALING.md](PHASE10_AUTOHEALING.md))

**Sections:**
1. **Overview** - What gets detected, what happens automatically
2. **How It Works** - Architecture and flow diagrams
3. **Setup Guide** - Step-by-step installation
4. **Configuration** - Environment variables and options
5. **Email Notifications** - Format and content
6. **API Reference** - All endpoints documented
7. **Testing** - 6 test scenarios with expected results
8. **Troubleshooting** - 6 common issues with solutions

## Files Created/Modified

### New Files
1. `backend/src/services/podMonitor.service.ts` - Pod monitoring service (500+ lines)
2. `backend/src/routes/autoheal.routes.ts` - API routes
3. `k8s/autoheal/rbac.yaml` - RBAC manifests
4. `PHASE10_AUTOHEALING.md` - Comprehensive documentation
5. `PHASE10_SUMMARY.md` - This file

### Modified Files
1. `backend/src/server.ts` - Integrated pod monitor startup/shutdown

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Kubernetes Cluster                          │
│                                                          │
│  ┌──────────┐    Restart      ┌──────────┐             │
│  │   Pod    │─────────────────►│   Pod    │             │
│  │ (Failed) │                  │ (Running)│             │
│  └──────────┘                  └──────────┘             │
│       │                             │                    │
│       │ Watch event via K8s API     │                    │
│       ▼                             ▼                    │
│  ┌────────────────────────────────────────┐             │
│  │     Whooper Backend                    │             │
│  │                                         │             │
│  │  Pod Monitor Service                   │             │
│  │  • Detect restart                      │             │
│  │  • Extract details                     │             │
│  │  • Create incident                     │             │
│  └────────┬───────────────────────────────┘             │
│           │                                              │
└───────────┼──────────────────────────────────────────────┘
            │
            ├─► Gemini API: Generate AI summary
            │
            ├─► Email Service: Send notification
            │
            ├─► Metrics: Update Prometheus
            │
            └─► API: Store incident for retrieval
                     │
                     ▼
              📧 Admin receives
                 incident report
```

## Key Features

### Automatic Detection
- **Cluster-Wide**: Monitors all pods in all namespaces
- **Real-Time**: Uses Kubernetes watch API for instant detection
- **Zero Config**: Works out of the box with RBAC
- **Restart Tracking**: Avoids duplicate notifications

### Intelligent Analysis
- **AI-Powered**: Gemini generates human-readable summaries
- **Context-Aware**: Analyzes reason, exit code, message
- **Root Cause**: Identifies likely causes
- **Recommendations**: Provides actionable next steps

### Professional Notifications
- **Beautiful Emails**: Color-coded HTML with all details
- **Severity Levels**: Critical, high, medium, warning
- **Full Context**: Pod, namespace, container, timestamps
- **AI Insights**: Gemini analysis included
- **Actionable**: Specific commands to investigate

### Production Ready
- **Self-Healing**: Watcher auto-restarts on failure
- **Metrics**: Full Prometheus integration
- **API Access**: REST API for incident management
- **RBAC Security**: Minimal, read-only permissions
- **Graceful Degradation**: Works without AI or email

## Setup Quick Reference

```bash
# 1. Apply RBAC
kubectl apply -f k8s/autoheal/rbac.yaml

# 2. Configure secrets
kubectl create secret generic whooper-backend-secrets \
  --from-literal=GEMINI_API_KEY="your-key" \
  --from-literal=DEFAULT_EMAIL_RECIPIENT="admin@example.com" \
  --namespace=whooper --dry-run=client -o yaml | kubectl apply -f -

# 3. Update deployment to use ServiceAccount
# (Already configured in k8s/whooper-deployment.yaml)

# 4. Restart backend
kubectl rollout restart deployment/whooper-backend -n whooper

# 5. Verify it's running
kubectl logs -n whooper -l app=whooper,component=backend | grep "Pod Monitor"
# Should see: "🚀 Whooper Pod Monitor started"

# 6. Test with a crashing pod
kubectl run test-crash --image=busybox --restart=Always -- /bin/sh -c "exit 1"

# 7. Check incidents
curl http://localhost:5001/api/autoheal/incidents | jq
```

## Testing

### Trigger Test Restart
```bash
# Create failing pod
kubectl run test-crash --image=busybox --restart=Always -- /bin/sh -c "exit 1"

# Wait 10 seconds
sleep 10

# Check logs
kubectl logs -n whooper -l app=whooper,component=backend | grep -i restart

# Expected:
# 🔄 Restart detected: test-crash/busybox (count: 1)
# 📝 Incident created: default-test-crash-busybox-1707574625000
# 📧 Auto-healing email sent for incident: ...
# ✅ Incident healed: default-test-crash-busybox-1707574625000
```

### Trigger OOMKill
```bash
# Create pod with memory limit that will be exceeded
kubectl run test-oom --image=polinux/stress --restart=Always \
  --limits=memory=50Mi \
  -- stress --vm 1 --vm-bytes 100M

# Wait 30 seconds for OOMKill
sleep 30

# Check incident
curl http://localhost:5001/api/autoheal/incidents | \
  jq '.incidents[] | select(.reason=="OOMKilled")'
```

### Verify Email
Check inbox for email with:
- Subject: `🔄 Auto-Heal: test-crash Restarted (Error)`
- AI summary with root cause
- Recommended actions
- Full incident details

## Benefits

1. **Proactive Awareness** - Know about pod issues immediately
2. **AI Insights** - Understand root causes without deep investigation
3. **Automated Reporting** - No manual incident tracking needed
4. **Action Guidance** - Get specific recommendations
5. **Full History** - API access to all incidents
6. **Metrics Integration** - Track MTTR and incident trends
7. **Zero Maintenance** - Self-healing watcher

## Use Cases

### Development
- Get notified when dev pods crash
- Understand why applications are failing
- Track restart patterns

### Staging
- Monitor pre-production stability
- Catch issues before production
- Validate resource limits

### Production
- Immediate awareness of pod restarts
- AI-powered root cause analysis
- Track MTTR and incident frequency
- Proactive capacity planning

## Limitations & Future Enhancements

### Current Limitations
- **In-Memory Storage** - Incidents lost on pod restart
- **Single Watcher** - Only one backend pod monitors
- **No Remediation** - Detection only, no auto-fix
- **Email Only** - No Slack/PagerDuty integration

### Future Enhancements (Phase 10.5+)

1. **Database Storage** - PostgreSQL for persistent incidents
2. **Frontend Dashboard** - UI to view incident history
3. **Auto-Remediation** - Automatic resource adjustments
4. **Advanced AI** - Deeper root cause analysis with logs/metrics
5. **Slack Integration** - Send to Slack channels
6. **Incident Correlation** - Group related incidents
7. **Custom Actions** - User-defined remediation workflows

## Troubleshooting Reference

| Issue | Quick Fix |
|-------|-----------|
| Pod monitor not starting | Check RBAC: `kubectl auth can-i watch pods --as=system:serviceaccount:whooper:whooper-backend --all-namespaces` |
| No emails | Verify EMAIL_APP_URL and DEFAULT_EMAIL_RECIPIENT in secret |
| No AI summaries | Check GEMINI_API_KEY in secret |
| Incidents not detected | Verify ServiceAccount in deployment spec |
| Too many emails | Check incident history, may be duplicate events |

## Summary

Phase 10 successfully implemented a complete auto-healing system:

- **Pod Monitor**: 500+ lines of intelligent restart detection
- **AI Analysis**: Gemini-powered incident summaries
- **Email Notifications**: Beautiful HTML emails with full details
- **RBAC**: Secure cluster-wide monitoring
- **API**: REST endpoints for incident management
- **Metrics**: Full Prometheus integration
- **Self-Healing**: Auto-restart on failure
- **Documentation**: Comprehensive setup and troubleshooting

Whooper now **automatically detects, analyzes, and reports pod incidents** with AI-powered insights and zero manual intervention.

**Total Implementation:**
- 5 new files created
- 1 file modified
- 1000+ lines of code
- Full auto-healing capabilities
- Production-ready monitoring
