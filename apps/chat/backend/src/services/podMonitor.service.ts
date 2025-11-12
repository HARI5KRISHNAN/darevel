/**
 * Pod Monitor Service - Auto-Healing & AI Incident Reports
 *
 * Watches Kubernetes pods for:
 * - Restarts (CrashLoopBackOff, OOMKilled, etc.)
 * - State changes (Running → Failed → Running)
 * - Container crashes
 *
 * When detected:
 * 1. Logs incident details
 * 2. Generates AI summary via Gemini
 * 3. Sends email notification via email service
 * 4. Tracks metrics for monitoring
 */

import * as k8s from '@kubernetes/client-node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendEmail } from './email.service';
import { alertMetrics, incidentMetrics, websocketMetrics } from '../utils/metrics';
import { Server as SocketIOServer } from 'socket.io';

interface PodRestartEvent {
  podName: string;
  namespace: string;
  containerName: string;
  restartCount: number;
  reason?: string;
  message?: string;
  exitCode?: number;
  lastState?: string;
  timestamp: Date;
}

interface AutoHealingIncident {
  id: string;
  podName: string;
  namespace: string;
  containerName: string;
  restartCount: number;
  reason: string;
  message: string;
  exitCode?: number;
  detectedAt: Date;
  healedAt?: Date;
  aiSummary?: string;
  emailSent: boolean;
  status: 'detected' | 'healing' | 'healed' | 'failed';
}

// In-memory incident store (could be replaced with database)
const incidents: Map<string, AutoHealingIncident> = new Map();
const trackedPods: Map<string, number> = new Map(); // podKey -> lastRestartCount

let watch: k8s.Watch | null = null;
let watchRequest: any = null;
let isMonitoring = false;
let io: SocketIOServer | null = null;

/**
 * Set Socket.IO instance for real-time updates
 */
export function setSocketIO(socketServer: SocketIOServer): void {
  io = socketServer;
  console.log('Socket.IO instance attached to pod monitor');
}

/**
 * Start monitoring pods for auto-healing
 */
export async function startPodMonitor(): Promise<void> {
  if (isMonitoring) {
    console.log('Pod monitor already running');
    return;
  }

  try {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const coreApi = kc.makeApiClient(k8s.CoreV1Api);
    watch = new k8s.Watch(kc);

    console.log('🚀 Whooper Pod Monitor started - watching for pod restarts...');

    // Start watching all pods
    watchRequest = await watch.watch(
      '/api/v1/pods',
      {},
      async (type, apiObj) => {
        await handlePodEvent(type, apiObj as k8s.V1Pod);
      },
      (err) => {
        if (err) {
          console.error('❌ Pod watch error:', err.message);
          isMonitoring = false;

          // Auto-restart watcher after 10 seconds
          console.log('Restarting pod monitor in 10 seconds...');
          setTimeout(() => {
            startPodMonitor();
          }, 10000);
        }
      }
    );

    isMonitoring = true;
  } catch (error: any) {
    console.error('Failed to start pod monitor:', error.message);
    isMonitoring = false;

    // Retry after 30 seconds
    setTimeout(() => {
      console.log('Retrying pod monitor startup...');
      startPodMonitor();
    }, 30000);
  }
}

/**
 * Stop monitoring pods
 */
export function stopPodMonitor(): void {
  if (watchRequest) {
    watchRequest.abort();
    watchRequest = null;
  }
  isMonitoring = false;
  console.log('Pod monitor stopped');
}

/**
 * Handle pod event from Kubernetes watch
 */
async function handlePodEvent(type: string, pod: k8s.V1Pod): Promise<void> {
  if (!pod.metadata || !pod.status) {
    return;
  }

  const podName = pod.metadata.name || 'unknown';
  const namespace = pod.metadata.namespace || 'default';
  const podKey = `${namespace}/${podName}`;

  // Only process MODIFIED events (pod state changes)
  if (type !== 'MODIFIED') {
    return;
  }

  // Check container statuses for restarts
  const containerStatuses = pod.status.containerStatuses || [];

  for (const containerStatus of containerStatuses) {
    const containerName = containerStatus.name;
    const restartCount = containerStatus.restartCount || 0;
    const containerKey = `${podKey}/${containerName}`;

    // Get last known restart count
    const lastRestartCount = trackedPods.get(containerKey) || 0;

    // Detect new restart
    if (restartCount > lastRestartCount) {
      console.log(`🔄 Restart detected: ${podName}/${containerName} (count: ${restartCount})`);

      // Update tracked restart count
      trackedPods.set(containerKey, restartCount);

      // Get restart reason and details
      const lastState = containerStatus.lastState?.terminated || containerStatus.lastState?.waiting;
      const reason = lastState?.reason || 'Unknown';
      const message = lastState?.message || 'No message available';
      const exitCode = lastState?.exitCode;

      const event: PodRestartEvent = {
        podName,
        namespace,
        containerName,
        restartCount,
        reason,
        message,
        exitCode,
        lastState: JSON.stringify(lastState),
        timestamp: new Date()
      };

      // Process the restart event
      await processRestartEvent(event);
    } else {
      // Update tracked restart count even if no new restart
      trackedPods.set(containerKey, restartCount);
    }
  }
}

/**
 * Process pod restart event
 */
async function processRestartEvent(event: PodRestartEvent): Promise<void> {
  try {
    // Create incident record
    const incidentId = `${event.namespace}-${event.podName}-${event.containerName}-${Date.now()}`;
    const incident: AutoHealingIncident = {
      id: incidentId,
      podName: event.podName,
      namespace: event.namespace,
      containerName: event.containerName,
      restartCount: event.restartCount,
      reason: event.reason || 'Unknown',
      message: event.message || 'No details available',
      exitCode: event.exitCode,
      detectedAt: event.timestamp,
      emailSent: false,
      status: 'detected'
    };

    // Store incident
    incidents.set(incidentId, incident);

    // Update metrics
    const severity = getSeverityFromReason(event.reason);
    incidentMetrics.created.inc({ severity, namespace: event.namespace });

    console.log(`📝 Incident created: ${incidentId}`);

    // Generate AI summary
    incident.status = 'healing';
    const aiSummary = await generateIncidentSummary(event);
    incident.aiSummary = aiSummary;

    // Send email notification
    const emailSent = await sendIncidentEmail(incident);
    incident.emailSent = emailSent;

    // Mark as healed
    incident.status = 'healed';
    incident.healedAt = new Date();

    // Calculate and track MTTR (time from detection to healing)
    if (incident.healedAt && incident.detectedAt) {
      const mttrSeconds = (incident.healedAt.getTime() - incident.detectedAt.getTime()) / 1000;
      incidentMetrics.mttr.observe({ severity }, mttrSeconds);
    }

    console.log(`✅ Incident healed: ${incidentId}`);

    // Update metrics
    alertMetrics.triggered.inc({ severity, type: 'pod_restart' });

    // Emit Socket.IO event for real-time UI updates
    if (io) {
      io.emit('autoheal_incident', incident);
      websocketMetrics.messagesSent.inc({ event: 'autoheal_incident' });
      console.log(`📡 Emitted autoheal_incident event to clients`);
    }
  } catch (error: any) {
    console.error('Error processing restart event:', error.message);
  }
}

/**
 * Generate AI summary of incident using Gemini
 */
async function generateIncidentSummary(event: PodRestartEvent): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured - using default summary');
      return generateDefaultSummary(event);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are a Kubernetes expert analyzing a pod restart incident. Generate a concise, professional incident summary.

Pod Details:
- Name: ${event.podName}
- Namespace: ${event.namespace}
- Container: ${event.containerName}
- Restart Count: ${event.restartCount}
- Reason: ${event.reason}
- Message: ${event.message}
- Exit Code: ${event.exitCode || 'N/A'}

Provide a summary that includes:
1. What happened (2-3 sentences)
2. Likely root cause (1-2 sentences)
3. Recommended next steps (2-3 bullet points)

Keep it concise and actionable.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return summary;
  } catch (error: any) {
    console.error('Error generating AI summary:', error.message);
    return generateDefaultSummary(event);
  }
}

/**
 * Generate default summary when AI is unavailable
 */
function generateDefaultSummary(event: PodRestartEvent): string {
  const lines: string[] = [];

  lines.push('## Incident Summary\n');
  lines.push(`The container **${event.containerName}** in pod **${event.podName}** (namespace: ${event.namespace}) has restarted.\n`);

  lines.push('## Details\n');
  lines.push(`- **Restart Count**: ${event.restartCount}`);
  lines.push(`- **Reason**: ${event.reason}`);
  if (event.exitCode !== undefined) {
    lines.push(`- **Exit Code**: ${event.exitCode}`);
  }
  lines.push(`- **Message**: ${event.message}\n`);

  lines.push('## Likely Causes\n');
  const cause = getReasonDescription(event.reason);
  lines.push(`${cause}\n`);

  lines.push('## Recommended Actions\n');
  lines.push('- Check pod logs: `kubectl logs -n ' + event.namespace + ' ' + event.podName + ' -c ' + event.containerName + ' --previous`');
  lines.push('- Check pod events: `kubectl describe pod -n ' + event.namespace + ' ' + event.podName + '`');
  lines.push('- Review resource limits and requests');
  lines.push('- Check for OOMKilled or CrashLoopBackOff patterns');

  return lines.join('\n');
}

/**
 * Get human-readable description for restart reason
 */
function getReasonDescription(reason?: string): string {
  if (!reason) {
    return 'The restart reason is unknown. Check pod logs for more details.';
  }

  switch (reason) {
    case 'OOMKilled':
      return 'The container was killed due to Out Of Memory (OOM). The container exceeded its memory limit.';
    case 'Error':
      return 'The container exited with an error code. This typically indicates an application crash or configuration issue.';
    case 'CrashLoopBackOff':
      return 'The container is in a crash loop. It keeps crashing and Kubernetes is backing off restart attempts.';
    case 'ContainerCannotRun':
      return 'The container cannot run, likely due to a configuration issue or missing dependencies.';
    case 'DeadlineExceeded':
      return 'The container startup deadline was exceeded. It may be taking too long to become ready.';
    case 'Evicted':
      return 'The pod was evicted, likely due to resource pressure on the node.';
    default:
      return `The container restarted with reason: ${reason}. Check logs for more details.`;
  }
}

/**
 * Get severity level from restart reason
 */
function getSeverityFromReason(reason?: string): string {
  if (!reason) return 'warning';

  switch (reason) {
    case 'OOMKilled':
    case 'CrashLoopBackOff':
      return 'critical';
    case 'Error':
    case 'ContainerCannotRun':
      return 'high';
    case 'DeadlineExceeded':
    case 'Evicted':
      return 'medium';
    default:
      return 'warning';
  }
}

/**
 * Send incident email notification
 */
async function sendIncidentEmail(incident: AutoHealingIncident): Promise<boolean> {
  try {
    const recipient = process.env.DEFAULT_EMAIL_RECIPIENT || process.env.ALERT_EMAIL;

    if (!recipient) {
      console.warn('No email recipient configured for auto-healing notifications');
      return false;
    }

    const subject = `🔄 Auto-Heal: ${incident.podName} Restarted (${incident.reason})`;

    // Plain text content
    const content = `
Auto-Healing Incident Report

Pod: ${incident.podName}
Namespace: ${incident.namespace}
Container: ${incident.containerName}
Restart Count: ${incident.restartCount}
Reason: ${incident.reason}
Exit Code: ${incident.exitCode || 'N/A'}
Detected: ${incident.detectedAt.toLocaleString()}
${incident.healedAt ? `Healed: ${incident.healedAt.toLocaleString()}` : ''}

${incident.aiSummary || 'AI summary not available'}

---
This incident was automatically detected and reported by Whooper Auto-Healing System.
    `.trim();

    // HTML content
    const html = buildIncidentEmailHTML(incident);

    await sendEmail({
      to: recipient,
      subject,
      content,
      html
    });

    console.log(`📧 Auto-healing email sent for incident: ${incident.id}`);
    return true;
  } catch (error: any) {
    console.error('Error sending incident email:', error.message);
    return false;
  }
}

/**
 * Build HTML email for incident
 */
function buildIncidentEmailHTML(incident: AutoHealingIncident): string {
  const severity = getSeverityFromReason(incident.reason);
  const severityColor = severity === 'critical' ? '#dc2626' : severity === 'high' ? '#f59e0b' : '#3b82f6';
  const statusColor = incident.status === 'healed' ? '#16a34a' : '#f59e0b';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auto-Healing Incident Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${statusColor}; padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">
                🔄 Auto-Healing Incident Report
              </h1>
            </td>
          </tr>

          <!-- Pod Info -->
          <tr>
            <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
              <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #111827;">
                ${incident.podName}
              </h2>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <span style="display: inline-block; background-color: ${severityColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 12px;">
                  ${severity}
                </span>
                <span style="margin-left: 10px; color: #6b7280;">
                  Restart Count: ${incident.restartCount}
                </span>
              </p>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #374151;">Incident Details</h3>
              <table width="100%" cellpadding="5" cellspacing="0">
                <tr>
                  <td style="color: #6b7280; font-weight: bold; width: 140px;">Namespace:</td>
                  <td style="color: #111827;">${incident.namespace}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-weight: bold;">Container:</td>
                  <td style="color: #111827;">${incident.containerName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-weight: bold;">Reason:</td>
                  <td style="color: #111827;">${incident.reason}</td>
                </tr>
                ${incident.exitCode !== undefined ? `
                <tr>
                  <td style="color: #6b7280; font-weight: bold;">Exit Code:</td>
                  <td style="color: #111827;">${incident.exitCode}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="color: #6b7280; font-weight: bold;">Detected:</td>
                  <td style="color: #111827;">${incident.detectedAt.toLocaleString()}</td>
                </tr>
                ${incident.healedAt ? `
                <tr>
                  <td style="color: #6b7280; font-weight: bold;">Healed:</td>
                  <td style="color: #111827;">${incident.healedAt.toLocaleString()}</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- AI Summary -->
          ${incident.aiSummary ? `
          <tr>
            <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #374151;">
                🤖 AI Analysis
              </h3>
              <div style="color: #6b7280; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">
${incident.aiSummary}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Message -->
          ${incident.message ? `
          <tr>
            <td style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #92400e;">
                Error Message
              </h3>
              <p style="margin: 0; color: #78350f; font-size: 13px; font-family: monospace; white-space: pre-wrap;">
${incident.message}
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
                This incident was automatically detected and reported by Whooper Auto-Healing System
              </p>
              <p style="margin: 0; font-size: 12px;">
                <a href="#" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">View Pod Logs</a>
                <a href="#" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">View Events</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Get recent auto-healing incidents
 */
export function getRecentIncidents(limit: number = 50): AutoHealingIncident[] {
  const allIncidents = Array.from(incidents.values());
  return allIncidents
    .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
    .slice(0, limit);
}

/**
 * Get incident by ID
 */
export function getIncidentById(id: string): AutoHealingIncident | undefined {
  return incidents.get(id);
}

/**
 * Clear old incidents (older than specified hours)
 */
export function clearOldIncidents(hours: number = 24): number {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  let cleared = 0;

  for (const [id, incident] of incidents.entries()) {
    if (incident.detectedAt < cutoff) {
      incidents.delete(id);
      cleared++;
    }
  }

  console.log(`Cleared ${cleared} incidents older than ${hours} hours`);
  return cleared;
}

/**
 * Get monitoring status
 */
export function getMonitoringStatus(): { isMonitoring: boolean; trackedPods: number; incidents: number } {
  return {
    isMonitoring,
    trackedPods: trackedPods.size,
    incidents: incidents.size
  };
}
