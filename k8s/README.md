# Kubernetes (k8s) Deployment

This directory contains all Kubernetes manifests for deploying the **Task Management Dashboard** into Minikube or any Kubernetes cluster.

## 📁 Manifests

| File | Description |
|------|-------------|
| `postgres-secret.yaml` | Secret with base64-encoded PostgreSQL credentials |
| `postgres-pvc.yaml` | PersistentVolumeClaim (1Gi) for PostgreSQL data |
| `postgres.yaml` | PostgreSQL 16 Deployment + ClusterIP Service |
| `deployment.yaml` | Task app Deployment (2 replicas) with init container |
| `service.yaml` | NodePort Service exposing the app on port 30080 |

## 🏗️ Architecture

```
                    ┌─────────────────────────────────┐
                    │         Kubernetes Cluster        │
                    │                                   │
  Browser ──30080──►│  task-app-service (NodePort)      │
                    │       ↓ port 80→8000              │
                    │  ┌─────────────────────────┐      │
                    │  │  task-app Pods (x2)      │      │
                    │  │  mallelavarshitha/        │      │
                    │  │  task-manager-app:latest  │      │
                    │  └───────────┬─────────────┘      │
                    │              │ DATABASE_URL        │
                    │  ┌───────────▼─────────────┐      │
                    │  │  postgres-service (5432) │      │
                    │  │  ↓                       │      │
                    │  │  postgres-deployment      │      │
                    │  │  postgres:16-alpine       │      │
                    │  └───────────┬─────────────┘      │
                    │              │ mounted             │
                    │  ┌───────────▼─────────────┐      │
                    │  │  postgres-pvc (1Gi)      │      │
                    │  └─────────────────────────┘      │
                    └─────────────────────────────────────┘
```

## 🚀 Deployment Steps

### Prerequisites
- Docker Desktop running
- Minikube installed (`winget install Kubernetes.minikube`)
- kubectl installed

### Step 1 — Start Minikube
```powershell
minikube start --driver=docker
```

### Step 2 — Apply all manifests
```powershell
kubectl apply -f k8s/
```

### Step 3 — Verify everything is running
```powershell
# Check pods (wait for all to be Running)
kubectl get pods -w

# Check services
kubectl get svc

# Check persistent volume claims
kubectl get pvc
```

### Step 4 — Open the app in browser
```powershell
minikube service task-app-service
```

Or access directly at: `http://$(minikube ip):30080`

## 🛠️ Useful Commands

```powershell
# View logs for the app
kubectl logs -l app=task-app,component=backend -f

# View logs for PostgreSQL
kubectl logs -l app=task-app,component=database -f

# Scale the app deployment
kubectl scale deployment task-app-deployment --replicas=3

# Check resource usage
kubectl top pods

# Delete all resources
kubectl delete -f k8s/

# Restart the app deployment
kubectl rollout restart deployment/task-app-deployment
```

## 🔄 Update the Docker Image

If you rebuild the Docker image and push to Docker Hub:

```powershell
# Build and push
docker build -t mallelavarshitha/task-manager-app:latest .
docker push mallelavarshitha/task-manager-app:latest

# Pull into minikube and restart
minikube image load mallelavarshitha/task-manager-app:latest
kubectl rollout restart deployment/task-app-deployment
```

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Pods stuck in `Pending` | `kubectl describe pod <pod-name>` to see events |
| `ImagePullBackOff` | Build the image first: `docker build -t mallelavarshitha/task-manager-app:latest .` then `minikube image load mallelavarshitha/task-manager-app:latest` |
| `CrashLoopBackOff` | Check logs: `kubectl logs <pod-name>` |
| Minikube fails to start | `minikube delete` then `minikube start --driver=docker` |
| Cannot connect to cluster | Ensure `kubectl config use-context minikube` |
