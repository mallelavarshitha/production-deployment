#!/usr/bin/env bash
# ==============================================================================
# AWS EC2 Docker Host Deployment Script
# Project 20: Production Deployment (Python Stack)
# ==============================================================================

set -e

echo "=== [1/5] Updating system packages ==="
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

echo "=== [2/5] Installing Docker Engine & Docker Compose Plugin ==="
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Enable non-root docker usage for ubuntu user
    sudo usermod -aG docker "$USER"
    sudo systemctl enable docker
    sudo systemctl start docker
    echo "Docker installed successfully!"
else
    echo "Docker is already installed."
fi

echo "=== [3/5] Verifying SSL certificates for Nginx ==="
mkdir -p nginx/ssl
if [ ! -f nginx/ssl/nginx.crt ] || [ ! -f nginx/ssl/nginx.key ]; then
    echo "Generating self-signed SSL certificates for HTTPS..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/nginx.key \
        -out nginx/ssl/nginx.crt \
        -subj "/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    echo "SSL certificates generated in nginx/ssl/"
else
    echo "SSL certificates already exist."
fi

echo "=== [4/5] Preparing Environment File ==="
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "=== [5/5] Building and Starting Containers via Docker Compose ==="
sudo docker compose down || true
sudo docker compose up -d --build

echo ""
echo "=============================================================================="
echo " Deployment Complete!"
echo " Containers running:"
sudo docker compose ps
echo "=============================================================================="
echo "Access your application at:"
echo "  HTTP:  http://$(curl -s http://checkip.amazonaws.com || echo '<EC2-PUBLIC-IP>')"
echo "  HTTPS: https://$(curl -s http://checkip.amazonaws.com || echo '<EC2-PUBLIC-IP>')"
echo "  Health: http://$(curl -s http://checkip.amazonaws.com || echo '<EC2-PUBLIC-IP>')/api/health"
echo "=============================================================================="
