#!/usr/bin/env bash
#
# First-time Oracle VM bootstrap for Orbit.
# Run on a fresh Ubuntu 22.04/24.04 Ampere instance as ubuntu (with sudo).
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/AlexTouvras/Orbit/main/deploy/bootstrap-vm.sh | bash
# Or after cloning:
#   chmod +x deploy/bootstrap-vm.sh && sudo ./deploy/bootstrap-vm.sh
#
# Before running:
#   1. Open ports 80+443 in Oracle VCN Security List AND instance iptables (see DEPLOY.md).
#   2. Have your .env.production secrets ready (STUDIO_PASSWORD, STUDIO_SESSION_SECRET, CRON_SECRET, NEXT_PUBLIC_SITE_URL).

set -euo pipefail

REPO_URL="${ORBIT_REPO_URL:-https://github.com/AlexTouvras/Orbit.git}"
APP_DIR="/opt/orbit/website"
ORBIT_USER="orbit"

echo "==> Orbit VM bootstrap"
echo "    Repo: ${REPO_URL}"
echo "    Install: ${APP_DIR}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root: sudo ./deploy/bootstrap-vm.sh"
  exit 1
fi

echo "==> Opening instance firewall (80, 443)"
if command -v iptables >/dev/null 2>&1; then
  iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
  iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
  netfilter-persistent save 2>/dev/null || true
fi

echo "==> Installing packages"
apt update
DEBIAN_FRONTEND=noninteractive apt -y upgrade
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
DEBIAN_FRONTEND=noninteractive apt install -y nodejs git debian-keyring debian-archive-keyring apt-transport-https curl

echo "==> Installing Caddy"
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
apt update
DEBIAN_FRONTEND=noninteractive apt install -y caddy

echo "==> Creating ${ORBIT_USER} user"
id "${ORBIT_USER}" &>/dev/null || useradd --system --create-home --shell /bin/bash "${ORBIT_USER}"
mkdir -p /opt/orbit
chown "${ORBIT_USER}:${ORBIT_USER}" /opt/orbit

if [ ! -d "${APP_DIR}/.git" ]; then
  echo "==> Cloning repository"
  sudo -u "${ORBIT_USER}" git clone "${REPO_URL}" "${APP_DIR}"
else
  echo "==> Repo already exists at ${APP_DIR}"
fi

chmod +x "${APP_DIR}/deploy/update.sh"

if [ ! -f "${APP_DIR}/.env.production" ]; then
  echo "==> Creating .env.production from template"
  sudo -u "${ORBIT_USER}" cp "${APP_DIR}/.env.example" "${APP_DIR}/.env.production"
  chmod 600 "${APP_DIR}/.env.production"
  chown "${ORBIT_USER}:${ORBIT_USER}" "${APP_DIR}/.env.production"
  echo ""
  echo "!! STOP: Edit secrets before starting the app:"
  echo "   sudo -u ${ORBIT_USER} nano ${APP_DIR}/.env.production"
  echo ""
  echo "   Generate secrets: openssl rand -hex 32"
  echo "   Set NEXT_PUBLIC_SITE_URL to your HTTPS URL (domain or *.duckdns.org)"
  echo ""
  read -r -p "Press Enter after you've saved .env.production..." _
fi

echo "==> Building app (first run)"
cd "${APP_DIR}"
sudo -u "${ORBIT_USER}" ORBIT_SERVICE=orbit-web "${APP_DIR}/deploy/update.sh" || true

echo "==> Installing systemd units"
cp "${APP_DIR}/deploy/orbit-web.service" /etc/systemd/system/
cp "${APP_DIR}/deploy/orbit-news.service" /etc/systemd/system/
cp "${APP_DIR}/deploy/orbit-news.timer" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now orbit-web.service
systemctl enable --now orbit-news.timer

echo "==> Installing Caddyfile template"
cp "${APP_DIR}/deploy/Caddyfile" /etc/caddy/Caddyfile

echo ""
echo "==> Bootstrap complete. Next steps:"
echo "  1. Edit Caddy hostname:  sudo nano /etc/caddy/Caddyfile"
echo "  2. Reload Caddy:         sudo systemctl reload caddy"
echo "  3. Check app:            curl -s http://127.0.0.1:3000 | head"
echo "  4. Check service:        systemctl status orbit-web --no-pager"
echo ""
echo "  Studio login only works over HTTPS (after Caddy + domain/DuckDNS)."
