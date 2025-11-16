
import { V1Pod, Watch } from '@kubernetes/client-node';
import * as k8s from '@kubernetes/client-node';
import { Pod, PodUpdateEvent } from '../types';
import { Server } from 'socket.io';
import { processPodForAlerts } from './alert.service';
import { fetchPodMetrics, PodMetricsMap, parseCpu, parseMemory } from './podMetrics.service';

let allPods: Pod[] = [];
let watch: Watch;
let metricsCache: PodMetricsMap = {};
let metricsInterval: NodeJS.Timeout | null = null;
let socketIO: Server | null = null;

/**
 * Transform Kubernetes V1Pod object into our simplified Pod type
 */
function transformK8sPod(v1Pod: V1Pod): Pod {
  const podName = v1Pod.metadata?.name || 'unknown';
  const namespace = v1Pod.metadata?.namespace || 'default';
  const status = v1Pod.status?.phase || 'Unknown';

  // Calculate pod age in seconds
  const creationTime = v1Pod.metadata?.creationTimestamp;
  const age = creationTime
    ? Math.floor((Date.now() - new Date(creationTime).getTime()) / 1000)
    : 0;

  // Count restarts
  const restarts = v1Pod.status?.containerStatuses?.reduce(
    (sum, cs) => sum + (cs.restartCount || 0),
    0
  ) || 0;

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
    cpuUsage,
    memoryUsage,
  };
}

/**
 * Update metrics cache and broadcast to clients
 */
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

/**
 * Initialize Kubernetes watcher and emit updates to Socket.IO clients
 */
export async function startWatchingPods(io: Server): Promise<void> {
  try {
    socketIO = io;

    const kc = new k8s.KubeConfig();

    // Load configuration from the cluster (ServiceAccount)
    kc.loadFromCluster();

    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

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

    // Setup watch for pod changes
    watch = new Watch(kc);

    await watch.watch(
      '/api/v1/pods', // Watch all pods across all namespaces
      {},
      (type: string, obj: V1Pod) => {
        const transformedPod = transformK8sPod(obj);

        // Determine the event type
        if (type === 'ADDED') {
          allPods.push(transformedPod);
        } else if (type === 'MODIFIED') {
          allPods = allPods.map(p =>
            p.id === transformedPod.id ? transformedPod : p
          );
        } else if (type === 'DELETED') {
          allPods = allPods.filter(p => p.id !== transformedPod.id);
        }

        // Broadcast update to all connected clients
        const event: PodUpdateEvent = { type: type as any, object: transformedPod };
        io.emit('pod_update', event);

        // Check for alerts on MODIFIED and ADDED events
        if (type === 'MODIFIED' || type === 'ADDED') {
          processPodForAlerts(transformedPod, io, {
            emailAppUrl: process.env.EMAIL_APP_URL,
            alertEmail: process.env.ALERT_EMAIL,
            backendUrl: process.env.BACKEND_URL || 'http://localhost:5001'
          }).catch(err => {
            console.error('Error processing alert:', err.message);
          });
        }

        console.log(`Pod Event [${type}]: ${transformedPod.name}`);
      },
      (err) => {
        if (err) {
          console.error('Watch error:', err);
          // Attempt to reconnect after a delay
          setTimeout(() => startWatchingPods(io), 5000);
        } else {
          console.log('Watch closed');
        }
      }
    );

    console.log('✓ Kubernetes watch established');
  } catch (error: any) {
    // Check if this is a K8s unavailable error
    if (error.code === 'ENOENT' || error.message?.includes('ENOENT') || error.message?.includes('serviceaccount')) {
      console.log('⚠️  Kubernetes not available - pod watching disabled');
      console.log('💡 Server will continue without Kubernetes integration');
      return; // Don't throw, just return gracefully
    }

    console.error('Failed to start watching pods:', error.message);
    console.log('Kubernetes watcher not available:', error.message);
    console.log('Server will continue without Kubernetes integration...');
    // Don't throw - allow server to continue
  }
}

/**
 * Get current list of all pods
 */
export function getPods(): Pod[] {
  return allPods;
}

/**
 * Stop watching pod changes
 */
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
