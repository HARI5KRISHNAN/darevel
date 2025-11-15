# Phase 9: Monitoring & Alerting System

Complete monitoring infrastructure for Whooper Kubernetes Dashboard with Prometheus metrics, Grafana dashboards, and automated email alerting.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Metrics Collected](#metrics-collected)
4. [Setup Guide](#setup-guide)
5. [Alert Configuration](#alert-configuration)
6. [Grafana Dashboard](#grafana-dashboard)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Phase 9 transforms Whooper into a self-monitoring platform with:

- **Real-time metrics collection** via Prometheus
- **Visual dashboards** in Grafana
- **Automated alerting** via email when issues occur
- **Custom metrics** for pods, requests, AI calls, and emails

### What Gets Monitored

| Category | Metrics |
|----------|---------|
| **Pods** | Total, Running, Pending, Failed pods |
| **HTTP** | Request count, latency, status codes |
| **AI Service** | Summary requests, subject suggestions, API latency |
| **Email** | Emails sent, failed, API latency |
| **Alerts** | Triggered, resolved by severity |
| **Incidents** | Created, MTTR by severity |
| **WebSocket** | Active connections, messages sent/received |
| **System** | CPU usage, memory, event loop lag |

### Alert Conditions

Alerts fire when:
- A pod crashes or goes into failed state
- CPU/memory usage exceeds 80-90%
- HTTP error rate > 5%
- Request latency > 5 seconds
- Gemini API errors
- Email service failures
- High incident creation rate

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Whooper    │         │   Whooper    │                 │
│  │   Backend    │         │   Frontend   │                 │
│  │              │         │              │                 │
│  │  /metrics    │         │              │                 │
│  │  endpoint    │         │              │                 │
│  └──────┬───────┘         └──────────────┘                 │
│         │                                                   │
│         │ Scrape metrics every 15s                         │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │  Prometheus  │◄────── ServiceMonitor                    │
│  │              │                                          │
│  │  - Collect   │                                          │
│  │  - Store     │                                          │
│  │  - Query     │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         │ Evaluate alert rules every 30s                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │ AlertManager │                                          │
│  │              │                                          │
│  │  - Route     │                                          │
│  │  - Group     │                                          │
│  │  - Dedupe    │                                          │
│  └──────┬───────┘                                          │
│         │                                                   │
│         │ Webhook to backend                               │
│         ▼                                                   │
│  ┌──────────────┐       ┌──────────────┐                  │
│  │   Whooper    │──────►│    Email     │                  │
│  │   Backend    │       │  Assistant   │                  │
│  │ /api/alerts/ │       │              │                  │
│  │   webhook    │       │              │                  │
│  └──────────────┘       └──────────────┘                  │
│         │                       │                          │
│         └───────────────────────┘                          │
│                    │                                        │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ▼
            📧 Email to Admin
```

---

## Metrics Collected

### Application Metrics

The backend exposes metrics at `GET /metrics` endpoint.

**Pod Metrics:**
```
whooper_pods_total           # Total pods monitored
whooper_pods_running         # Pods in Running state
whooper_pods_pending         # Pods in Pending state
whooper_pods_failed          # Pods in Failed state
```

**HTTP Metrics:**
```
whooper_http_requests_total{method,route,status}       # Request counter
whooper_http_request_duration_seconds{method,route}    # Request latency histogram
```

**AI Service Metrics:**
```
whooper_ai_summary_requests_total{status}                    # Summary generation requests
whooper_ai_subject_suggestion_requests_total{status,type}    # Subject suggestion requests
whooper_ai_api_latency_seconds{operation}                    # Gemini API latency
```

**Email Metrics:**
```
whooper_emails_sent_total{type,status}    # Emails sent/failed
whooper_email_api_latency_seconds         # Email API latency
```

**Alert Metrics:**
```
whooper_alerts_triggered_total{severity,type}    # Alerts triggered
whooper_alerts_resolved_total{type}              # Alerts resolved
```

**Incident Metrics:**
```
whooper_incidents_created_total{severity,namespace}    # Incidents created
whooper_incident_mttr_seconds{severity}                # Mean Time To Recovery
```

**WebSocket Metrics:**
```
whooper_websocket_connections               # Active WebSocket connections
whooper_websocket_messages_received_total   # Messages received
whooper_websocket_messages_sent_total       # Messages sent by event type
```

### Default Node.js Metrics

Automatically collected by prom-client:

```
whooper_process_cpu_user_seconds_total      # CPU time in user mode
whooper_process_cpu_system_seconds_total    # CPU time in system mode
whooper_process_resident_memory_bytes       # Resident memory
whooper_nodejs_heap_size_total_bytes        # Heap size
whooper_nodejs_heap_size_used_bytes         # Used heap
whooper_nodejs_eventloop_lag_seconds        # Event loop lag
whooper_nodejs_gc_duration_seconds          # Garbage collection duration
```

---

## Setup Guide

### Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Helm 3.x
- Whooper backend deployed (Phase 7)

### Step 1: Install Prometheus Operator Stack

Using Helm (recommended):

```bash
# Add Prometheus community Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack (includes Prometheus, Grafana, AlertManager)
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.ruleSelectorNilUsesHelmValues=false
```

This installs:
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization dashboards
- **AlertManager**: Alert routing and notification
- **Node Exporter**: Node-level metrics
- **Kube State Metrics**: Kubernetes object metrics
- **Prometheus Operator**: Manages Prometheus instances

### Step 2: Deploy Whooper Monitoring Configuration

```bash
# Apply ServiceMonitor to scrape Whooper metrics
kubectl apply -f k8s/monitoring/servicemonitor.yaml

# Apply Prometheus alert rules
kubectl apply -f k8s/monitoring/prometheus-rules.yaml

# Apply AlertManager configuration
kubectl apply -f k8s/monitoring/alertmanager-config.yaml
```

### Step 3: Configure AlertManager to Use Whooper Secret

Update the AlertManager to use the custom configuration:

```bash
# Get the AlertManager secret name
kubectl get secret -n monitoring | grep alertmanager

# Patch AlertManager to use our configuration
kubectl patch alertmanager prometheus-kube-prometheus-alertmanager \
  -n monitoring \
  --type merge \
  -p '{"spec":{"configSecret":"alertmanager-whooper"}}'
```

Or create a ConfigMap if using ConfigMap-based config:

```bash
kubectl create configmap alertmanager-whooper \
  --from-file=alertmanager.yaml=k8s/monitoring/alertmanager-config.yaml \
  --namespace=monitoring \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Step 4: Import Grafana Dashboard

#### Option A: Via Grafana UI

1. Access Grafana:
```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

2. Open http://localhost:3000
3. Login (default: admin / prom-operator)
4. Go to **Dashboards** → **Import**
5. Upload `k8s/monitoring/grafana-dashboard.json`

#### Option B: Via ConfigMap

```bash
kubectl create configmap whooper-dashboard \
  --from-file=whooper-dashboard.json=k8s/monitoring/grafana-dashboard.json \
  --namespace=monitoring

kubectl label configmap whooper-dashboard \
  --namespace=monitoring \
  grafana_dashboard=1
```

### Step 5: Configure Email Recipients

Update the backend secret with alert email recipients:

```bash
kubectl create secret generic whooper-backend-secrets \
  --from-literal=GEMINI_API_KEY="your-key" \
  --from-literal=EMAIL_APP_URL="your-email-service-url" \
  --from-literal=DEFAULT_EMAIL_RECIPIENT="admin@example.com" \
  --from-literal=ALERT_EMAIL="alerts@example.com" \
  --namespace=whooper \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Step 6: Restart Backend to Load Metrics

```bash
kubectl rollout restart deployment/whooper-backend -n whooper
```

### Step 7: Verify Setup

```bash
# Check if metrics endpoint is accessible
kubectl port-forward -n whooper svc/whooper-backend 5001:5001
curl http://localhost:5001/metrics

# Check if ServiceMonitor is discovered
kubectl get servicemonitor -n whooper

# Check Prometheus targets (should see whooper-backend)
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Open http://localhost:9090/targets

# Check AlertManager config
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-alertmanager 9093:9093
# Open http://localhost:9093/#/status
```

---

## Alert Configuration

### Alert Rules Overview

Alerts are defined in [k8s/monitoring/prometheus-rules.yaml](k8s/monitoring/prometheus-rules.yaml).

**Application Alerts:**
- `WhooperBackendDown` - Backend service is down for 2+ minutes
- `WhooperHighErrorRate` - >5% of requests returning 5xx errors
- `WhooperSlowRequests` - p95 latency >5 seconds
- `WhooperHighMemoryUsage` - Memory usage >90%
- `WhooperHighCPUUsage` - CPU usage >80% for 5 minutes

**Kubernetes Alerts:**
- `PodDown` - Pod in Failed state
- `PodCrashLooping` - Pod restarting frequently
- `PodPending` - Pod stuck in Pending for 10+ minutes
- `HighPodMemory` - Pod using >90% of memory limit
- `HighPodCPU` - Pod using >90% CPU for 10 minutes

**AI Service Alerts:**
- `GeminiAPIErrors` - High error rate from Gemini API
- `SlowAIResponses` - p95 AI latency >10 seconds

**Email Service Alerts:**
- `EmailServiceUnreachable` - >50% of emails failing

**Incident Alerts:**
- `HighIncidentRate` - >5 incidents per 15 minutes
- `HighMTTR` - p95 MTTR >1 hour for critical incidents

### Alert Routing

Alerts are routed based on severity:

| Severity | Receiver | Group Wait | Repeat Interval |
|----------|----------|------------|-----------------|
| Critical | whooper-email-critical | 10s | 1h |
| Warning | whooper-email-warning | 1m | 4h |
| Pod Failures | whooper-email-pod-alerts | 30s | 2h |

### Inhibition Rules

- Warning alerts suppressed if critical alert firing for same pod
- High CPU/memory alerts suppressed if pod is down

### Customizing Alerts

Edit [k8s/monitoring/prometheus-rules.yaml](k8s/monitoring/prometheus-rules.yaml):

```yaml
- alert: CustomAlert
  expr: your_metric > threshold
  for: 5m
  labels:
    severity: warning
    component: custom
  annotations:
    summary: "Your alert summary"
    description: "Detailed description"
    action: "What to do about it"
```

Apply changes:
```bash
kubectl apply -f k8s/monitoring/prometheus-rules.yaml
```

---

## Grafana Dashboard

### Dashboard Panels

The Whooper dashboard includes:

**Row 1: Pod Status Overview (Stats)**
- Total Pods Monitored
- Running Pods (green)
- Pending Pods (yellow/orange)
- Failed Pods (red)

**Row 2: Time Series Graphs**
- Pod Status Over Time (line chart)
- HTTP Requests by Status Code (line chart)

**Row 3: Resource Usage**
- Whooper Pod Memory Usage (line chart with mean/max)
- Whooper Pod CPU Usage (line chart with mean/max)

**Row 4: Performance**
- HTTP Request Latency p50/p95 (line chart)
- Email Send Rate (line chart)

**Row 5: Alerts**
- Alert Trigger Rate by Severity (bar chart)

### Auto-Refresh

Dashboard auto-refreshes every 10 seconds.

### Time Range

Default: Last 1 hour. Adjustable via time picker.

### Accessing Grafana

```bash
# Port forward
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Get admin password
kubectl get secret -n monitoring prometheus-grafana \
  -o jsonpath="{.data.admin-password}" | base64 -d; echo

# Open http://localhost:3000
# Login: admin / <password-from-above>
```

### Creating Custom Panels

1. Click **Add panel** → **Add new panel**
2. Enter PromQL query (e.g., `whooper_pods_total`)
3. Configure visualization (graph, stat, gauge, etc.)
4. Set thresholds and colors
5. Click **Apply**

Example queries:

```promql
# Pod count by status
whooper_pods_running
whooper_pods_failed

# Request rate
rate(whooper_http_requests_total[5m])

# Error rate percentage
(rate(whooper_http_requests_total{status=~"5.."}[5m])
/
rate(whooper_http_requests_total[5m])) * 100

# p95 latency
histogram_quantile(0.95,
  rate(whooper_http_request_duration_seconds_bucket[5m])
)

# Memory usage percentage
(container_memory_usage_bytes{pod=~"whooper-.*"}
/
container_spec_memory_limit_bytes{pod=~"whooper-.*"}) * 100
```

---

## Testing

### Test 1: Verify Metrics Endpoint

```bash
kubectl port-forward -n whooper svc/whooper-backend 5001:5001
curl http://localhost:5001/metrics
```

Expected: Prometheus metrics output with `whooper_` prefix.

### Test 2: Verify Prometheus Scraping

```bash
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
```

Open http://localhost:9090 and run query:
```promql
up{job="whooper-backend"}
```

Expected: `1` (service is up).

### Test 3: Trigger a Test Alert

Create a failing pod to trigger `PodDown` alert:

```bash
kubectl run test-fail --image=busybox --command -- /bin/sh -c "exit 1"
```

Wait 1-2 minutes, then check:

```bash
# Check Prometheus alerts
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Go to http://localhost:9090/alerts

# Check AlertManager
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-alertmanager 9093:9093
# Go to http://localhost:9093/#/alerts
```

Expected: `PodDown` alert firing.

### Test 4: Verify Email Notification

Check backend logs for alert webhook:

```bash
kubectl logs -n whooper -l app=whooper,component=backend --tail=50 -f
```

Look for:
```
Received 1 alert(s) from Prometheus AlertManager
Alert email sent: PodDown (firing)
```

Check your email inbox for alert notification.

### Test 5: Grafana Dashboard

```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

Open http://localhost:3000 and navigate to Whooper dashboard.

Expected: All panels showing data.

### Test 6: Simulate High Load

```bash
# Generate HTTP requests
for i in {1..100}; do
  kubectl port-forward -n whooper svc/whooper-backend 5001:5001 &
  curl http://localhost:5001/api/health
done
```

Check Grafana dashboard - request rate should spike.

### Test 7: Simulate High Error Rate

Modify backend temporarily to return errors, or call non-existent endpoints:

```bash
for i in {1..100}; do
  curl http://localhost:5001/api/nonexistent
done
```

Wait 5 minutes - `WhooperHighErrorRate` alert should fire.

---

## Troubleshooting

### Issue 1: Metrics Endpoint Not Working

**Symptoms:**
```
curl http://localhost:5001/metrics
# Returns 404 or error
```

**Solutions:**

```bash
# Check if prom-client is installed
cd backend && npm list prom-client

# Rebuild backend
npm run build

# Restart backend
kubectl rollout restart deployment/whooper-backend -n whooper

# Check logs for errors
kubectl logs -n whooper -l app=whooper,component=backend
```

### Issue 2: ServiceMonitor Not Discovered

**Symptoms:**
Prometheus targets page doesn't show whooper-backend.

**Solutions:**

```bash
# Check if ServiceMonitor exists
kubectl get servicemonitor -n whooper

# Check if labels match
kubectl get servicemonitor whooper-backend-monitor -n whooper -o yaml

# Check Prometheus ServiceMonitor selector
kubectl get prometheus -n monitoring prometheus-kube-prometheus-prometheus -o yaml | grep serviceMonitorSelector

# If using Helm, ensure serviceMonitorSelectorNilUsesHelmValues=false
helm upgrade prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --reuse-values \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

### Issue 3: Alerts Not Firing

**Symptoms:**
Conditions met but no alerts in AlertManager.

**Solutions:**

```bash
# Check if PrometheusRule is loaded
kubectl get prometheusrule -n whooper

# Check Prometheus rules
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Go to http://localhost:9090/rules

# Check rule syntax
kubectl describe prometheusrule whooper-alerts -n whooper

# Check Prometheus logs
kubectl logs -n monitoring -l app.kubernetes.io/name=prometheus
```

### Issue 4: Email Notifications Not Sent

**Symptoms:**
Alerts firing but no emails received.

**Solutions:**

```bash
# Check AlertManager configuration
kubectl get secret -n monitoring alertmanager-whooper -o yaml

# Check if webhook URL is correct
# Should be: http://whooper-backend.whooper.svc.cluster.local:5001/api/alerts/webhook

# Test webhook manually
kubectl run -it --rm curl --image=curlimages/curl --restart=Never -- \
  curl -X POST http://whooper-backend.whooper.svc.cluster.local:5001/api/alerts/webhook \
  -H "Content-Type: application/json" \
  -d '{"alerts":[{"status":"firing","labels":{"alertname":"Test"},"annotations":{"description":"Test alert"}}]}'

# Check backend logs
kubectl logs -n whooper -l app=whooper,component=backend | grep -i alert

# Verify email service configuration
kubectl exec -it -n whooper deployment/whooper-backend -- env | grep EMAIL
```

### Issue 5: Grafana Dashboard Not Showing Data

**Symptoms:**
Dashboard panels show "No data".

**Solutions:**

```bash
# Check if Prometheus datasource is configured
# Grafana UI → Configuration → Data Sources → Prometheus
# URL should be: http://prometheus-kube-prometheus-prometheus:9090

# Test query in Grafana Explore
# Run: whooper_pods_total

# Check if metrics are actually being scraped
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Go to http://localhost:9090/graph
# Query: whooper_pods_total

# Check time range (might be too far in past/future)
```

### Issue 6: High Memory Usage in Prometheus

**Symptoms:**
Prometheus pod using too much memory.

**Solutions:**

```bash
# Reduce retention period
helm upgrade prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --reuse-values \
  --set prometheus.prometheusSpec.retention=7d

# Increase memory limits
helm upgrade prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --reuse-values \
  --set prometheus.prometheusSpec.resources.limits.memory=4Gi

# Reduce scrape interval (less frequent scraping)
kubectl edit servicemonitor whooper-backend-monitor -n whooper
# Change interval: 15s → interval: 30s
```

### Common PromQL Errors

**Error: `parse error: unexpected character`**
- Check for unescaped special characters
- Use `\` to escape: `pod=~"whooper-.*"`

**Error: `vector cannot contain metrics with the same labelset`**
- Use `by` clause to group: `sum by (status) (metric)`

**Error: `many-to-many matching not allowed`**
- Add `on` or `ignoring` clause to binary operations

---

## Metrics Reference

### Query Examples

```promql
# Total pods
whooper_pods_total

# Failed pods
whooper_pods_failed

# Request rate (requests per second)
rate(whooper_http_requests_total[5m])

# Error rate percentage
(rate(whooper_http_requests_total{status=~"5.."}[5m])
/
rate(whooper_http_requests_total[5m])) * 100

# p95 latency
histogram_quantile(0.95,
  sum(rate(whooper_http_request_duration_seconds_bucket[5m])) by (le)
)

# Average latency
rate(whooper_http_request_duration_seconds_sum[5m])
/
rate(whooper_http_request_duration_seconds_count[5m])

# Email success rate
rate(whooper_emails_sent_total{status="sent"}[5m])
/
rate(whooper_emails_sent_total[5m])

# Alert rate by severity
sum by (severity) (rate(whooper_alerts_triggered_total[5m]))

# Active WebSocket connections
whooper_websocket_connections

# Memory usage
container_memory_usage_bytes{pod=~"whooper-.*"} / 1024 / 1024

# CPU usage
rate(container_cpu_usage_seconds_total{pod=~"whooper-.*"}[5m])
```

---

## Next Steps

After completing Phase 9, consider:

1. **Phase 10a: Auto-Healing**
   - Automatic pod restart on failure
   - AI-generated incident reports
   - Root cause analysis

2. **Phase 10b: Advanced Analytics**
   - Centralized analytics dashboard
   - Trend analysis and predictions
   - Capacity planning insights

3. **Monitoring Enhancements**
   - Slack/PagerDuty integration
   - Custom alert templates
   - SLA tracking and reporting
   - Distributed tracing with Jaeger

4. **Security Monitoring**
   - Pod security policy violations
   - Unauthorized access attempts
   - Certificate expiration alerts

---

## Summary

Phase 9 successfully implemented:

- **Prometheus metrics** - 30+ custom application metrics
- **ServiceMonitor** - Automatic scraping of Whooper backend
- **Alert rules** - 15+ predefined alert conditions
- **AlertManager** - Webhook integration with email notifications
- **Grafana dashboard** - 11-panel visualization
- **Email integration** - Beautiful HTML email alerts
- **Documentation** - Comprehensive setup and troubleshooting guide

Your Whooper dashboard is now a fully self-monitoring platform that alerts you when issues occur and provides real-time visibility into pod health, performance, and usage.
