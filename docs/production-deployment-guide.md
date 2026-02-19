# Production Deployment Guide — StreamSeek

> Step-by-step guide to deploy StreamSeek on a Linux VM instance with Docker, Nginx reverse proxy, and HTTPS via Let's Encrypt.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: VM Initial Setup](#step-1-vm-initial-setup)
4. [Step 2: Install Docker](#step-2-install-docker)
5. [Step 3: Clone the Repository](#step-3-clone-the-repository)
6. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
7. [Step 5: Obtain SSL Certificate (Let's Encrypt)](#step-5-obtain-ssl-certificate-lets-encrypt)
8. [Step 6: Build & Launch](#step-6-build--launch)
9. [Step 7: Verify Deployment](#step-7-verify-deployment)
10. [Maintenance & Operations](#maintenance--operations)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
Internet
   │
   ▼
:80 / :443  ──►  Nginx (reverse proxy + SSL termination)
                    │
                    ├── /api/*  ──►  backend:8000   (Express API)
                    │                    │
                    │                    ▼
                    │               mongodb:27017  (MongoDB 7, persistent volume)
                    │
                    └── /*      ──►  frontend:3000  (Next.js 16)
```

| Service | Image | Internal Port | External Port |
|---------|-------|---------------|---------------|
| **nginx** | `nginx:alpine` | 80, 443 | 80, 443 |
| **certbot** | `certbot/certbot` | — | — |
| **frontend** | Custom (Next.js) | 3000 | — (internal only) |
| **backend** | Custom (Express) | 8000 | — (internal only) |
| **mongodb** | `mongo:7` | 27017 | — (internal only) |

> Only Nginx is exposed to the internet. Frontend, backend, and MongoDB communicate over an internal Docker network (`app-network`).

---

## Prerequisites

### VM Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **OS** | Ubuntu 22.04+ / Debian 12+ | Ubuntu 24.04 LTS / Debian 12 |
| **RAM** | 2 GB | 4 GB |
| **Disk** | 20 GB | 40 GB (SSD) |
| **CPU** | 1 vCPU | 2 vCPUs |

### Domain & DNS

1. Register or own a domain (e.g., `sameersitre.dev`)
2. Create an **A record** pointing your subdomain to the VM's public IP:

```
streamseek.sameersitre.dev  →  A  →  <VM_PUBLIC_IP>
```

3. Wait for DNS propagation (usually 5–15 minutes, up to 48 hours)
4. Verify with:

```bash
dig streamseek.sameersitre.dev +short
# Should return your VM's public IP
```

### API Keys (have these ready)

| Key | Source |
|-----|--------|
| **TMDB API Key** | [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) |
| **Watchmode API Key** | [api.watchmode.com/requestApiKey](https://api.watchmode.com/requestApiKey) |
| **Auth.js Secret** | Generate with `openssl rand -base64 32` |
| **Google OAuth** | [console.cloud.google.com](https://console.cloud.google.com/) → Credentials |
| **GitHub OAuth** | [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps |

---

## Step 1: VM Initial Setup

### 1.1 SSH into your VM

```bash
ssh root@<VM_PUBLIC_IP>
```

### 1.2 Update system packages

```bash
apt update && apt upgrade -y
```

### 1.3 Create a non-root user (optional but recommended)

```bash
adduser deploy
usermod -aG sudo deploy
```

Switch to the new user:

```bash
su - deploy
```

### 1.4 Configure firewall

**Ubuntu (UFW):**

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

**Debian (iptables — if UFW is not installed):**

```bash
# Option A: Install UFW on Debian
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Option B: Use iptables directly
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

Verify open ports:

```bash
sudo ufw status        # if using UFW
# or
sudo iptables -L -n    # if using iptables
```

---

## Step 2: Install Docker

### 2.1 Install Docker Engine (official apt repository)

```bash
# Remove any old versions
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null

# Install prerequisites
sudo apt update
sudo apt install -y ca-certificates curl gnupg

# Detect OS (works for both Ubuntu and Debian)
. /etc/os-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/$ID/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository (uses $ID = "ubuntu" or "debian" automatically)
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$ID \
  $VERSION_CODENAME stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 2.2 Allow non-root Docker access

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### 2.3 Verify installation

```bash
docker --version
# Docker version 27.x.x

docker compose version
# Docker Compose version v2.x.x

docker run hello-world
# Should print "Hello from Docker!"
```

---

## Step 3: Clone the Repository

### 3.1 Install Git (if not present)

```bash
sudo apt install -y git
```

### 3.2 Clone the project

```bash
cd ~
git clone https://github.com/sameersitre/streamseek.git
cd streamseek
```

### 3.3 Verify project structure

```bash
ls -la
# Should see: docker-compose.yml, nginx/, client/, server/, .env.example, etc.
```

---

## Step 4: Configure Environment Variables

### 4.1 Create the `.env` file

```bash
cp .env.example .env
nano .env
```

### 4.2 Fill in all values

```bash
# ─── Domain ────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://streamseek.sameersitre.dev/api/v2

# ─── Frontend (Auth.js) ──────────────────────────────
AUTH_SECRET=<generate-with: openssl rand -base64 32>
AUTH_GOOGLE_ID=<your-google-oauth-client-id>
AUTH_GOOGLE_SECRET=<your-google-oauth-client-secret>
AUTH_GITHUB_ID=<your-github-oauth-app-id>
AUTH_GITHUB_SECRET=<your-github-oauth-app-secret>

# ─── Backend (TMDB) ─────────────────────────────────
TMDB_URL=https://api.themoviedb.org/3
TMDB_API_KEY=<your-tmdb-bearer-token>

# ─── Backend (Watchmode — OTT streaming platforms) ──
WATCHMODE_API_KEY=<your-watchmode-api-key>
```

### 4.3 Secure the file

```bash
chmod 600 .env
```

> **Important**: Never commit `.env` to git. It's already in `.gitignore`.

---

## Step 5: Obtain SSL Certificate (Let's Encrypt)

Nginx needs SSL certificates to start, but certbot needs Nginx to validate the domain. We solve this chicken-and-egg problem by running certbot in standalone mode first.

### 5.1 Create certificate directories

```bash
mkdir -p nginx/certbot/conf
mkdir -p nginx/certbot/www
```

### 5.2 Run certbot standalone (first time only)

```bash
docker run --rm -it \
  -p 80:80 \
  -v $(pwd)/nginx/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/nginx/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
    --standalone \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d streamseek.sameersitre.dev
```

### 5.3 Verify certificates were created

```bash
ls nginx/certbot/conf/live/streamseek.sameersitre.dev/
# Should show: fullchain.pem  privkey.pem  cert.pem  chain.pem
```

> **Note**: Let's Encrypt certificates are valid for 90 days. The `certbot` service in docker-compose automatically handles renewal (runs `certbot renew` every 12 hours).

---

## Step 6: Build & Launch

### 6.1 Build and start all services

```bash
docker compose up --build -d
```

This will:
1. Build the **frontend** image (3-stage: deps → builder → runner, ~150MB)
2. Build the **backend** image (3-stage: deps → builder → runner, ~200MB)
3. Pull **nginx:alpine**, **certbot/certbot**, and **mongo:7**
4. Start all 5 services in dependency order: mongodb → backend → frontend → nginx + certbot

> First build takes 3–5 minutes depending on VM specs and network speed.

### 6.2 Check all services are running

```bash
docker compose ps
```

Expected output:

```
NAME         SERVICE     STATUS                   PORTS
backend      backend     Up (healthy)             8000/tcp
certbot      certbot     Up
frontend     frontend    Up (healthy)             3000/tcp
mongodb      mongodb     Up (healthy)             27017/tcp
nginx        nginx       Up                       0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

All services should show `Up`. Backend, frontend, and mongodb should show `(healthy)`.

### 6.3 Watch the build logs (optional)

```bash
# Follow all service logs
docker compose logs -f

# Follow a specific service
docker compose logs -f backend
```

---

## Step 7: Verify Deployment

### 7.1 Test HTTP → HTTPS redirect

```bash
curl -I http://streamseek.sameersitre.dev
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://streamseek.sameersitre.dev/
```

### 7.2 Test HTTPS frontend

```bash
curl -I https://streamseek.sameersitre.dev
# Should return: HTTP/2 200
```

### 7.3 Test API backend

```bash
curl https://streamseek.sameersitre.dev/api/v2/
# Should return a response from the Express health check
```

### 7.4 Test in browser

Open `https://streamseek.sameersitre.dev` in your browser. Verify:
- Home page loads with trending media
- SSL padlock icon shows in browser
- Detail pages load with "Where to Watch" section
- Search and filter work
- Google/GitHub login works (if OAuth is configured)

### 7.5 Check service health

```bash
# Container health status
docker compose ps

# Resource usage
docker stats --no-stream
```

---

## Maintenance & Operations

### View Logs

```bash
# All services
docker compose logs -f

# Specific service (last 100 lines)
docker compose logs -f --tail 100 backend

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

### Update the Application

When you push new code to the repository:

```bash
cd ~/streamseek

# Pull latest changes
git pull origin main

# Rebuild and restart (zero-downtime not guaranteed)
docker compose up --build -d

# Or rebuild a specific service
docker compose up --build -d frontend
```

### SSL Certificate Renewal

The `certbot` service in docker-compose runs `certbot renew` every 12 hours automatically. No manual intervention needed.

To manually check certificate expiry:

```bash
docker compose run --rm certbot certificates
```

To force a renewal test:

```bash
docker compose run --rm certbot renew --dry-run
```

### MongoDB Backup

```bash
# Create a backup
docker compose exec mongodb mongodump --db bingefeast --out /data/db/backup

# Copy backup to host
docker cp $(docker compose ps -q mongodb):/data/db/backup ./backup-$(date +%Y%m%d)
```

### MongoDB Restore

```bash
# Copy backup into container
docker cp ./backup-20260218 $(docker compose ps -q mongodb):/data/db/backup

# Restore
docker compose exec mongodb mongorestore --db bingefeast /data/db/backup/bingefeast
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend

# Full stop and start (if something is broken)
docker compose down && docker compose up -d
```

### Monitor Disk Space

```bash
# Check overall disk usage
df -h

# Check Docker disk usage
docker system df

# Clean up unused images and build cache
docker system prune -f

# Nuclear option — remove ALL unused data (images, containers, volumes, cache)
docker system prune -af --volumes
```

> **Warning**: `--volumes` will delete MongoDB data if the containers are stopped. Only use this if you have backups.

### View MongoDB Data

```bash
docker compose exec mongodb mongosh bingefeast

# Inside mongosh:
db.ott_streams.countDocuments()
db.counters.find()
show collections
```

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Nginx won't start | SSL certificates not found | Run Step 5 (certbot standalone) first |
| `ERR_CONNECTION_REFUSED` on :443 | Firewall blocking port | `sudo ufw allow 443/tcp` |
| Frontend shows blank page | `NEXT_PUBLIC_API_URL` wrong | Update `.env`, rebuild frontend: `docker compose up --build -d frontend` |
| Backend can't connect to MongoDB | MongoDB not healthy yet | Check `docker compose ps`, wait for healthy status |
| `ECONNREFUSED` in backend logs | MongoDB container name mismatch | Ensure `MONGO_URI=mongodb://mongodb:27017/bingefeast` in docker-compose |
| OAuth callback fails | Wrong callback URL in Google/GitHub console | Set callback to `https://streamseek.sameersitre.dev/api/auth/callback/google` (or `/github`) |
| Images not loading | TMDB API key expired or wrong | Check `TMDB_API_KEY` in `.env`, restart backend |
| OTT platforms not showing | Watchmode API key issue or stale cache | Check API key, clear cache: `docker compose exec mongodb mongosh --eval "db.getSiblingDB('bingefeast').ott_streams.drop()"` |
| Build fails (out of memory) | VM doesn't have enough RAM | Use a VM with 4GB+ RAM, or add swap: `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile` |
| Certbot renewal fails | Port 80 not accessible | Ensure UFW allows port 80 and no other service is using it |

---

## Quick Reference — Common Commands

```bash
# ─── Deployment ─────────────────────────────────────
docker compose up --build -d          # Build and start all
docker compose down                   # Stop all
docker compose restart                # Restart all

# ─── Monitoring ─────────────────────────────────────
docker compose ps                     # Service status
docker compose logs -f                # Follow all logs
docker compose logs -f backend        # Follow backend logs
docker stats --no-stream              # Resource usage

# ─── Database ───────────────────────────────────────
docker compose exec mongodb mongosh bingefeast   # MongoDB shell

# ─── Updates ────────────────────────────────────────
git pull origin main                  # Pull latest code
docker compose up --build -d          # Rebuild and deploy

# ─── SSL ────────────────────────────────────────────
docker compose run --rm certbot certificates     # Check cert status
docker compose run --rm certbot renew --dry-run  # Test renewal
```
