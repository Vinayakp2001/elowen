#!/bin/bash
# =============================================================================
# Elowen VPS One-Time Setup Script
# Run as root on a fresh Ubuntu 22.04 / Debian 12 Hostinger KVM VPS
# Usage: bash vps-setup.sh
# =============================================================================

set -euo pipefail

APP_DIR="/opt/elowen"
DEPLOY_USER="deploy"

echo "========================================"
echo "  Elowen VPS Setup"
echo "========================================"

# -----------------------------------------------------------------------------
# 1. Install Docker + Compose plugin
# -----------------------------------------------------------------------------
echo ""
echo "[1/5] Installing Docker..."

apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg lsb-release ufw

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker
echo "  Docker $(docker --version) installed."

# -----------------------------------------------------------------------------
# 2. Create deploy user and add to docker group
# -----------------------------------------------------------------------------
echo ""
echo "[2/5] Creating '${DEPLOY_USER}' user..."

if id "$DEPLOY_USER" &>/dev/null; then
  echo "  User '${DEPLOY_USER}' already exists — skipping creation."
else
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  echo "  User '${DEPLOY_USER}' created."
fi

usermod -aG docker "$DEPLOY_USER"
echo "  '${DEPLOY_USER}' added to docker group."

# Set up SSH directory for the deploy user (for key-based auth)
DEPLOY_HOME=$(getent passwd "$DEPLOY_USER" | cut -d: -f6)
mkdir -p "${DEPLOY_HOME}/.ssh"
chmod 700 "${DEPLOY_HOME}/.ssh"
touch "${DEPLOY_HOME}/.ssh/authorized_keys"
chmod 600 "${DEPLOY_HOME}/.ssh/authorized_keys"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${DEPLOY_HOME}/.ssh"
echo "  SSH directory ready at ${DEPLOY_HOME}/.ssh/authorized_keys"
echo "  --> Add your deploy public key to ${DEPLOY_HOME}/.ssh/authorized_keys"

# -----------------------------------------------------------------------------
# 3. Create app directory
# -----------------------------------------------------------------------------
echo ""
echo "[3/5] Creating app directory at ${APP_DIR}..."

mkdir -p "$APP_DIR"
chown "${DEPLOY_USER}:${DEPLOY_USER}" "$APP_DIR"
echo "  Directory ${APP_DIR} created and owned by '${DEPLOY_USER}'."

# -----------------------------------------------------------------------------
# 4. Configure firewall (ufw)
# -----------------------------------------------------------------------------
echo ""
echo "[4/5] Configuring firewall..."

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   comment "SSH"
ufw allow 80/tcp   comment "HTTP"
ufw allow 443/tcp  comment "HTTPS"
ufw --force enable
echo "  Firewall enabled. Open ports: 22, 80, 443."
ufw status verbose

# -----------------------------------------------------------------------------
# 5. Print next steps
# -----------------------------------------------------------------------------
echo ""
echo "[5/5] Setup complete. Manual steps remaining:"
echo "========================================"
echo ""
echo "STEP A — Upload config files to the VPS"
echo "  From your local machine:"
echo "    scp docker-compose.yml ${DEPLOY_USER}@<VPS_IP>:${APP_DIR}/"
echo "    scp .env               ${DEPLOY_USER}@<VPS_IP>:${APP_DIR}/"
echo ""
echo "STEP B — Add your deploy public key"
echo "  Append your GitHub Actions deploy key (public) to:"
echo "    ${DEPLOY_HOME}/.ssh/authorized_keys"
echo ""
echo "STEP C — Point DNS to this VPS IP, then obtain SSL certificate"
echo "  Run Certbot once DNS has propagated (replace domain/email):"
echo ""
echo "    docker run --rm \\"
echo "      -v certbot_certs:/etc/letsencrypt \\"
echo "      -v certbot_www:/var/www/certbot \\"
echo "      -p 80:80 \\"
echo "      certbot/certbot certonly --standalone \\"
echo "      -d yourdomain.com -d www.yourdomain.com \\"
echo "      --agree-tos --email you@yourdomain.com"
echo ""
echo "STEP D — Start the stack"
echo "    cd ${APP_DIR}"
echo "    docker compose pull"
echo "    docker compose up -d"
echo ""
echo "STEP E — Add Certbot auto-renewal cron job"
echo "  Run: crontab -e"
echo "  Add this line:"
echo ""
echo "    0 3 * * * docker run --rm \\"
echo "      -v certbot_certs:/etc/letsencrypt \\"
echo "      -v certbot_www:/var/www/certbot \\"
echo "      certbot/certbot renew --quiet && \\"
echo "      docker compose -f ${APP_DIR}/docker-compose.yml exec nginx nginx -s reload"
echo ""
echo "========================================"
echo "  VPS provisioning complete."
echo "========================================"
