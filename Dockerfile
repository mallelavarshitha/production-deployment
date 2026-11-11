# ==============================================================================
# Multi-stage Dockerfile for Kubernetes Deployment
# Builds React frontend and bundles with FastAPI backend
# ==============================================================================

# Stage 1: Build React Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend with bundled UI
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/app ./app

# Copy compiled frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./static

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
