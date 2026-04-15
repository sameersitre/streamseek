#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# StreamSeek + Portfolio — Build locally & deploy to VM
# Usage: ./deploy.sh [frontend|backend|portfolio|all|nginx|init]
# ─────────────────────────────────────────────────────────

set -euo pipefail

# ─── Config ──────────────────────────────────────────────
VM_USER="sameersitre"
VM_HOST="34.45.33.206"
VM_KEY="~/.ssh/trovie-key-nopass"
VM_DIR="~/streamseek"
DOMAIN="streamseek.sameersitre.dev"
DOMAIN_PORTFOLIO="sameersitre.dev"
PORTFOLIO_DIR="../portfolio-web"
SSH_OPTS="-o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new"
PLATFORM="linux/amd64"

# ─── Colors ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${BLUE}▸${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; }
info() { echo -e "${CYAN}ℹ${NC} $1"; }

# ─── SSH helper ──────────────────────────────────────────
vm() {
  ssh $SSH_OPTS -i "$VM_KEY" "${VM_USER}@${VM_HOST}" "$@"
}

vm_scp() {
  scp -i "$VM_KEY" "$@"
}

# ─── Check VM connection ────────────────────────────────
check_vm() {
  if ! vm "echo ok" &>/dev/null; then
    err "Cannot reach VM at ${VM_HOST}"
    warn "Is the SSH key added? Run: ssh-add ${VM_KEY}"
    exit 1
  fi
}

# ─── Check local Docker ─────────────────────────────────
check_docker() {
  if ! command -v docker &>/dev/null; then
    err "Docker not installed locally"; exit 1
  fi
  if ! docker info &>/dev/null; then
    err "Docker daemon not running"; exit 1
  fi
}

# ─── Preflight (Docker + VM) ────────────────────────────
preflight() {
  log "Checking prerequisites..."
  check_docker
  check_vm
  ok "VM reachable at ${VM_HOST}"
}

# ─── Init VM (first-time setup) ─────────────────────────
init_vm() {
  log "Initializing VM deploy directory..."

  vm "mkdir -p ${VM_DIR}/nginx/certbot/conf ${VM_DIR}/nginx/certbot/www"
  ok "Created ${VM_DIR}/ structure"

  # Docker
  if vm "command -v docker" &>/dev/null; then
    ok "Docker already installed"
  else
    log "Installing Docker on VM..."
    vm "curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker \$USER"
    warn "Docker installed — logout/login for group to take effect"
  fi

  # Swap
  local swap_size
  swap_size=$(vm "free -m | awk '/Swap/{print \$2}'" 2>/dev/null)
  if [[ "$swap_size" -lt 1000 ]]; then
    log "Adding 10GB swap..."
    vm "sudo fallocate -l 10G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile && echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab"
    ok "Swap configured"
  else
    ok "Swap already configured (${swap_size}MB)"
  fi

  sync_configs
  sync_env_force

  ok "VM initialized at ${VM_DIR}/"
  info "Next: run deploy (option 1) to build and push images"
}

# ─── Bump client version (patch) ─────────────────────────
bump_version() {
  local pkg="client/package.json"
  local current
  current=$(node -p "require('./${pkg}').version")

  # Increment patch: 0.1.0 → 0.1.1
  local major minor patch
  IFS='.' read -r major minor patch <<< "$current"
  patch=$((patch + 1))
  local next="${major}.${minor}.${patch}"

  # Update package.json (compatible with macOS + Linux sed)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\"version\": \"${current}\"/\"version\": \"${next}\"/" "$pkg"
  else
    sed -i "s/\"version\": \"${current}\"/\"version\": \"${next}\"/" "$pkg"
  fi

  ok "Version: ${current} → ${next}"
}

# ─── Build image locally ────────────────────────────────
build_image() {
  local name=$1
  local context=$2
  local extra_args="${3:-}"

  log "Building ${name} image (platform: ${PLATFORM})..."
  if [[ -n "$extra_args" ]]; then
    docker build --platform "$PLATFORM" $extra_args -t "streamseek-${name}" "$context"
  else
    docker build --platform "$PLATFORM" -t "streamseek-${name}" "$context"
  fi
  ok "Built streamseek-${name}"
}

# ─── Export, upload, load image ──────────────────────────
push_image() {
  local name=$1
  local tarball="/tmp/streamseek-${name}.tar.gz"

  log "Exporting ${name} image..."
  docker save "streamseek-${name}" | gzip > "$tarball"
  local size
  size=$(du -h "$tarball" | cut -f1)
  ok "Saved ${tarball} (${size})"

  log "Uploading ${name} to VM..."
  vm_scp "$tarball" "${VM_USER}@${VM_HOST}:/tmp/"
  ok "Uploaded ${name}"

  log "Loading ${name} image on VM..."
  vm "gunzip -c /tmp/streamseek-${name}.tar.gz | docker load && rm /tmp/streamseek-${name}.tar.gz"
  ok "Loaded ${name} on VM"

  rm -f "$tarball"
}

# ─── Sync config files (docker-compose + nginx) ─────────
sync_configs() {
  log "Syncing config files to VM..."

  vm "mkdir -p ${VM_DIR}/nginx"
  vm_scp docker-compose.prod.yml "${VM_USER}@${VM_HOST}:${VM_DIR}/docker-compose.yml"
  vm_scp nginx/nginx.conf "${VM_USER}@${VM_HOST}:${VM_DIR}/nginx/"

  ok "Config files synced"
}

# ─── Sync env files (with prompt) ────────────────────────
sync_env() {
  warn "This will overwrite .env on the VM!"
  read -rp "Continue? (y/N) " confirm
  [[ "$confirm" != "y" ]] && return
  sync_env_force
}

# ─── Sync env files (no prompt) ──────────────────────────
sync_env_force() {
  log "Syncing environment files..."
  vm_scp .env "${VM_USER}@${VM_HOST}:${VM_DIR}/.env" 2>/dev/null || warn "No .env found"
  ok "Env files synced"
}

# ─── Wait for container health ───────────────────────────
wait_healthy() {
  local container=$1
  local timeout=${2:-60}
  local elapsed=0

  log "Waiting for ${container} to be healthy..."
  while [[ $elapsed -lt $timeout ]]; do
    local status
    status=$(vm "docker inspect --format='{{.State.Health.Status}}' ${container} 2>/dev/null" || echo "missing")
    if [[ "$status" == "healthy" ]]; then
      ok "${container} is healthy"
      return 0
    fi
    sleep 5
    elapsed=$((elapsed + 5))
  done
  warn "${container} not healthy after ${timeout}s (status: ${status:-unknown})"
  return 1
}

# ─── Restart services ───────────────────────────────────
restart_services() {
  local services="${1:-all}"

  log "Restarting services on VM..."

  if [[ "$services" == "all" ]]; then
    vm "cd ${VM_DIR} && docker compose down"

    vm "cd ${VM_DIR} && docker compose up -d mongodb"
    wait_healthy streamseek-mongodb-1 30

    vm "cd ${VM_DIR} && docker compose up -d --force-recreate backend"
    wait_healthy streamseek-backend-1 60

    vm "cd ${VM_DIR} && docker compose up -d --force-recreate frontend"
    wait_healthy streamseek-frontend-1 60

    vm "cd ${VM_DIR} && docker compose up -d --force-recreate portfolio"
    wait_healthy streamseek-portfolio-1 60

    vm "cd ${VM_DIR} && docker compose up -d nginx certbot"
    sleep 3

  elif [[ "$services" == "frontend" ]]; then
    vm "cd ${VM_DIR} && docker compose up -d --no-deps --force-recreate frontend"
    wait_healthy streamseek-frontend-1 60
    vm "cd ${VM_DIR} && docker compose restart nginx 2>/dev/null || true"

  elif [[ "$services" == "backend" ]]; then
    vm "cd ${VM_DIR} && docker compose up -d --no-deps --force-recreate backend"
    wait_healthy streamseek-backend-1 60
    vm "cd ${VM_DIR} && docker compose up -d --no-deps --force-recreate frontend"
    wait_healthy streamseek-frontend-1 60
    vm "cd ${VM_DIR} && docker compose restart nginx 2>/dev/null || true"

  elif [[ "$services" == "portfolio" ]]; then
    vm "cd ${VM_DIR} && docker compose up -d --no-deps --force-recreate portfolio"
    wait_healthy streamseek-portfolio-1 60
    vm "cd ${VM_DIR} && docker compose restart nginx 2>/dev/null || true"

  elif [[ "$services" == "nginx" ]]; then
    vm "cd ${VM_DIR} && docker compose up -d --force-recreate nginx certbot"
    sleep 3
  fi

  ok "Services restarted"
}

# ─── Health check ────────────────────────────────────────
health_check() {
  log "Running health checks..."
  echo ""
  vm "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
  echo ""

  # API health
  local api_status
  api_status=$(vm "docker exec streamseek-backend-1 node -e \"fetch('http://localhost:8000/').then(r=>r.text()).then(d=>console.log(d)).catch(()=>console.log('error'))\"" 2>/dev/null || echo "unreachable")

  if [[ "$api_status" != "unreachable" && "$api_status" != "error" ]]; then
    ok "API: ${api_status}"
  else
    warn "API not responding yet (may still be starting)"
  fi

  # HTTPS
  local https_status
  https_status=$(curl -so /dev/null -w "%{http_code}" "https://${DOMAIN}" 2>/dev/null || echo "000")

  if [[ "$https_status" == "200" ]]; then
    ok "HTTPS: https://${DOMAIN} → ${https_status}"
  elif [[ "$https_status" == "000" ]]; then
    warn "HTTPS: https://${DOMAIN} → not reachable"
  else
    warn "HTTPS: https://${DOMAIN} → ${https_status}"
  fi

  # Disk
  echo ""
  info "Disk: $(vm 'df -h / | tail -1 | awk "{print \$3\"/\"\$2\" (\"\$5\" used)\"}"')"
}

# ─── SSL bootstrap ───────────────────────────────────────
setup_ssl() {
  warn "DNS must point both domains to ${VM_HOST} before running this!"
  echo ""

  local all_ok=true

  for domain in "${DOMAIN_PORTFOLIO}" "${DOMAIN}"; do
    local dns_ip
    dns_ip=$(dig +short "${domain}" A 2>/dev/null | head -1)
    if [[ "$dns_ip" == "$VM_HOST" ]]; then
      ok "DNS: ${domain} → ${dns_ip}"
    else
      err "DNS: ${domain} → ${dns_ip:-<no record>} (expected ${VM_HOST})"
      all_ok=false
    fi
  done

  if [[ "$all_ok" != "true" ]]; then
    warn "Update DNS first, then retry."
    return
  fi

  read -rp "Proceed with SSL setup for both domains? (y/N) " confirm
  [[ "$confirm" != "y" ]] && return

  log "Bootstrapping SSL certificates..."

  vm "cd ${VM_DIR} && docker compose stop nginx 2>/dev/null || true"
  vm "mkdir -p ${VM_DIR}/nginx/certbot/conf ${VM_DIR}/nginx/certbot/www"

  # Certificate for sameersitre.dev
  log "Getting certificate for ${DOMAIN_PORTFOLIO}..."
  vm "docker run --rm -p 80:80 \
    -v ${VM_DIR}/nginx/certbot/conf:/etc/letsencrypt \
    -v ${VM_DIR}/nginx/certbot/www:/var/www/certbot \
    certbot/certbot certonly --standalone \
    -d ${DOMAIN_PORTFOLIO} -d www.${DOMAIN_PORTFOLIO} \
    --non-interactive --agree-tos --force-renewal \
    -m sameersitre@gmail.com"
  ok "SSL certificate obtained for ${DOMAIN_PORTFOLIO}"

  # Certificate for streamseek.sameersitre.dev
  log "Getting certificate for ${DOMAIN}..."
  vm "docker run --rm -p 80:80 \
    -v ${VM_DIR}/nginx/certbot/conf:/etc/letsencrypt \
    -v ${VM_DIR}/nginx/certbot/www:/var/www/certbot \
    certbot/certbot certonly --standalone \
    -d ${DOMAIN} \
    --non-interactive --agree-tos --force-renewal \
    -m sameersitre@gmail.com"
  ok "SSL certificate obtained for ${DOMAIN}"

  log "Starting nginx + certbot..."
  vm "cd ${VM_DIR} && docker compose up -d nginx certbot"
  ok "Nginx + Certbot running with HTTPS for both domains"
}

# ─── Renew SSL ───────────────────────────────────────────
renew_ssl() {
  log "Forcing SSL certificate renewal..."
  # Stop nginx to free port 80 for standalone ACME challenge
  vm "cd ${VM_DIR} && docker compose stop nginx"
  # Run certbot inside Docker — writes certs to the mounted volume (nginx/certbot/conf)
  # IMPORTANT: always use docker run with the volume mount, never `certbot` directly on the host.
  # Running host certbot writes to /etc/letsencrypt (not the Docker volume), which nginx won't pick up.
  vm "docker run --rm \
    -v ${VM_DIR}/nginx/certbot/conf:/etc/letsencrypt \
    -v ${VM_DIR}/nginx/certbot/www:/var/www/certbot \
    -p 80:80 \
    certbot/certbot renew --standalone --force-renewal --non-interactive"
  # Restart nginx to load the new cert
  vm "cd ${VM_DIR} && docker compose start nginx"
  ok "SSL renewed and nginx restarted"
}

# ─── MongoDB tunnel ─────────────────────────────────────
db_tunnel() {
  log "Opening SSH tunnel to production MongoDB..."

  # Kill existing tunnel if any
  lsof -ti:27018 &>/dev/null && kill "$(lsof -ti:27018)" 2>/dev/null
  sleep 1

  ssh -f -N -L 27018:127.0.0.1:27017 -i "$VM_KEY" $SSH_OPTS "${VM_USER}@${VM_HOST}"

  # Verify tunnel is working
  local retries=0
  while ! nc -z localhost 27018 2>/dev/null; do
    retries=$((retries + 1))
    if [[ $retries -ge 10 ]]; then
      err "Tunnel failed — cannot reach localhost:27018 after 10s"
      err "Check if VM MongoDB is running: ssh into VM and run 'docker ps'"
      return 1
    fi
    sleep 1
  done

  ok "Tunnel open: localhost:27018 → VM MongoDB"
  info "Connect with: mongodb://localhost:27018/bingefeast"
  info "Kill tunnel: lsof -ti:27018 | xargs kill"
}

# ─── Clean up VM ─────────────────────────────────────────
cleanup_vm() {
  warn "This will remove unused Docker images/containers on the VM."
  read -rp "Continue? (y/N) " confirm
  [[ "$confirm" != "y" ]] && return

  vm "docker system prune -af"
  ok "VM cleaned up"
  info "Disk: $(vm 'df -h / | tail -1 | awk "{print \$3\"/\"\$2\" (\"\$5\" used)\"}"')"
}

# ─── Menu ────────────────────────────────────────────────
show_menu() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC}   StreamSeek + Portfolio Deploy Script          ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}   VM: ${VM_USER}@${VM_HOST}           ${BLUE}║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${GREEN}Deploy${NC}"
  echo "  1) Deploy everything (full rebuild)"
  echo "  2) Deploy frontend only (streamseek)"
  echo "  3) Deploy backend only (streamseek)"
  echo "  p) Deploy portfolio only (sameersitre.dev)"
  echo ""
  echo -e "  ${YELLOW}Config${NC}"
  echo "  4) Sync configs (docker-compose, nginx)"
  echo "  5) Sync env files (.env)"
  echo ""
  echo -e "  ${CYAN}Manage${NC}"
  echo "  6) Restart services on VM"
  echo "  7) Health check"
  echo "  8) View VM logs"
  echo "  9) SSH into VM"
  echo "  n) Restart nginx (sync config + recreate)"
  echo "  d) Database (SSH tunnel to MongoDB)"
  echo ""
  echo -e "  ${RED}SSL${NC}"
  echo "  s) Setup SSL (first time)"
  echo "  r) Renew SSL certificate"
  echo ""
  echo -e "  ${YELLOW}Maintenance${NC}"
  echo "  i) Init VM (first-time setup)"
  echo "  c) Clean up unused Docker images on VM"
  echo "  0) Exit"
  echo ""
}

# ─── Main ────────────────────────────────────────────────
main() {
  # Non-interactive mode
  if [[ $# -gt 0 ]]; then
    case "$1" in
      frontend)  preflight; bump_version; build_image frontend ./client "--build-arg NEXT_PUBLIC_API_URL=https://${DOMAIN}/api/v2"; push_image frontend; sync_configs; restart_services frontend; health_check ;;
      backend)   preflight; build_image backend ./server;  push_image backend; sync_configs; restart_services backend;  health_check ;;
      portfolio) preflight; build_image portfolio "${PORTFOLIO_DIR}"; push_image portfolio; sync_configs; restart_services portfolio; health_check ;;
      all)       preflight; bump_version; build_image frontend ./client "--build-arg NEXT_PUBLIC_API_URL=https://${DOMAIN}/api/v2"; build_image backend ./server; build_image portfolio "${PORTFOLIO_DIR}"; push_image frontend; push_image backend; push_image portfolio; sync_configs; restart_services all; health_check ;;
      nginx)     check_vm; sync_configs; restart_services nginx; health_check ;;
      init)      check_vm; init_vm ;;
      *)         err "Usage: $0 [frontend|backend|portfolio|all|nginx|init]"; exit 1 ;;
    esac
    exit 0
  fi

  # Interactive mode
  check_vm
  ok "VM reachable at ${VM_HOST}"

  while true; do
    show_menu
    read -rp "Choose an option: " choice

    case "$choice" in
      1)
        check_docker
        bump_version
        build_image frontend ./client "--build-arg NEXT_PUBLIC_API_URL=https://${DOMAIN}/api/v2"
        build_image backend ./server
        build_image portfolio "${PORTFOLIO_DIR}"
        push_image frontend
        push_image backend
        push_image portfolio
        sync_configs
        restart_services all
        health_check
        ;;
      2)
        check_docker
        bump_version
        build_image frontend ./client "--build-arg NEXT_PUBLIC_API_URL=https://${DOMAIN}/api/v2"
        push_image frontend
        sync_configs
        restart_services frontend
        health_check
        ;;
      3)
        check_docker
        build_image backend ./server
        push_image backend
        sync_configs
        restart_services backend
        health_check
        ;;
      p)
        check_docker
        build_image portfolio "${PORTFOLIO_DIR}"
        push_image portfolio
        sync_configs
        restart_services portfolio
        health_check
        ;;
      4) sync_configs; ok "Restart services (option 6) to apply." ;;
      5) sync_env ;;
      6) restart_services all; health_check ;;
      7) health_check ;;
      8)
        read -rp "Service (frontend/backend/portfolio/mongodb/nginx/certbot/all): " svc
        if [[ "$svc" == "all" ]]; then
          vm "cd ${VM_DIR} && docker compose logs --tail=50"
        else
          vm "cd ${VM_DIR} && docker compose logs --tail=50 ${svc}"
        fi
        ;;
      9) ssh $SSH_OPTS -i "$VM_KEY" "${VM_USER}@${VM_HOST}" ;;
      n) sync_configs; restart_services nginx; health_check ;;
      d) db_tunnel ;;
      s) setup_ssl ;;
      r) renew_ssl ;;
      i) init_vm ;;
      c) cleanup_vm ;;
      0) ok "Bye!"; exit 0 ;;
      *) warn "Invalid option" ;;
    esac
  done
}

main "$@"
