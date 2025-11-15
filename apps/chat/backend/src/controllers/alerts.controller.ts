import { Request, Response } from 'express';
import { sendEmail } from '../services/email.service';
import { alertMetrics } from '../utils/metrics';

/**
 * Prometheus Alert Webhook Payload Interface
 */
interface PrometheusAlert {
  status: 'firing' | 'resolved';
  labels: {
    alertname: string;
    severity?: string;
    namespace?: string;
    pod?: string;
    container?: string;
    type?: string;
    component?: string;
    [key: string]: string | undefined;
  };
  annotations: {
    summary?: string;
    description?: string;
    action?: string;
    [key: string]: string | undefined;
  };
  startsAt: string;
  endsAt?: string;
  generatorURL?: string;
  fingerprint?: string;
}

interface PrometheusWebhookPayload {
  version: string;
  groupKey: string;
  truncatedAlerts?: number;
  status: 'firing' | 'resolved';
  receiver: string;
  groupLabels: Record<string, string>;
  commonLabels: Record<string, string>;
  commonAnnotations: Record<string, string>;
  externalURL: string;
  alerts: PrometheusAlert[];
}

/**
 * POST /api/alerts/webhook
 * Handle Prometheus AlertManager webhook
 */
export const handlePrometheusAlert = async (req: Request, res: Response) => {
  try {
    const payload: PrometheusWebhookPayload = req.body;

    if (!payload || !payload.alerts || payload.alerts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook payload - no alerts found'
      });
    }

    console.log(`Received ${payload.alerts.length} alert(s) from Prometheus AlertManager`);

    // Process each alert
    const emailPromises = payload.alerts.map(alert =>
      processAndEmailAlert(alert, payload.status)
    );

    await Promise.allSettled(emailPromises);

    // Update metrics
    payload.alerts.forEach(alert => {
      const severity = alert.labels.severity || 'unknown';
      const type = alert.labels.type || 'general';

      if (alert.status === 'firing') {
        alertMetrics.triggered.inc({ severity, type });
      } else if (alert.status === 'resolved') {
        alertMetrics.resolved.inc({ type });
      }
    });

    res.json({
      success: true,
      message: `Processed ${payload.alerts.length} alert(s)`,
      alertsProcessed: payload.alerts.length
    });
  } catch (error: any) {
    console.error('Error processing Prometheus webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process alert webhook',
      error: error.message
    });
  }
};

/**
 * Process individual alert and send email
 */
async function processAndEmailAlert(
  alert: PrometheusAlert,
  groupStatus: string
): Promise<void> {
  try {
    const severity = alert.labels.severity || 'info';
    const status = alert.status;

    // Build email subject
    const emoji = getSeverityEmoji(severity);
    const statusText = status === 'firing' ? 'ALERT' : 'RESOLVED';
    const subject = `${emoji} [${statusText}] ${alert.labels.alertname}`;

    // Build email content
    const content = buildAlertEmailContent(alert);
    const html = buildAlertEmailHTML(alert, status);

    // Get recipient email from environment variable
    const recipient = process.env.DEFAULT_EMAIL_RECIPIENT || process.env.ALERT_EMAIL;

    if (!recipient) {
      console.warn('No email recipient configured for alerts. Set DEFAULT_EMAIL_RECIPIENT or ALERT_EMAIL.');
      return;
    }

    // Send email
    await sendEmail({
      to: recipient,
      subject,
      content,
      html
    });

    console.log(`Alert email sent: ${alert.labels.alertname} (${status})`);
  } catch (error: any) {
    console.error(`Failed to send alert email for ${alert.labels.alertname}:`, error.message);
  }
}

/**
 * Get emoji for severity level
 */
function getSeverityEmoji(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return '🚨';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '📢';
  }
}

/**
 * Build plain text email content
 */
function buildAlertEmailContent(alert: PrometheusAlert): string {
  const lines: string[] = [];

  lines.push(`Alert: ${alert.labels.alertname}`);
  lines.push(`Status: ${alert.status.toUpperCase()}`);

  if (alert.labels.severity) {
    lines.push(`Severity: ${alert.labels.severity.toUpperCase()}`);
  }

  lines.push('');
  lines.push('--- Details ---');

  if (alert.labels.namespace) {
    lines.push(`Namespace: ${alert.labels.namespace}`);
  }

  if (alert.labels.pod) {
    lines.push(`Pod: ${alert.labels.pod}`);
  }

  if (alert.labels.container) {
    lines.push(`Container: ${alert.labels.container}`);
  }

  if (alert.labels.component) {
    lines.push(`Component: ${alert.labels.component}`);
  }

  lines.push('');

  if (alert.annotations.summary) {
    lines.push(`Summary: ${alert.annotations.summary}`);
  }

  if (alert.annotations.description) {
    lines.push(`Description: ${alert.annotations.description}`);
  }

  if (alert.annotations.action) {
    lines.push('');
    lines.push(`Action Required: ${alert.annotations.action}`);
  }

  lines.push('');
  lines.push('--- Timeline ---');
  lines.push(`Started: ${new Date(alert.startsAt).toLocaleString()}`);

  if (alert.endsAt && alert.status === 'resolved') {
    lines.push(`Ended: ${new Date(alert.endsAt).toLocaleString()}`);
    const duration = new Date(alert.endsAt).getTime() - new Date(alert.startsAt).getTime();
    lines.push(`Duration: ${formatDuration(duration)}`);
  }

  if (alert.generatorURL) {
    lines.push('');
    lines.push(`View in Prometheus: ${alert.generatorURL}`);
  }

  return lines.join('\n');
}

/**
 * Build HTML email content
 */
function buildAlertEmailHTML(alert: PrometheusAlert, status: string): string {
  const severity = alert.labels.severity || 'info';
  const severityColor = getSeverityColor(severity);
  const statusColor = status === 'firing' ? '#dc2626' : '#16a34a';
  const emoji = getSeverityEmoji(severity);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alert Notification</title>
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
                ${emoji} ${status === 'firing' ? 'ALERT TRIGGERED' : 'ALERT RESOLVED'}
              </h1>
            </td>
          </tr>

          <!-- Alert Name -->
          <tr>
            <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
              <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #111827;">
                ${alert.labels.alertname}
              </h2>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <span style="display: inline-block; background-color: ${severityColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 12px;">
                  ${severity}
                </span>
              </p>
            </td>
          </tr>

          <!-- Summary -->
          ${alert.annotations.summary ? `
          <tr>
            <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #374151;">Summary</h3>
              <p style="margin: 0; color: #6b7280; line-height: 1.5;">
                ${alert.annotations.summary}
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Description -->
          ${alert.annotations.description ? `
          <tr>
            <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #374151;">Description</h3>
              <p style="margin: 0; color: #6b7280; line-height: 1.5;">
                ${alert.annotations.description}
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Details -->
          <tr>
            <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #374151;">Details</h3>
              <table width="100%" cellpadding="5" cellspacing="0">
                ${alert.labels.namespace ? `
                <tr>
                  <td style="color: #6b7280; font-weight: bold; width: 120px;">Namespace:</td>
                  <td style="color: #111827;">${alert.labels.namespace}</td>
                </tr>
                ` : ''}
                ${alert.labels.pod ? `
                <tr>
                  <td style="color: #6b7280; font-weight: bold;">Pod:</td>
                  <td style="color: #111827;">${alert.labels.pod}</td>
                </tr>
                ` : ''}
                ${alert.labels.container ? `
                <tr>
                  <td style="color: #6b7280; font-weight: bold;">Container:</td>
                  <td style="color: #111827;">${alert.labels.container}</td>
                </tr>
                ` : ''}
                ${alert.labels.component ? `
                <tr>
                  <td style="color: #6b7280; font-weight: bold;">Component:</td>
                  <td style="color: #111827;">${alert.labels.component}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="color: #6b7280; font-weight: bold;">Started:</td>
                  <td style="color: #111827;">${new Date(alert.startsAt).toLocaleString()}</td>
                </tr>
                ${alert.endsAt && status === 'resolved' ? `
                <tr>
                  <td style="color: #6b7280; font-weight: bold;">Ended:</td>
                  <td style="color: #111827;">${new Date(alert.endsAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-weight: bold;">Duration:</td>
                  <td style="color: #111827;">${formatDuration(new Date(alert.endsAt).getTime() - new Date(alert.startsAt).getTime())}</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Action Required -->
          ${alert.annotations.action ? `
          <tr>
            <td style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #92400e;">
                ⚡ Action Required
              </h3>
              <p style="margin: 0; color: #78350f; line-height: 1.5;">
                ${alert.annotations.action}
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
                This alert was sent by Whooper Kubernetes Monitoring
              </p>
              ${alert.generatorURL ? `
              <p style="margin: 0;">
                <a href="${alert.generatorURL}" style="color: #3b82f6; text-decoration: none; font-size: 12px;">
                  View in Prometheus →
                </a>
              </p>
              ` : ''}
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
 * Get color for severity level
 */
function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return '#dc2626';
    case 'warning':
      return '#f59e0b';
    case 'info':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
