# Kubernetes (k8s) Deployment

This directory contains the Kubernetes manifests for deploying the Task Management application into **Minikube** or any Kubernetes cluster.

## Manifests

- **`deployment.yaml`**: Deploys 2 replicas of the application using the Docker Hub image `mallelavarshitha/task-manager-app:latest` with health checks and resource limits.
- **`service.yaml`**: Exposes the application using a `NodePort` service on port `80` (NodePort `30080`).

## Deployment Commands

```bash
# 1. Apply all manifests in this folder:
kubectl apply -f k8s/

# 2. Check pod and service status:
kubectl get pods
kubectl get svc

# 3. Access the service in Minikube:
minikube service task-app-service
```
