/**
 * Pod Metrics Service
 *
 * Fetches real-time CPU and memory usage from Kubernetes Metrics Server
 *
 * Flow:
 * 1. Connects to Kubernetes Metrics API
 * 2. Fetches pod metrics for all namespaces
 * 3. Parses CPU (millicores) and Memory (bytes)
 * 4. Returns usage map indexed by namespace/podName
 */

import * as k8s from '@kubernetes/client-node';

export interface PodMetrics {
  cpu: string;      // e.g., "150m" (millicores)
  memory: string;   // e.g., "256Mi" (mebibytes)
}

export interface PodMetricsMap {
  [key: string]: PodMetrics; // key format: "namespace/podName"
}

/**
 * Parse CPU string to numeric value in millicores
 * Examples: "250m" -> 250, "1" -> 1000, "0.5" -> 500
 */
export function parseCpu(cpuString: string): number {
  if (!cpuString) return 0;

  if (cpuString.endsWith('m')) {
    // Already in millicores
    return parseInt(cpuString.replace('m', ''), 10);
  } else if (cpuString.endsWith('n')) {
    // Nanocores to millicores
    return Math.round(parseInt(cpuString.replace('n', ''), 10) / 1_000_000);
  } else {
    // CPU cores to millicores
    return Math.round(parseFloat(cpuString) * 1000);
  }
}

/**
 * Parse Memory string to numeric value in MiB
 * Examples: "256Mi" -> 256, "1Gi" -> 1024, "512Ki" -> 0.5
 */
export function parseMemory(memoryString: string): number {
  if (!memoryString) return 0;

  const units: { [key: string]: number } = {
    'Ki': 1 / 1024,        // Kibibytes to MiB
    'Mi': 1,               // Mebibytes
    'Gi': 1024,            // Gibibytes to MiB
    'Ti': 1024 * 1024,     // Tebibytes to MiB
    'K': 1 / 1024,         // Kilobytes to MiB (decimal)
    'M': 1,                // Megabytes
    'G': 1024,             // Gigabytes to MiB
    'T': 1024 * 1024,      // Terabytes to MiB
  };

  for (const [unit, multiplier] of Object.entries(units)) {
    if (memoryString.endsWith(unit)) {
      const value = parseFloat(memoryString.replace(unit, ''));
      return Math.round(value * multiplier);
    }
  }

  // If no unit, assume bytes
  return Math.round(parseInt(memoryString, 10) / (1024 * 1024));
}

/**
 * Format CPU millicores to human-readable string
 * Examples: 150 -> "150m", 1250 -> "1.25"
 */
export function formatCpu(millicores: number): string {
  if (millicores < 1000) {
    return `${millicores}m`;
  } else {
    return (millicores / 1000).toFixed(2);
  }
}

/**
 * Format memory MiB to human-readable string
 * Examples: 256 -> "256Mi", 1536 -> "1.5Gi"
 */
export function formatMemory(mib: number): string {
  if (mib < 1024) {
    return `${mib}Mi`;
  } else {
    return `${(mib / 1024).toFixed(2)}Gi`;
  }
}

/**
 * Fetch pod metrics from Kubernetes Metrics Server
 *
 * Prerequisites:
 * - Metrics Server must be installed in the cluster
 * - ServiceAccount must have permissions to read metrics
 *
 * Returns:
 * - Map of pod metrics indexed by "namespace/podName"
 * - Empty map if Metrics Server is unavailable
 */
export async function fetchPodMetrics(): Promise<PodMetricsMap> {
  try {
    const kc = new k8s.KubeConfig();
    kc.loadFromCluster();

    // Create custom API client for Metrics API
    const metricsApi = kc.makeApiClient(k8s.Metrics);

    // Fetch pod metrics for all namespaces
    const metricsResponse = await metricsApi.getPodMetrics();

    const metricsMap: PodMetricsMap = {};

    // Parse each pod's metrics
    if (metricsResponse && metricsResponse.items) {
      metricsResponse.items.forEach((podMetric: any) => {
        const podName = podMetric.metadata?.name;
        const namespace = podMetric.metadata?.namespace;

        if (!podName || !namespace) return;

        // Get metrics from the first container (most pods have one container)
        // For multi-container pods, sum all containers
        let totalCpuNano = 0;
        let totalMemoryBytes = 0;

        if (podMetric.containers && Array.isArray(podMetric.containers)) {
          podMetric.containers.forEach((container: any) => {
            if (container.usage) {
              const cpuUsage = container.usage.cpu || '0';
              const memoryUsage = container.usage.memory || '0';

              totalCpuNano += parseCpu(cpuUsage);
              totalMemoryBytes += parseMemory(memoryUsage);
            }
          });
        }

        const key = `${namespace}/${podName}`;
        metricsMap[key] = {
          cpu: formatCpu(totalCpuNano),
          memory: formatMemory(totalMemoryBytes),
        };
      });
    }

    console.log(`📊 Fetched metrics for ${Object.keys(metricsMap).length} pods`);
    return metricsMap;
  } catch (error: any) {
    // Metrics Server might not be installed or accessible
    console.warn('Failed to fetch pod metrics:', error.message);
    console.warn('Make sure Metrics Server is installed: kubectl get apiservices | grep metrics');
    return {};
  }
}

/**
 * Check if Metrics Server is available
 */
export async function isMetricsServerAvailable(): Promise<boolean> {
  try {
    const kc = new k8s.KubeConfig();
    kc.loadFromCluster();

    const metricsApi = kc.makeApiClient(k8s.Metrics);
    await metricsApi.getPodMetrics();

    return true;
  } catch (error) {
    return false;
  }
}
