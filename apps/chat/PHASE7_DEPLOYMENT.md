# Phase 7: Production Deployment Guide

Complete deployment setup for Whooper Kubernetes Dashboard with Docker, Kubernetes, and CI/CD automation.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Local Development with Docker](#local-development-with-docker)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [CI/CD with GitHub Actions](#cicd-with-github-actions)
5. [Configuration & Secrets](#configuration--secrets)
6. [Monitoring & Health Checks](#monitoring--health-checks)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Services

**2-Service Architecture:**
- **Frontend**: React + Vite app served via Nginx
- **Backend**: Express TypeScript API with Kubernetes client

**External Dependencies:**
- Email Assistant (configured via `EMAIL_APP_URL`)
- Gemini AI API (configured via `GEMINI_API_KEY`)
- Kubernetes Cluster (in-cluster or external)

### Network Flow

```
User Browser → Frontend (nginx:80) → Backend (node:5001) → Kubernetes API
                                   ↓
                                Gemini API
                                   ↓
                              Email Service
```

---

## Local Development with Docker

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Kubernetes cluster access (optional for full functionality)

### Step 1: Environment Configuration

Create a `.env` file in the project root:

```bash
# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Email Service Configuration (optional)
EMAIL_APP_URL=http://your-email-service:6000/api/send
DEFAULT_EMAIL_RECIPIENT=admin@example.com
ALERT_EMAIL=alerts@example.com

# Kubernetes Configuration
K8S_NAMESPACE=default
KUBECONFIG_PATH=/path/to/kubeconfig

# Backend Configuration
PORT=5001
NODE_ENV=development
```

### Step 2: Build and Run with Docker Compose

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Step 3: Access the Application

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

### Docker Commands Reference

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Restart specific service
docker-compose restart backend

# View service status
docker-compose ps

# Execute command in running container
docker-compose exec backend sh
docker-compose exec frontend sh

# Remove all containers and volumes
docker-compose down -v
```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Container registry access (Docker Hub, GHCR, etc.)
- Ingress controller (nginx, traefik, etc.)

### Step 1: Build and Push Docker Images

```bash
# Set your registry
export REGISTRY="ghcr.io/your-username"

# Build backend
cd backend
docker build -t $REGISTRY/whooper-backend:latest .
docker push $REGISTRY/whooper-backend:latest

# Build frontend
cd ..
docker build -t $REGISTRY/whooper-frontend:latest .
docker push $REGISTRY/whooper-frontend:latest
```

### Step 2: Configure Kubernetes Secrets

```bash
# Create namespace
kubectl create namespace whooper

# Create secrets (base64 encoding)
kubectl create secret generic whooper-backend-secrets \
  --from-literal=GEMINI_API_KEY="your-gemini-api-key" \
  --from-literal=EMAIL_APP_URL="http://email-service:6000/api/send" \
  --from-literal=DEFAULT_EMAIL_RECIPIENT="admin@example.com" \
  --namespace=whooper
```

**Alternative: Using a secrets file**

Create `secrets.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: whooper-backend-secrets
  namespace: whooper
type: Opaque
stringData:
  GEMINI_API_KEY: "your-gemini-api-key"
  EMAIL_APP_URL: "http://email-service:6000/api/send"
  DEFAULT_EMAIL_RECIPIENT: "admin@example.com"
```

Apply:
```bash
kubectl apply -f secrets.yaml
```

### Step 3: Update Image References

Edit `k8s/whooper-deployment.yaml` and replace:

```yaml
# Line 92 - Backend image
image: your-registry.io/whooper-backend:latest
# Change to:
image: ghcr.io/your-username/whooper-backend:latest

# Line 219 - Frontend image
image: your-registry.io/whooper-frontend:latest
# Change to:
image: ghcr.io/your-username/whooper-frontend:latest
```

### Step 4: Update Ingress Domains

Edit `k8s/whooper-deployment.yaml` lines 309-324:

```yaml
spec:
  rules:
    - host: whooper.yourdomain.com  # Replace with your domain
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: whooper-frontend
                port:
                  number: 80
    - host: whooper-api.yourdomain.com  # Replace with your API domain
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: whooper-backend
                port:
                  number: 5001
```

### Step 5: Deploy to Kubernetes

```bash
# Apply all resources
kubectl apply -f k8s/whooper-deployment.yaml

# Verify deployment
kubectl get all -n whooper

# Check pod status
kubectl get pods -n whooper

# View logs
kubectl logs -f deployment/whooper-backend -n whooper
kubectl logs -f deployment/whooper-frontend -n whooper
```

### Step 6: Verify Services

```bash
# Check services
kubectl get svc -n whooper

# Check ingress
kubectl get ingress -n whooper

# Port-forward for local testing (if ingress not ready)
kubectl port-forward svc/whooper-frontend 8080:80 -n whooper
kubectl port-forward svc/whooper-backend 5001:5001 -n whooper
```

### Kubernetes Commands Reference

```bash
# Scale deployment
kubectl scale deployment whooper-backend --replicas=3 -n whooper

# Restart deployment (rolling restart)
kubectl rollout restart deployment/whooper-backend -n whooper

# Check rollout status
kubectl rollout status deployment/whooper-backend -n whooper

# Rollback to previous version
kubectl rollout undo deployment/whooper-backend -n whooper

# View pod details
kubectl describe pod <pod-name> -n whooper

# Execute command in pod
kubectl exec -it <pod-name> -n whooper -- sh

# View HPA status
kubectl get hpa -n whooper
```

---

## CI/CD with GitHub Actions

### Prerequisites

- GitHub repository
- Container registry (GitHub Container Registry recommended)
- Kubernetes cluster with kubeconfig

### Step 1: Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `GEMINI_API_KEY` | Gemini AI API key | `AIzaSy...` |
| `EMAIL_APP_URL` | Email service URL | `http://email:6000/api/send` |
| `DEFAULT_EMAIL_RECIPIENT` | Default email recipient | `admin@example.com` |
| `KUBECONFIG` | Base64-encoded kubeconfig for production | `cat ~/.kube/config \| base64` |
| `KUBECONFIG_STAGING` | Base64-encoded kubeconfig for staging | `cat ~/.kube/staging-config \| base64` |

### Step 2: Enable GitHub Container Registry

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Enable package permissions
# Go to Settings → Actions → General → Workflow permissions
# Select "Read and write permissions"
```

### Step 3: Workflow Triggers

The CI/CD pipeline triggers on:

- **Push to main**: Build, test, push images, deploy to production
- **Push to develop**: Build, test, push images, deploy to staging
- **Pull requests**: Build and test only

### Step 4: Pipeline Stages

1. **Build & Test Backend**
   - Checkout code
   - Install dependencies
   - Run linter
   - Build TypeScript
   - Run tests

2. **Build & Test Frontend**
   - Checkout code
   - Install dependencies
   - Run linter
   - Build Vite app
   - Run tests

3. **Build & Push Docker Images** (on push to main/develop)
   - Build backend & frontend images
   - Tag with branch name and commit SHA
   - Push to GitHub Container Registry
   - Use Docker layer caching for speed

4. **Deploy to Kubernetes** (on push to main)
   - Configure kubectl
   - Update Kubernetes secrets
   - Update deployment images
   - Wait for rollout
   - Verify deployment

### Step 5: Monitor Deployments

View workflow runs:
- Go to your repository → Actions tab
- Click on a workflow run to see details
- Review logs for each job

### Manual Deployment

Trigger deployment manually:

```bash
# From GitHub UI
Actions → CI/CD Pipeline → Run workflow → Select branch

# Or using GitHub CLI
gh workflow run deploy.yml --ref main
```

---

## Configuration & Secrets

### Backend Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Environment mode | `production` |
| `PORT` | No | Backend port | `5001` |
| `GEMINI_API_KEY` | Yes* | Gemini AI API key | - |
| `EMAIL_APP_URL` | No | Email service endpoint | - |
| `DEFAULT_EMAIL_RECIPIENT` | No | Default email recipient | - |
| `ALERT_EMAIL` | No | Alert email recipient | - |
| `K8S_NAMESPACE` | No | Kubernetes namespace to monitor | `default` |

\* Required for AI features (summary generation, subject suggestions)

### Frontend Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `VITE_BACKEND_URL` | Yes | Backend API URL | `http://localhost:5001` |

### Secrets Management Best Practices

1. **Never commit secrets** to version control
2. **Use Kubernetes Secrets** for production
3. **Use .env files** for local development (add to .gitignore)
4. **Rotate secrets** regularly
5. **Use secret management tools** (Vault, Sealed Secrets) for production

### Creating Secrets Securely

```bash
# Generate base64 for Kubernetes secrets
echo -n "your-secret-value" | base64

# Create secret from file
kubectl create secret generic whooper-backend-secrets \
  --from-env-file=.env.production \
  --namespace=whooper

# Update existing secret
kubectl create secret generic whooper-backend-secrets \
  --from-literal=GEMINI_API_KEY="new-value" \
  --namespace=whooper \
  --dry-run=client -o yaml | kubectl apply -f -
```

---

## Monitoring & Health Checks

### Health Check Endpoints

- **Backend**: `GET /api/health`
  - Returns 200 if healthy
  - Checks: API responsiveness

- **Frontend**: `GET /health`
  - Returns 200 if healthy
  - Checks: Nginx responsiveness

### Kubernetes Health Checks

Both frontend and backend have configured:

**Liveness Probes**: Restart pod if unhealthy
- Backend: HTTP GET `/api/health` on port 5001
- Frontend: HTTP GET `/health` on port 80

**Readiness Probes**: Remove from service if not ready
- Same endpoints as liveness probes

### Monitoring Commands

```bash
# Check pod health
kubectl get pods -n whooper
kubectl describe pod <pod-name> -n whooper

# View pod logs
kubectl logs -f <pod-name> -n whooper
kubectl logs --tail=100 <pod-name> -n whooper

# View events
kubectl get events -n whooper --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n whooper
kubectl top nodes

# View HPA metrics
kubectl get hpa -n whooper
kubectl describe hpa whooper-backend-hpa -n whooper
```

### Auto-Scaling

**Backend HPA**:
- Min replicas: 2
- Max replicas: 10
- CPU target: 70%
- Memory target: 80%

**Frontend HPA**:
- Min replicas: 2
- Max replicas: 5
- CPU target: 70%

### Resource Limits

**Backend**:
- Requests: 256Mi memory, 200m CPU
- Limits: 512Mi memory, 500m CPU

**Frontend**:
- Requests: 128Mi memory, 100m CPU
- Limits: 256Mi memory, 300m CPU

---

## Troubleshooting

### Common Issues

#### 1. Backend Can't Connect to Kubernetes API

**Symptoms**:
```
Error: Unable to connect to Kubernetes cluster
```

**Solutions**:
```bash
# Check RBAC permissions
kubectl get clusterrolebinding whooper-pod-reader-binding

# Verify ServiceAccount
kubectl get serviceaccount whooper-backend -n whooper

# Check pod has correct ServiceAccount
kubectl get pod <pod-name> -n whooper -o yaml | grep serviceAccount

# Test in-cluster access
kubectl exec -it <backend-pod> -n whooper -- sh
# Inside pod:
curl https://kubernetes.default.svc/api/v1/pods
```

#### 2. Frontend Can't Connect to Backend

**Symptoms**:
```
Failed to fetch from backend API
```

**Solutions**:
```bash
# Check backend service
kubectl get svc whooper-backend -n whooper

# Check if backend pods are ready
kubectl get pods -n whooper -l component=backend

# Verify frontend environment variable
kubectl exec -it <frontend-pod> -n whooper -- env | grep VITE_BACKEND_URL

# Port-forward for testing
kubectl port-forward svc/whooper-backend 5001:5001 -n whooper
```

#### 3. Gemini API Not Working

**Symptoms**:
```
Summary generation failed
AI subject suggestions not working
```

**Solutions**:
```bash
# Check if secret exists
kubectl get secret whooper-backend-secrets -n whooper

# Verify secret contents (base64 encoded)
kubectl get secret whooper-backend-secrets -n whooper -o yaml

# Check pod environment
kubectl exec -it <backend-pod> -n whooper -- env | grep GEMINI

# Test Gemini API manually
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

#### 4. Email Sending Fails

**Symptoms**:
```
Failed to send email
Email service not configured
```

**Solutions**:
```bash
# Check EMAIL_APP_URL secret
kubectl get secret whooper-backend-secrets -n whooper -o jsonpath='{.data.EMAIL_APP_URL}' | base64 -d

# Verify email service is accessible
kubectl exec -it <backend-pod> -n whooper -- sh
# Inside pod:
curl -X POST $EMAIL_APP_URL -H "Content-Type: application/json" -d '{"test":"data"}'

# Check backend logs for email errors
kubectl logs -f deployment/whooper-backend -n whooper | grep -i email
```

#### 5. Image Pull Errors

**Symptoms**:
```
ImagePullBackOff
ErrImagePull
```

**Solutions**:
```bash
# Check image name and tag
kubectl describe pod <pod-name> -n whooper | grep Image

# Verify registry access
docker pull ghcr.io/your-username/whooper-backend:latest

# Create image pull secret if using private registry
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=your-username \
  --docker-password=your-token \
  --namespace=whooper

# Add to deployment spec
spec:
  imagePullSecrets:
    - name: regcred
```

#### 6. Pods Crashing (CrashLoopBackOff)

**Symptoms**:
```
CrashLoopBackOff
Error: Container exited with code 1
```

**Solutions**:
```bash
# View pod logs
kubectl logs <pod-name> -n whooper
kubectl logs <pod-name> -n whooper --previous  # Previous container instance

# Check pod events
kubectl describe pod <pod-name> -n whooper

# Check if health checks are too aggressive
kubectl get pod <pod-name> -n whooper -o yaml | grep -A 10 livenessProbe

# Temporarily disable health checks for debugging
kubectl patch deployment whooper-backend -n whooper --type=json \
  -p='[{"op": "remove", "path": "/spec/template/spec/containers/0/livenessProbe"}]'
```

### Debugging Commands

```bash
# Get all resources in namespace
kubectl get all -n whooper

# Describe all resources
kubectl describe all -n whooper

# View recent events
kubectl get events -n whooper --sort-by='.lastTimestamp' | tail -20

# Check resource quotas
kubectl get resourcequota -n whooper

# View network policies
kubectl get networkpolicies -n whooper

# Check DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -n whooper -- nslookup whooper-backend
```

### Performance Optimization

```bash
# Analyze pod resource usage
kubectl top pods -n whooper --sort-by=memory
kubectl top pods -n whooper --sort-by=cpu

# Check HPA recommendations
kubectl describe hpa -n whooper

# View pod resource requests vs limits
kubectl get pods -n whooper -o custom-columns=NAME:.metadata.name,CPU_REQ:.spec.containers[0].resources.requests.cpu,CPU_LIM:.spec.containers[0].resources.limits.cpu,MEM_REQ:.spec.containers[0].resources.requests.memory,MEM_LIM:.spec.containers[0].resources.limits.memory
```

---

## Next Steps

1. **Set up monitoring** with Prometheus + Grafana
2. **Configure logging** with ELK stack or Loki
3. **Add SSL/TLS** with cert-manager and Let's Encrypt
4. **Implement backups** for critical data
5. **Set up disaster recovery** procedures
6. **Configure alerts** for critical events
7. **Perform load testing** to validate auto-scaling

---

## Summary

You now have a complete production-ready deployment setup:

- **Local development** with Docker Compose
- **Kubernetes deployment** with RBAC, secrets, and auto-scaling
- **CI/CD automation** with GitHub Actions
- **Health checks** and monitoring
- **Troubleshooting guide** for common issues

For questions or issues, refer to the troubleshooting section or check the deployment logs.
