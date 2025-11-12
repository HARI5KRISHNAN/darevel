import { Pod } from '../types';
import axios from 'axios';
import { Server } from 'socket.io';

export interface Incident {
  id: string;
  podId: string;
  podName: string;
  namespace: string;
  status: string;
  timestamp: Date;
  resolvedAt?: Date;
  rootCauseAnalysis?: string;
  remediationSteps?: string[];
  affectedServices?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  tags?: string[];
  metadata: {
    restarts: number;
    age: number;
    cpuUsage?: number;
    memoryUsage?: number;
    previousStatus?: string;
  };
}

export interface IncidentStats {
  total: number;
  byNamespace: Record<string, number>;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  recentIncidents: Incident[];
  mttr: number; // Mean Time To Recovery in seconds
  topFailingPods: { podName: string; count: number }[];
}

// In-memory incident storage (can be moved to database)
let incidents: Incident[] = [];
const MAX_INCIDENTS = 500;

/**
 * Determine incident severity based on pod characteristics
 */
function calculateSeverity(pod: Pod, previousIncidents: Incident[]): 'low' | 'medium' | 'high' | 'critical' {
  // Check for repeated failures
  const podIncidents = previousIncidents.filter(i => i.podName === pod.name && i.namespace === pod.namespace);
  const recentFailures = podIncidents.filter(i => {
    const hourAgo = Date.now() - (60 * 60 * 1000);
    return new Date(i.timestamp).getTime() > hourAgo;
  });

  // Critical: 5+ failures in last hour OR production namespace
  if (recentFailures.length >= 5 || pod.namespace === 'production') {
    return 'critical';
  }

  // High: 3-4 failures in last hour OR high restarts
  if (recentFailures.length >= 3 || pod.restarts >= 10) {
    return 'high';
  }

  // Medium: 1-2 failures OR moderate restarts
  if (recentFailures.length >= 1 || pod.restarts >= 5) {
    return 'medium';
  }

  // Low: First time failure
  return 'low';
}

/**
 * Categorize incident based on pod status and patterns
 */
function categorizeIncident(pod: Pod): string {
  if (pod.status === 'Failed') {
    if (pod.restarts > 5) return 'CrashLoopBackOff';
    if (pod.memoryUsage && pod.memoryUsage > 900) return 'OutOfMemory';
    if (pod.cpuUsage && pod.cpuUsage > 95) return 'HighCPUUsage';
    return 'PodFailure';
  }
  if (pod.status === 'Unknown') return 'NodeIssue';
  if (pod.status === 'Pending') return 'SchedulingIssue';
  return 'Unknown';
}

/**
 * Generate deep AI root-cause analysis using Gemini
 */
async function generateRootCauseAnalysis(pod: Pod, incident: Partial<Incident>): Promise<{
  rootCause: string;
  remediationSteps: string[];
}> {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';

    const analysisPrompt = `
You are a Kubernetes expert analyzing a pod failure incident.

Pod Details:
- Name: ${pod.name}
- Namespace: ${pod.namespace}
- Status: ${pod.status}
- Restarts: ${pod.restarts}
- Age: ${Math.floor(pod.age / 60)} minutes
- CPU Usage: ${pod.cpuUsage !== null ? pod.cpuUsage + '%' : 'N/A'}
- Memory Usage: ${pod.memoryUsage !== null ? pod.memoryUsage.toFixed(0) + 'Mi' : 'N/A'}
- Severity: ${incident.severity}
- Category: ${incident.category}

Incident Context:
- Timestamp: ${new Date(incident.timestamp!).toISOString()}
- Previous incidents for this pod: Check for patterns

Please provide:
1. A concise root cause analysis (2-3 sentences)
2. Exactly 5 specific remediation steps
3. Potential preventive measures

Format your response as JSON:
{
  "rootCause": "...",
  "remediationSteps": ["step1", "step2", "step3", "step4", "step5"],
  "prevention": "..."
}
    `.trim();

    const response = await axios.post(`${backendUrl}/api/ai/generate-summary`, {
      transcript: analysisPrompt,
      title: `Incident Analysis: ${pod.name}`,
    }, {
      timeout: 15000
    });

    let analysis = response.data.summary;

    // Try to parse JSON response
    try {
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = analysis.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        analysis = jsonMatch[1];
      }

      const parsed = JSON.parse(analysis);
      return {
        rootCause: parsed.rootCause || analysis,
        remediationSteps: Array.isArray(parsed.remediationSteps)
          ? parsed.remediationSteps
          : [
            `Check pod logs: kubectl logs ${pod.name} -n ${pod.namespace}`,
            `Describe pod: kubectl describe pod ${pod.name} -n ${pod.namespace}`,
            `Check events: kubectl get events -n ${pod.namespace} --field-selector involvedObject.name=${pod.name}`,
            `Review recent deployments`,
            `Check resource limits and quotas`
          ]
      };
    } catch (parseError) {
      // Fallback to unstructured analysis
      return {
        rootCause: analysis,
        remediationSteps: [
          `Check pod logs: kubectl logs ${pod.name} -n ${pod.namespace}`,
          `Describe pod: kubectl describe pod ${pod.name} -n ${pod.namespace}`,
          `Check recent events`,
          `Review application logs`,
          `Verify resource availability`
        ]
      };
    }
  } catch (error: any) {
    console.error('Failed to generate root cause analysis:', error.message);

    // Provide fallback analysis based on category
    const category = incident.category || 'Unknown';
    const fallbackAnalysis: Record<string, { rootCause: string; steps: string[] }> = {
      'CrashLoopBackOff': {
        rootCause: 'Pod is repeatedly crashing and restarting. This typically indicates an application error, missing dependencies, or incorrect configuration.',
        steps: [
          'Check application logs for error messages',
          'Verify all required environment variables are set',
          'Check for missing ConfigMaps or Secrets',
          'Review recent code or configuration changes',
          'Verify resource limits are adequate'
        ]
      },
      'OutOfMemory': {
        rootCause: 'Pod exceeded memory limits and was killed by Kubernetes (OOMKilled). The application may have a memory leak or insufficient memory allocation.',
        steps: [
          'Increase memory limits in pod specification',
          'Profile application for memory leaks',
          'Review memory usage patterns',
          'Check for memory-intensive operations',
          'Consider horizontal scaling'
        ]
      },
      'HighCPUUsage': {
        rootCause: 'Pod is consuming excessive CPU resources, potentially causing throttling or performance degradation.',
        steps: [
          'Profile application CPU usage',
          'Increase CPU limits if necessary',
          'Optimize CPU-intensive operations',
          'Check for infinite loops or excessive processing',
          'Consider horizontal scaling'
        ]
      },
      'NodeIssue': {
        rootCause: 'Pod status is Unknown, indicating a potential node communication issue. The node may be down or network partitioned.',
        steps: [
          'Check node status: kubectl get nodes',
          'Verify node connectivity',
          'Check kubelet logs on the node',
          'Review cluster network status',
          'Consider draining and cordoning the node'
        ]
      },
      'SchedulingIssue': {
        rootCause: 'Pod cannot be scheduled onto any node. This may be due to resource constraints, node selectors, or taints/tolerations.',
        steps: [
          'Check pod events for scheduling errors',
          'Verify cluster has available resources',
          'Review node selectors and affinity rules',
          'Check taints and tolerations',
          'Verify resource quotas are not exceeded'
        ]
      }
    };

    const fallback = fallbackAnalysis[category] || {
      rootCause: `Pod ${pod.name} has failed with status ${pod.status}. Manual investigation required.`,
      steps: [
        `kubectl logs ${pod.name} -n ${pod.namespace}`,
        `kubectl describe pod ${pod.name} -n ${pod.namespace}`,
        'Check recent cluster events',
        'Review application configuration',
        'Verify resource availability'
      ]
    };

    return {
      rootCause: fallback.rootCause,
      remediationSteps: fallback.steps
    };
  }
}

/**
 * Create a new incident from a pod failure
 */
export async function createIncident(pod: Pod, io?: Server): Promise<Incident> {
  const severity = calculateSeverity(pod, incidents);
  const category = categorizeIncident(pod);

  const incident: Partial<Incident> = {
    id: `incident_${Date.now()}_${pod.id}`,
    podId: pod.id,
    podName: pod.name,
    namespace: pod.namespace,
    status: pod.status,
    timestamp: new Date(),
    severity,
    category,
    tags: [pod.namespace, category, severity],
    metadata: {
      restarts: pod.restarts,
      age: pod.age,
      cpuUsage: pod.cpuUsage ?? undefined,
      memoryUsage: pod.memoryUsage ?? undefined,
    }
  };

  // Generate AI analysis
  console.log(`🔍 Generating root cause analysis for ${pod.name}...`);
  const analysis = await generateRootCauseAnalysis(pod, incident);

  const completeIncident: Incident = {
    ...incident,
    rootCauseAnalysis: analysis.rootCause,
    remediationSteps: analysis.remediationSteps,
  } as Incident;

  // Store incident
  incidents.unshift(completeIncident);

  // Keep only last MAX_INCIDENTS
  if (incidents.length > MAX_INCIDENTS) {
    incidents = incidents.slice(0, MAX_INCIDENTS);
  }

  console.log(`✅ Incident created: ${completeIncident.id} (${severity})`);

  // Broadcast to connected clients
  if (io) {
    io.emit('incident_created', completeIncident);
  }

  return completeIncident;
}

/**
 * Get all incidents
 */
export function getIncidents(limit?: number): Incident[] {
  return limit ? incidents.slice(0, limit) : incidents;
}

/**
 * Get incident by ID
 */
export function getIncidentById(id: string): Incident | undefined {
  return incidents.find(i => i.id === id);
}

/**
 * Mark incident as resolved
 */
export function resolveIncident(id: string): Incident | null {
  const incident = incidents.find(i => i.id === id);
  if (incident && !incident.resolvedAt) {
    incident.resolvedAt = new Date();
    return incident;
  }
  return null;
}

/**
 * Get incident statistics
 */
export function getIncidentStats(): IncidentStats {
  const total = incidents.length;

  // By namespace
  const byNamespace: Record<string, number> = {};
  incidents.forEach(i => {
    byNamespace[i.namespace] = (byNamespace[i.namespace] || 0) + 1;
  });

  // By status
  const byStatus: Record<string, number> = {};
  incidents.forEach(i => {
    byStatus[i.status] = (byStatus[i.status] || 0) + 1;
  });

  // By severity
  const bySeverity: Record<string, number> = {};
  incidents.forEach(i => {
    bySeverity[i.severity] = (bySeverity[i.severity] || 0) + 1;
  });

  // Top failing pods
  const podCounts: Record<string, number> = {};
  incidents.forEach(i => {
    const key = `${i.namespace}/${i.podName}`;
    podCounts[key] = (podCounts[key] || 0) + 1;
  });

  const topFailingPods = Object.entries(podCounts)
    .map(([podName, count]) => ({ podName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate MTTR (Mean Time To Recovery)
  const resolvedIncidents = incidents.filter(i => i.resolvedAt);
  const totalRecoveryTime = resolvedIncidents.reduce((sum, i) => {
    const recoveryTime = new Date(i.resolvedAt!).getTime() - new Date(i.timestamp).getTime();
    return sum + recoveryTime;
  }, 0);
  const mttr = resolvedIncidents.length > 0 ? totalRecoveryTime / resolvedIncidents.length / 1000 : 0;

  return {
    total,
    byNamespace,
    byStatus,
    bySeverity,
    recentIncidents: incidents.slice(0, 10),
    mttr,
    topFailingPods
  };
}

/**
 * Clear old incidents
 */
export function clearOldIncidents(olderThanDays: number = 7): number {
  const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
  const originalLength = incidents.length;

  incidents = incidents.filter(incident =>
    new Date(incident.timestamp).getTime() > cutoffTime
  );

  return originalLength - incidents.length;
}
