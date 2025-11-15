# Phase 13.6: Live CPU & Memory Metrics - Implementation Summary

## Overview

Phase 13.6 adds **real-time CPU and memory usage metrics** to the Whooper Pod Dashboard, displaying live resource consumption data that updates automatically every 10 seconds.

## What Was Implemented

### 1. Pod Metrics Service
**File**: [backend/src/services/podMetrics.service.ts](backend/src/services/podMetrics.service.ts)

- Fetches metrics from Kubernetes Metrics Server API
- Parses CPU (millicores, cores, nanocores)
- Parses Memory (KiB, MiB, GiB, TiB)
- Formats values for human-readable display
- Graceful fallback when Metrics Server unavailable

**Key Functions:**
```typescript
fetchPodMetrics()              // Fetch all pod metrics
parseCpu(cpuString)            // Convert "250m" -> 250
parseMemory(memoryString)      // Convert "256Mi" -> 256
formatCpu(millicores)          // Format 250 -> "250m"
formatMemory(mib)              // Format 256 -> "256Mi"
isMetricsServerAvailable()     // Check if accessible
```

### 2. K8s Service Updates
**File**: [backend/src/services/k8s.service.ts](backend/src/services/k8s.service.ts)

**Changes:**
- Added metrics cache: `let metricsCache: PodMetricsMap = {}`
- Added metrics interval: `let metricsInterval: NodeJS.Timeout | null = null`
- Updated `transformK8sPod()` to use metrics from cache
- New `updateMetricsCache()` function for periodic updates
- Modified `startWatchingPods()` to fetch initial metrics and start interval
- Updated `stopWatchingPods()` to cleanup interval

**Flow:**
1. On startup: Fetch initial metrics from Metrics Server
2. Every 10s: Re-fetch metrics, update cache, broadcast to clients
3. On pod events: Transform pods with current metrics from cache
4. On shutdown: Clear interval

### 3. Frontend Hook Update
**File**: [hooks/useRealTimeK8s.ts](hooks/useRealTimeK8s.ts)

**Changes:**
- Added listener for `pods_update` event
- Receives full pod list with updated metrics every 10s
- Updates state and last update timestamp

**Socket.IO Events:**
- `initial_pods`: Initial pod list on connection
- `pod_update`: Individual pod changes (ADDED, MODIFIED, DELETED)
- `pods_update`: **NEW** - Full pod list with metrics every 10s

### 4. PodDashboard Component
**File**: [components/PodDashboard.tsx](components/PodDashboard.tsx)

**Changes:**
- Added `formatCpu()` function for millicores display
- Added `formatMemory()` function for MiB/GiB display
- Updated CPU display: `{formatCpu(pod.cpuUsage)}`
- Updated Memory display: `{formatMemory(pod.memoryUsage)}`

**Display Format:**
- CPU: "150m", "250m", "1.25" (cores)
- Memory: "256Mi", "1.5Gi"

## Architecture

```
Kubernetes Cluster
  │
  ├─► Metrics Server
  │   └─► Aggregates kubelet metrics
  │
  ├─► Whooper Backend
  │   ├─► fetchPodMetrics() [Initial + Every 10s]
  │   ├─► updateMetricsCache()
  │   ├─► transformK8sPod() with metrics
  │   └─► Socket.IO emit('pods_update')
  │
  └─► Frontend
      ├─► useRealTimeK8s hook
      ├─► Listen to 'pods_update'
      └─► PodDashboard displays metrics
```

## Data Flow

### Initial Load
1. Backend fetches metrics from Metrics Server
2. Backend transforms pods with metrics
3. Backend emits `initial_pods` to connected clients
4. Frontend displays pods with CPU/Memory

### Periodic Updates (Every 10s)
1. `setInterval` triggers `updateMetricsCache()`
2. Backend fetches latest metrics
3. Backend re-transforms all pods
4. Backend emits `pods_update` with full list
5. Frontend updates and re-renders

### Real-Time Events
1. Kubernetes emits pod event (ADDED/MODIFIED/DELETED)
2. Backend transforms pod with current metrics from cache
3. Backend emits `pod_update` for individual change
4. Frontend processes update

## Files Created/Modified

### New Files
1. `backend/src/services/podMetrics.service.ts` - Metrics fetching and parsing (~200 lines)
2. `PHASE13.6_METRICS.md` - Comprehensive documentation
3. `PHASE13.6_SUMMARY.md` - This file

### Modified Files
1. `backend/src/services/k8s.service.ts` - Integrated metrics cache and periodic updates
2. `hooks/useRealTimeK8s.ts` - Added `pods_update` event listener
3. `components/PodDashboard.tsx` - Added metric formatting functions

## Prerequisites

### 1. Metrics Server Installation
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 2. RBAC Permissions
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: whooper-metrics-reader
rules:
  - apiGroups: ["metrics.k8s.io"]
    resources: ["pods"]
    verbs: ["get", "list"]
```

### 3. Verification
```bash
# Check Metrics Server
kubectl get pods -n kube-system | grep metrics-server

# Test metrics access
kubectl top pods -A

# Verify RBAC
kubectl auth can-i get pods --as=system:serviceaccount:whooper:whooper-backend --subresource=metrics
```

## Setup Quick Reference

```bash
# 1. Install Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 2. Apply RBAC
kubectl apply -f k8s/metrics-rbac.yaml

# 3. Restart backend
kubectl rollout restart deployment/whooper-backend -n whooper

# 4. Check logs
kubectl logs -n whooper -l app=whooper,component=backend -f

# Expected:
# Fetching initial pod metrics...
# 📊 Fetched metrics for 15 pods
# ✓ Metrics auto-refresh enabled (every 10 seconds)
# 📊 Broadcasted metrics update for 15 pods

# 5. Test metrics
kubectl top pods -A

# 6. Open Whooper dashboard
# Navigate to Pod Dashboard
# Verify CPU and Memory columns show values
```

## Metrics Display

### CPU Format
| Millicores | Display |
|-----------|---------|
| 50        | 50m     |
| 250       | 250m    |
| 1000      | 1.00    |
| 1250      | 1.25    |

### Memory Format
| MiB   | Display |
|-------|---------|
| 256   | 256Mi   |
| 512   | 512Mi   |
| 1024  | 1.00Gi  |
| 1536  | 1.50Gi  |

## Testing

### Test 1: Verify Fetching
```bash
kubectl logs -n whooper -l app=whooper,component=backend --tail=50 | grep metrics

# Expected every 10s:
# 📊 Fetched metrics for X pods
# 📊 Broadcasted metrics update for X pods
```

### Test 2: Compare with kubectl
```bash
kubectl top pods -A

# Compare values with Whooper dashboard
```

### Test 3: CPU Load Test
```bash
kubectl run stress-test --image=polinux/stress --restart=Never -- stress --cpu 2 --timeout 60s

# Watch Whooper dashboard - should show increasing CPU
```

### Test 4: Memory Load Test
```bash
kubectl run memory-test --image=polinux/stress --restart=Never --limits=memory=512Mi -- stress --vm 1 --vm-bytes 300M --timeout 60s

# Watch Whooper dashboard - should show ~300Mi
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No metrics displayed | Install Metrics Server: `kubectl apply -f https://...` |
| Metrics Server crash | Add `--kubelet-insecure-tls` flag |
| Permission denied | Apply RBAC: `kubectl apply -f k8s/metrics-rbac.yaml` |
| Metrics not updating | Check logs for interval errors, restart backend |
| Wrong values | Compare with `kubectl top pods`, check parsing logic |
| Metrics lag | Check Socket.IO connection in browser console |

## Performance

### Metrics API Load
- Fetches all pods every 10 seconds
- Metrics Server caches for ~15 seconds
- For 100 pods: ~20 KB per update
- For 1000 pods: ~200 KB per update

### Optimization Options
1. Increase interval to 30s or 60s
2. Send only changed metrics (deltas)
3. Use compression for Socket.IO
4. Implement virtual scrolling for 1000+ pods

## Key Features

1. **Real-Time Updates**: Metrics refresh every 10 seconds automatically
2. **Human-Readable Format**: "150m", "256Mi" instead of raw numbers
3. **Graceful Degradation**: Works without Metrics Server (shows null)
4. **Zero Config**: Auto-detects Metrics Server availability
5. **Efficient Caching**: Fetches once, broadcasts to all clients
6. **Socket.IO Streaming**: Instant updates without polling

## Benefits

1. **Real-Time Visibility**: See actual resource consumption
2. **Capacity Planning**: Identify over/under-provisioned pods
3. **Performance Monitoring**: Track CPU and memory trends
4. **Cost Optimization**: Right-size deployments
5. **Troubleshooting**: Quickly find resource-constrained pods
6. **Automatic**: No manual refresh needed

## Limitations

### Current
- Requires Metrics Server
- No historical data
- Fixed 10s interval
- Sum of containers in multi-container pods

### Future Enhancements (Phase 13.7+)
- Prometheus integration for history
- Configurable update intervals
- Metric threshold alerts
- Trend charts (sparklines)
- AI-powered right-sizing recommendations
- Per-container breakdown
- Resource quota tracking

## Summary

Phase 13.6 successfully added live CPU and memory metrics to Whooper:

- **Pod Metrics Service**: Fetches and parses Metrics Server data
- **Periodic Updates**: Auto-refresh every 10 seconds
- **Socket.IO Streaming**: Broadcasts to all clients
- **Formatted Display**: Human-readable CPU/Memory values
- **Graceful Fallback**: Works without Metrics Server

**Total Implementation:**
- 1 new file created
- 3 files modified
- ~500 lines of code
- Full metrics integration

Whooper now displays **live resource consumption** for all pods automatically!
