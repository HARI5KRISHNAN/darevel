import { Server } from 'socket.io';
import axios from 'axios';
import { Pod } from '../types';
import { createIncident } from './incident.service';

interface AlertConfig {
  emailAppUrl?: string;
  alertEmail?: string;
  backendUrl?: string;
}

interface PodAlert {
  id: string;
  podName: string;
  namespace: string;
  status: string;
  timestamp: Date;
  summary?: string;
  acknowledged: boolean;
}

// In-memory alert storage (can be moved to database later)
let recentAlerts: PodAlert[] = [];
const MAX_ALERTS = 100; // Keep last 100 alerts

/**
 * Check if a pod status requires an alert
 */
function shouldAlert(pod: Pod): boolean {
  const alertStatuses = ['Failed', 'Unknown'];
  return alertStatuses.includes(pod.status);
}

/**
 * Generate AI summary for the pod alert
 */
async function generateAlertSummary(pod: Pod, config: AlertConfig): Promise<string> {
  try {
    const backendUrl = config.backendUrl || 'http://localhost:5001';

    const transcript = `
Pod Alert Details:
- Pod Name: ${pod.name}
- Namespace: ${pod.namespace}
- Status: ${pod.status}
- Restarts: ${pod.restarts}
- Age: ${Math.floor(pod.age / 60)} minutes
${pod.cpuUsage ? `- CPU Usage: ${pod.cpuUsage}%` : ''}
${pod.memoryUsage ? `- Memory Usage: ${pod.memoryUsage}Mi` : ''}

Please provide a brief analysis of this pod failure and suggest potential causes.
    `.trim();

    const response = await axios.post(`${backendUrl}/api/ai/generate-summary`, {
      transcript,
      title: `Pod Alert: ${pod.name}`,
    }, {
      timeout: 10000
    });

    return response.data.summary || 'Unable to generate summary.';
  } catch (error: any) {
    console.error('Failed to generate alert summary:', error.message);
    return `Pod ${pod.name} in namespace ${pod.namespace} has entered ${pod.status} state. Manual investigation required.`;
  }
}

/**
 * Send alert email via external email app
 */
async function sendAlertEmail(pod: Pod, summary: string, config: AlertConfig): Promise<boolean> {
  if (!config.emailAppUrl) {
    console.warn('EMAIL_APP_URL not configured. Skipping email alert.');
    return false;
  }

  if (!config.alertEmail) {
    console.warn('ALERT_EMAIL not configured. Skipping email alert.');
    return false;
  }

  try {
    const subject = `🚨 Kubernetes Pod Alert: ${pod.name} (${pod.status})`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
          🚨 Kubernetes Pod Alert
        </h2>

        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">Pod Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px;">Pod Name:</td>
              <td style="padding: 8px 0;">${pod.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Namespace:</td>
              <td style="padding: 8px 0;">${pod.namespace}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Status:</td>
              <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">${pod.status}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Restarts:</td>
              <td style="padding: 8px 0;">${pod.restarts}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Age:</td>
              <td style="padding: 8px 0;">${Math.floor(pod.age / 60)} minutes</td>
            </tr>
            ${pod.cpuUsage ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">CPU Usage:</td>
              <td style="padding: 8px 0;">${pod.cpuUsage}%</td>
            </tr>
            ` : ''}
            ${pod.memoryUsage ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Memory:</td>
              <td style="padding: 8px 0;">${pod.memoryUsage.toFixed(0)}Mi</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #4f46e5;">🧠 AI Analysis</h3>
          <div style="white-space: pre-wrap; font-family: monospace; font-size: 13px; line-height: 1.6;">
${summary}
          </div>
        </div>

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">📋 Next Steps</h3>
          <ol style="margin: 0; padding-left: 20px;">
            <li>Check pod logs: <code>kubectl logs ${pod.name} -n ${pod.namespace}</code></li>
            <li>Describe pod: <code>kubectl describe pod ${pod.name} -n ${pod.namespace}</code></li>
            <li>Check recent events: <code>kubectl get events -n ${pod.namespace} --sort-by='.lastTimestamp'</code></li>
            <li>Review Whooper dashboard for more details</li>
          </ol>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>
            Generated by <strong>Whooper Kubernetes Dashboard</strong><br>
            ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    await axios.post(config.emailAppUrl, {
      subject,
      html,
      recipients: [config.alertEmail]
    }, {
      timeout: 10000
    });

    console.log(`✅ Alert email sent for pod ${pod.name}`);
    return true;
  } catch (error: any) {
    console.error('Failed to send alert email:', error?.response?.data || error.message);
    return false;
  }
}

/**
 * Store alert in memory (can be persisted to database)
 */
function storeAlert(pod: Pod, summary: string): PodAlert {
  const alert: PodAlert = {
    id: `alert_${Date.now()}_${pod.id}`,
    podName: pod.name,
    namespace: pod.namespace,
    status: pod.status,
    timestamp: new Date(),
    summary,
    acknowledged: false
  };

  recentAlerts.unshift(alert);

  // Keep only last MAX_ALERTS
  if (recentAlerts.length > MAX_ALERTS) {
    recentAlerts = recentAlerts.slice(0, MAX_ALERTS);
  }

  return alert;
}

/**
 * Process pod update and trigger alerts if needed
 */
export async function processPodForAlerts(
  pod: Pod,
  io: Server,
  config: AlertConfig
): Promise<void> {
  if (!shouldAlert(pod)) {
    return;
  }

  console.log(`🚨 Alert triggered for pod ${pod.name} (${pod.status})`);

  // Generate AI summary
  const summary = await generateAlertSummary(pod, config);

  // Store alert
  const alert = storeAlert(pod, summary);

  // Emit alert to all connected clients
  io.emit('pod_alert', alert);

  // Send email notification (async, non-blocking)
  sendAlertEmail(pod, summary, config).catch(err => {
    console.error('Error sending alert email:', err.message);
  });

  // Create incident for tracking and analytics (async, non-blocking)
  createIncident(pod, io).catch(err => {
    console.error('Error creating incident:', err.message);
  });
}

/**
 * Get recent alerts
 */
export function getRecentAlerts(limit: number = 50): PodAlert[] {
  return recentAlerts.slice(0, limit);
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(alertId: string): boolean {
  const alert = recentAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  return false;
}

/**
 * Clear old alerts
 */
export function clearOldAlerts(olderThanHours: number = 24): number {
  const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
  const originalLength = recentAlerts.length;

  recentAlerts = recentAlerts.filter(alert =>
    alert.timestamp.getTime() > cutoffTime
  );

  return originalLength - recentAlerts.length;
}
