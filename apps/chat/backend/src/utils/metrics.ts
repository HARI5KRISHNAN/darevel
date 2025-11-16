/**
 * Prometheus Metrics Configuration
 *
 * This module sets up Prometheus metrics collection for monitoring:
 * - Default Node.js metrics (CPU, memory, event loop, etc.)
 * - Custom application metrics (pods, requests, AI calls)
 */

import client from 'prom-client';

// Create a Registry to hold all metrics
export const register = new client.Registry();

// Collect default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'darevel_chat_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Custom Metrics

/**
 * Pod Metrics - Track Kubernetes pod status
 */
export const podMetrics = {
  total: new client.Gauge({
    name: 'darevel_chat_pods_total',
    help: 'Total number of pods being monitored',
    registers: [register],
  }),
  running: new client.Gauge({
    name: 'darevel_chat_pods_running',
    help: 'Number of pods in Running state',
    registers: [register],
  }),
  pending: new client.Gauge({
    name: 'darevel_chat_pods_pending',
    help: 'Number of pods in Pending state',
    registers: [register],
  }),
  failed: new client.Gauge({
    name: 'darevel_chat_pods_failed',
    help: 'Number of pods in Failed state',
    registers: [register],
  }),
};

/**
 * HTTP Request Metrics
 */
export const requestCounter = new client.Counter({
  name: 'darevel_chat_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

export const requestDuration = new client.Histogram({
  name: 'darevel_chat_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

/**
 * AI Service Metrics
 */
export const aiMetrics = {
  summaryRequests: new client.Counter({
    name: 'darevel_chat_ai_summary_requests_total',
    help: 'Total number of AI summary generation requests',
    labelNames: ['status'],
    registers: [register],
  }),
  subjectSuggestionRequests: new client.Counter({
    name: 'darevel_chat_ai_subject_suggestion_requests_total',
    help: 'Total number of AI subject suggestion requests',
    labelNames: ['status', 'type'],
    registers: [register],
  }),
  apiLatency: new client.Histogram({
    name: 'darevel_chat_ai_api_latency_seconds',
    help: 'Latency of Gemini API calls in seconds',
    labelNames: ['operation'],
    buckets: [0.5, 1, 2, 5, 10, 30],
    registers: [register],
  }),
};

/**
 * Email Service Metrics
 */
export const emailMetrics = {
  sent: new client.Counter({
    name: 'darevel_chat_emails_sent_total',
    help: 'Total number of emails sent',
    labelNames: ['type', 'status'],
    registers: [register],
  }),
  apiLatency: new client.Histogram({
    name: 'darevel_chat_email_api_latency_seconds',
    help: 'Latency of email service API calls in seconds',
    buckets: [0.5, 1, 2, 5, 10],
    registers: [register],
  }),
};

/**
 * Alert Metrics
 */
export const alertMetrics = {
  triggered: new client.Counter({
    name: 'darevel_chat_alerts_triggered_total',
    help: 'Total number of alerts triggered',
    labelNames: ['severity', 'type'],
    registers: [register],
  }),
  resolved: new client.Counter({
    name: 'darevel_chat_alerts_resolved_total',
    help: 'Total number of alerts resolved',
    labelNames: ['type'],
    registers: [register],
  }),
};

/**
 * Incident Metrics
 */
export const incidentMetrics = {
  created: new client.Counter({
    name: 'darevel_chat_incidents_created_total',
    help: 'Total number of incidents created',
    labelNames: ['severity', 'namespace'],
    registers: [register],
  }),
  mttr: new client.Histogram({
    name: 'darevel_chat_incident_mttr_seconds',
    help: 'Mean Time To Recovery for incidents in seconds',
    labelNames: ['severity'],
    buckets: [60, 300, 600, 1800, 3600, 7200, 14400],
    registers: [register],
  }),
};

/**
 * WebSocket Metrics
 */
export const websocketMetrics = {
  connections: new client.Gauge({
    name: 'darevel_chat_websocket_connections',
    help: 'Current number of WebSocket connections',
    registers: [register],
  }),
  messagesReceived: new client.Counter({
    name: 'darevel_chat_websocket_messages_received_total',
    help: 'Total number of WebSocket messages received',
    registers: [register],
  }),
  messagesSent: new client.Counter({
    name: 'darevel_chat_websocket_messages_sent_total',
    help: 'Total number of WebSocket messages sent',
    labelNames: ['event'],
    registers: [register],
  }),
};
