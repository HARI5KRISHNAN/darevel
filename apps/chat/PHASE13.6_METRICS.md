# Phase 13.6: Live CPU & Memory Metrics Integration

## Overview

Phase 13.6 enhances the Whooper Pod Dashboard with **real-time CPU and memory usage** metrics for all running pods. The system now displays live resource consumption data that updates every 10 seconds, giving you instant visibility into cluster resource utilization.

## What Was Implemented

### 1. Pod Metrics Service

**Service File**: [backend/src/services/podMetrics.service.ts](backend/src/services/podMetrics.service.ts)

**Core Capabilities:**
- Fetches metrics from Kubernetes Metrics Server API
- Parses CPU usage (millicores, cores, nanocores)
- Parses Memory usage (KiB, MiB, GiB, TiB)
- Formats metrics for human-readable display
- Graceful fallback when Metrics Server unavailable

**Key Functions:**

```typescript
fetchPodMetrics(): Promise<PodMetricsMap>
// Fetches all pod metrics from Kubernetes Metrics Server
// Returns: Map of "namespace/podName" -> { cpu, memory }

parseCpu(cpuString: string): number
// Converts CPU strings to millicores
// Examples: "250m" -> 250, "1.5" -> 1500, "500n" -> 0

parseMemory(memoryString: string): number
// Converts memory strings to MiB
// Examples: "256Mi" -> 256, "1Gi" -> 1024, "512Ki" -> 0.5

formatCpu(millicores: number): string
// Formats millicores for display
// Examples: 150 -> "150m", 1250 -> "1.25"

formatMemory(mib: number): string
// Formats MiB for display
// Examples: 256 -> "256Mi", 1536 -> "1.5Gi"

isMetricsServerAvailable(): Promise<boolean>
// Checks if Metrics Server is accessible
```

**CPU Parsing Examples:**
```typescript
parseCpu("250m")   // 250 millicores
parseCpu("1")      // 1000 millicores (1 core)
parseCpu("0.5")    // 500 millicores
parseCpu("1500n")  // 0 millicores (nanocores rounded down)
```

**Memory Parsing Examples:**
```typescript
parseMemory("256Mi")  // 256 MiB
parseMemory("1Gi")    // 1024 MiB
parseMemory("512Ki")  // 0.5 MiB
parseMemory("1.5Gi")  // 1536 MiB
```

### 2. K8s Service Integration

**Modified File**: [backend/src/services/k8s.service.ts](backend/src/services/k8s.service.ts)

**Changes:**

1. **Import Metrics Service:**
```typescript
import { fetchPodMetrics, PodMetricsMap, parseCpu, parseMemory } from './podMetrics.service';

let metricsCache: PodMetricsMap = {};
let metricsInterval: NodeJS.Timeout | null = null;
let socketIO: Server | null = null;
```

2. **Updated `transformK8sPod()` Function:**
```typescript
function transformK8sPod(v1Pod: V1Pod): Pod {
  // ... existing code ...

  // Get CPU and Memory usage from metrics cache
  let cpuUsage: number | null = null;
  let memoryUsage: number | null = null;

  const metricsKey = `${namespace}/${podName}`;
  const metrics = metricsCache[metricsKey];

  if (metrics) {
    cpuUsage = parseCpu(metrics.cpu);
    memoryUsage = parseMemory(metrics.memory);
  }

  return {
    id: `${namespace}/${podName}`,
    name: podName,
    namespace,
    status: status as any,
    age,
    restarts,
    cpuUsage,      // Now from Metrics Server
    memoryUsage,   // Now from Metrics Server
  };
}
```

3. **New `updateMetricsCache()` Function:**
```typescript
async function updateMetricsCache(): Promise<void> {
  try {
    // Fetch latest metrics from Kubernetes Metrics Server
    metricsCache = await fetchPodMetrics();

    // Re-transform all pods with updated metrics
    const kc = new k8s.KubeConfig();
    kc.loadFromCluster();
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    const podResponse = await k8sApi.listPodForAllNamespaces();
    allPods = (podResponse.body.items || []).map(transformK8sPod);

    // Broadcast updated pod list to all clients
    if (socketIO) {
      socketIO.emit('pods_update', allPods);
      console.log(`📊 Broadcasted metrics update for ${allPods.length} pods`);
    }
  } catch (error: any) {
    console.warn('Failed to update metrics cache:', error.message);
  }
}
```

4. **Enhanced `startWatchingPods()` Function:**
```typescript
export async function startWatchingPods(io: Server): Promise<void> {
  try {
    socketIO = io;

    // ... existing setup ...

    // Fetch initial metrics
    console.log('Fetching initial pod metrics...');
    metricsCache = await fetchPodMetrics();

    // List all pods initially
    console.log('Fetching initial pod list...');
    const podResponse = await k8sApi.listPodForAllNamespaces();
    allPods = (podResponse.body.items || []).map(transformK8sPod);
    console.log(`Found ${allPods.length} pods`);

    // Start periodic metrics updates (every 10 seconds)
    metricsInterval = setInterval(() => {
      updateMetricsCache();
    }, 10000);

    console.log('✓ Metrics auto-refresh enabled (every 10 seconds)');

    // ... existing watch setup ...
  } catch (error) {
    console.error('Failed to start watching pods:', error);
    throw error;
  }
}
```

5. **Updated `stopWatchingPods()` Function:**
```typescript
export function stopWatchingPods(): void {
  // Stop metrics interval
  if (metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = null;
    console.log('Stopped metrics auto-refresh');
  }

  // Watch cleanup is handled automatically by the Kubernetes client
  console.log('Stopping pod watch');
}
```

### 3. Frontend Hook Update

**Modified File**: [hooks/useRealTimeK8s.ts](hooks/useRealTimeK8s.ts)

**Changes:**

Added listener for full pod list updates with metrics:

```typescript
// Receive full pod list updates (includes metrics every 10 seconds)
socket.on('pods_update', (updatedPods: Pod[]) => {
  console.log(`📊 Received metrics update for ${updatedPods.length} pods`);
  setPods(updatedPods);
  setLastUpdate(new Date());
});
```

**Socket.IO Events:**
- `initial_pods`: Initial pod list on connection
- `pod_update`: Individual pod changes (ADDED, MODIFIED, DELETED)
- `pods_update`: **NEW** - Full pod list with updated metrics every 10s

### 4. PodDashboard Component Updates

**Modified File**: [components/PodDashboard.tsx](components/PodDashboard.tsx)

**Changes:**

1. **New Formatting Functions:**
```typescript
const formatCpu = (millicores: number) => {
  if (millicores < 1000) {
    return `${millicores}m`;
  } else {
    return `${(millicores / 1000).toFixed(2)}`;
  }
};

const formatMemory = (mib: number) => {
  if (mib < 1024) {
    return `${mib}Mi`;
  } else {
    return `${(mib / 1024).toFixed(2)}Gi`;
  }
};
```

2. **Updated Display:**
```tsx
{pod.cpuUsage !== null && (
  <div>
    <span className="text-text-secondary">CPU:</span>
    <span className="ml-2 text-text-primary font-medium">
      {formatCpu(pod.cpuUsage)}
    </span>
  </div>
)}

{pod.memoryUsage !== null && (
  <div>
    <span className="text-text-secondary">Memory:</span>
    <span className="ml-2 text-text-primary font-medium">
      {formatMemory(pod.memoryUsage)}
    </span>
  </div>
)}
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Kubernetes Cluster                          │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │       Metrics Server                      │           │
│  │  (Aggregates kubelet metrics)            │           │
│  └────────────┬─────────────────────────────┘           │
│               │                                          │
│               │ metrics.k8s.io/v1beta1 API              │
│               ▼                                          │
│  ┌────────────────────────────────────────┐             │
│  │     Whooper Backend                    │             │
│  │                                         │             │
│  │  1. fetchPodMetrics()                  │             │
│  │     └─► Fetch CPU/Memory               │             │
│  │                                         │             │
│  │  2. updateMetricsCache() [Every 10s]   │             │
│  │     ├─► Update cache                   │             │
│  │     ├─► Re-transform pods              │             │
│  │     └─► Emit 'pods_update'             │             │
│  │                                         │             │
│  │  3. transformK8sPod()                  │             │
│  │     └─► Attach metrics from cache      │             │
│  └────────┬───────────────────────────────┘             │
│           │                                              │
└───────────┼──────────────────────────────────────────────┘
            │
            │ Socket.IO (pods_update event)
            ▼
   ┌─────────────────────────┐
   │   Frontend (React)      │
   │                         │
   │  useRealTimeK8s Hook    │
   │  ├─► Listen to events   │
   │  └─► Update pod state   │
   │                         │
   │  PodDashboard Component │
   │  └─► Display metrics    │
   └─────────────────────────┘
```

## Data Flow

### Initial Connection
1. Frontend connects to Socket.IO
2. Backend fetches initial metrics from Metrics Server
3. Backend transforms pods with metrics
4. Backend emits `initial_pods` event
5. Frontend displays pods with CPU/Memory

### Periodic Updates (Every 10 seconds)
1. `setInterval` triggers `updateMetricsCache()`
2. Backend fetches latest metrics
3. Backend re-transforms all pods
4. Backend emits `pods_update` with full pod list
5. Frontend receives update
6. Dashboard re-renders with new metrics

### Real-Time Pod Events
1. Kubernetes emits pod event (ADDED/MODIFIED/DELETED)
2. Backend transforms pod with current metrics from cache
3. Backend emits `pod_update` event
4. Frontend processes individual update
5. Dashboard reflects change immediately

## Prerequisites

### Metrics Server Installation

The Metrics Server must be installed in your Kubernetes cluster:

```bash
# Check if Metrics Server is available
kubectl get apiservices | grep metrics

# If not installed, deploy it
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify deployment
kubectl get deployment metrics-server -n kube-system

# Wait for it to be ready
kubectl wait --for=condition=available --timeout=60s deployment/metrics-server -n kube-system

# Test metrics API
kubectl top nodes
kubectl top pods -A
```

**Metrics Server Issues:**

If using **Minikube** or **kind**:
```bash
# Metrics Server requires additional flags for local clusters
kubectl edit deployment metrics-server -n kube-system

# Add these flags to the container args:
# - --kubelet-insecure-tls
# - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
```

If using **Docker Desktop Kubernetes**:
```bash
# Metrics Server should work out of the box
# If not, reinstall with:
kubectl delete -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### RBAC Permissions

Your backend ServiceAccount needs permission to read metrics:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: whooper-metrics-reader
rules:
  # Read pod metrics
  - apiGroups: ["metrics.k8s.io"]
    resources: ["pods"]
    verbs: ["get", "list"]

  # Read node metrics (optional)
  - apiGroups: ["metrics.k8s.io"]
    resources: ["nodes"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: whooper-metrics-reader-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: whooper-metrics-reader
subjects:
  - kind: ServiceAccount
    name: whooper-backend
    namespace: whooper
```

Apply with:
```bash
kubectl apply -f k8s/metrics-rbac.yaml
```

## Setup Guide

### 1. Install Metrics Server

```bash
# Deploy Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify installation
kubectl get pods -n kube-system | grep metrics-server

# Expected output:
# metrics-server-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
```

### 2. Apply RBAC Permissions

Create `k8s/metrics-rbac.yaml` with the RBAC configuration above, then:

```bash
kubectl apply -f k8s/metrics-rbac.yaml
```

### 3. Verify Metrics Access

Test that metrics are accessible:

```bash
# Test from your local machine
kubectl top pods -A

# Test from the cluster (using whooper-backend ServiceAccount)
kubectl auth can-i get pods --as=system:serviceaccount:whooper:whooper-backend \
  --namespace=default --subresource=metrics

# Should output: yes
```

### 4. Restart Whooper Backend

```bash
# Restart to pick up new code
kubectl rollout restart deployment/whooper-backend -n whooper

# Watch logs
kubectl logs -n whooper -l app=whooper,component=backend -f

# Expected logs:
# Fetching initial pod metrics...
# 📊 Fetched metrics for 15 pods
# Found 15 pods
# ✓ Metrics auto-refresh enabled (every 10 seconds)
# ✓ Kubernetes watch established
```

### 5. Verify Frontend

Open your frontend and navigate to the Pod Dashboard. You should see:
- CPU column with values like "150m", "1.25", "500m"
- Memory column with values like "256Mi", "1.5Gi", "512Mi"
- Metrics updating every 10 seconds

## Metrics Display Format

### CPU Display

| Millicores | Display |
|-----------|---------|
| 50        | 50m     |
| 250       | 250m    |
| 500       | 500m    |
| 1000      | 1.00    |
| 1250      | 1.25    |
| 2500      | 2.50    |

- **< 1000m**: Shows millicores (e.g., "150m")
- **≥ 1000m**: Shows cores (e.g., "1.25" = 1.25 cores)

### Memory Display

| MiB   | Display |
|-------|---------|
| 64    | 64Mi    |
| 256   | 256Mi   |
| 512   | 512Mi   |
| 1024  | 1.00Gi  |
| 1536  | 1.50Gi  |
| 2048  | 2.00Gi  |

- **< 1024 MiB**: Shows MiB (e.g., "256Mi")
- **≥ 1024 MiB**: Shows GiB (e.g., "1.50Gi")

## Testing

### Test 1: Verify Metrics Fetching

```bash
# Check backend logs for metrics fetching
kubectl logs -n whooper -l app=whooper,component=backend --tail=50 | grep -i metrics

# Expected output every 10 seconds:
# 📊 Fetched metrics for 15 pods
# 📊 Broadcasted metrics update for 15 pods
```

### Test 2: Compare with kubectl

```bash
# Get metrics from kubectl
kubectl top pods -A

# Example output:
# NAMESPACE     NAME                          CPU(cores)   MEMORY(bytes)
# default       nginx-7b8c9d-xyz              150m         256Mi
# kube-system   coredns-xxxxxxxxxx-xxxxx      10m          64Mi

# Open Whooper dashboard and verify same values appear
```

### Test 3: Load Test

Create a pod that consumes CPU:

```bash
# Create CPU-intensive pod
kubectl run stress-test --image=polinux/stress \
  --restart=Never \
  -- stress --cpu 2 --timeout 60s

# Watch metrics update in real-time
kubectl top pod stress-test --watch

# Check Whooper dashboard - should show increasing CPU usage
```

### Test 4: Memory Test

Create a pod that consumes memory:

```bash
# Create memory-intensive pod
kubectl run memory-test --image=polinux/stress \
  --restart=Never \
  --limits=memory=512Mi \
  -- stress --vm 1 --vm-bytes 300M --timeout 60s

# Watch metrics
kubectl top pod memory-test --watch

# Check Whooper dashboard - should show ~300Mi memory usage
```

## Troubleshooting

### Issue 1: No Metrics Displayed

**Symptoms:**
- CPU and Memory columns show "null" or don't appear
- Backend logs show: "Failed to fetch pod metrics"

**Solution:**
```bash
# Check if Metrics Server is running
kubectl get pods -n kube-system | grep metrics-server

# If not running, install it
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Check Metrics Server logs
kubectl logs -n kube-system -l k8s-app=metrics-server

# Verify metrics API is available
kubectl get apiservices | grep metrics
# Should show: v1beta1.metrics.k8s.io
```

### Issue 2: Metrics Server CrashLooping

**Symptoms:**
- `kubectl get pods -n kube-system` shows metrics-server in CrashLoopBackOff

**Solution:**
```bash
# Check logs
kubectl logs -n kube-system -l k8s-app=metrics-server

# If you see TLS errors, add insecure flag
kubectl edit deployment metrics-server -n kube-system

# Add to container args:
# - --kubelet-insecure-tls
# - --kubelet-preferred-address-types=InternalIP

# Save and wait for rollout
kubectl rollout status deployment metrics-server -n kube-system
```

### Issue 3: RBAC Permission Denied

**Symptoms:**
- Backend logs show: "pods.metrics.k8s.io is forbidden"

**Solution:**
```bash
# Check if RBAC is applied
kubectl get clusterrole whooper-metrics-reader
kubectl get clusterrolebinding whooper-metrics-reader-binding

# If not, apply RBAC
kubectl apply -f k8s/metrics-rbac.yaml

# Verify permissions
kubectl auth can-i get pods --as=system:serviceaccount:whooper:whooper-backend \
  --subresource=metrics
# Should output: yes

# Restart backend
kubectl rollout restart deployment/whooper-backend -n whooper
```

### Issue 4: Metrics Not Updating

**Symptoms:**
- Metrics displayed but never change
- No "📊 Broadcasted metrics update" logs

**Solution:**
```bash
# Check backend logs for interval errors
kubectl logs -n whooper -l app=whooper,component=backend | grep -i "metrics"

# If interval is not starting, check if startWatchingPods() completed
kubectl logs -n whooper -l app=whooper,component=backend | grep "Metrics auto-refresh"

# Should see: "✓ Metrics auto-refresh enabled (every 10 seconds)"

# If not, restart backend
kubectl rollout restart deployment/whooper-backend -n whooper
```

### Issue 5: Wrong Values Displayed

**Symptoms:**
- Metrics shown don't match `kubectl top pods`

**Solution:**
```bash
# Get raw metrics from API
kubectl get --raw /apis/metrics.k8s.io/v1beta1/pods | jq

# Compare with what Whooper shows
# Check parsing logic in podMetrics.service.ts

# Common issues:
# - Unit conversion error (millicores vs cores)
# - Memory parsing (KiB vs MiB)
# - Rounding differences
```

### Issue 6: Metrics Lag

**Symptoms:**
- Metrics update slower than 10 seconds
- Frontend doesn't receive updates

**Solution:**
```bash
# Check Socket.IO connection
# Open browser console, should see:
# 📊 Received metrics update for X pods

# If not, check Socket.IO connection:
# ✓ Connected to Kubernetes backend

# Check backend is emitting:
kubectl logs -n whooper -l app=whooper,component=backend | grep "Broadcasted"

# Should see every 10 seconds:
# 📊 Broadcasted metrics update for X pods
```

## Performance Considerations

### Metrics API Load

- Fetching metrics for all pods every 10 seconds can be intensive
- Metrics Server caches metrics for ~15 seconds by default
- Consider increasing interval for large clusters (1000+ pods)

**Adjust Interval:**
```typescript
// In k8s.service.ts, line ~110
metricsInterval = setInterval(() => {
  updateMetricsCache();
}, 30000); // Change from 10000 to 30000 (30 seconds)
```

### Socket.IO Bandwidth

- Broadcasting full pod list every 10s can use bandwidth
- Each pod object is ~200 bytes
- 100 pods = ~20 KB per update
- 1000 pods = ~200 KB per update

**Optimization Options:**
1. **Increase interval** (30s or 60s)
2. **Send deltas only** (only pods with changed metrics)
3. **Compress payloads** (use gzip compression)

### Frontend Re-rendering

- Full pod list update triggers full component re-render
- Use React.memo() for pod cards
- Consider virtualization for 1000+ pods

**Example Optimization:**
```typescript
// In PodDashboard.tsx
const PodCard = React.memo(({ pod }: { pod: Pod }) => {
  // ... pod card JSX
});

// In render:
{filteredPods.map(pod => (
  <PodCard key={pod.id} pod={pod} />
))}
```

## Benefits

1. **Real-Time Visibility**: See actual resource consumption, not just requests/limits
2. **Capacity Planning**: Identify over/under-provisioned pods
3. **Performance Monitoring**: Track CPU and memory trends
4. **Cost Optimization**: Right-size deployments based on actual usage
5. **Troubleshooting**: Quickly identify resource-constrained pods
6. **Automatic Updates**: No manual refresh needed

## Limitations

### Current Limitations

1. **Metrics Server Required**: Won't work without Metrics Server installed
2. **Cluster-Wide Only**: No per-node or per-namespace filtering
3. **No Historical Data**: Only current metrics, no time-series
4. **Basic Aggregation**: Sum of all containers in multi-container pods
5. **10s Update Interval**: Fixed interval, not configurable from UI

### Future Enhancements (Phase 13.7+)

1. **Prometheus Integration**: Historical metrics and graphs
2. **Configurable Intervals**: User-adjustable update frequency
3. **Metric Alerts**: CPU/Memory threshold alerts
4. **Trend Charts**: Mini sparklines for each pod
5. **Resource Recommendations**: AI-powered right-sizing suggestions
6. **Custom Metrics**: Support for custom application metrics
7. **Multi-Container Breakdown**: Show per-container metrics
8. **Resource Quotas**: Display namespace quotas vs usage

## Summary

Phase 13.6 successfully integrated live CPU and memory metrics into the Whooper Pod Dashboard:

- **Pod Metrics Service**: Fetches and parses Kubernetes Metrics Server data
- **K8s Service Updates**: Periodic metrics cache refresh every 10 seconds
- **Socket.IO Streaming**: Broadcasts full pod list with metrics to all clients
- **Frontend Display**: Formatted CPU (millicores) and Memory (MiB/GiB) values
- **Real-Time Updates**: Automatic refresh without page reload
- **Graceful Degradation**: Works without Metrics Server (shows null)

**Total Implementation:**
- 1 new file created (podMetrics.service.ts)
- 3 files modified (k8s.service.ts, useRealTimeK8s.ts, PodDashboard.tsx)
- ~500 lines of code
- Full metrics integration with 10-second auto-refresh

Whooper now displays **live resource consumption** for all pods with zero manual intervention!
