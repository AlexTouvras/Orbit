# Oracle deploy checklist

Work through these in order. Full detail in [DEPLOY.md](../DEPLOY.md).

---

## Before you start (on your PC)

- [ ] Code pushed to GitHub: `https://github.com/AlexTouvras/Orbit`
- [ ] SSH key ready (see below)
- [ ] DuckDNS subdomain chosen (free) **or** a domain pointed at the VM later

**Your SSH public key** (paste into Oracle when creating the VM):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP8n81EkOiQYLanNCRpYGP63o9T4eM0LvJWRwY/n5RVl a.touvras@gmail.com
```

---

## Step 1 — Oracle Cloud console

1. Sign in at [cloud.oracle.com](https://cloud.oracle.com)
2. **Compute → Instances → Create instance**
3. **Name:** `orbit`
4. **Image:** Ubuntu 24.04 (aarch64)
5. **Shape:** `VM.Standard.A1.Flex` — 2 OCPU, 12 GB RAM (Always Free)
6. **Networking:** assign public IPv4
7. **SSH keys:** paste your public key above
8. Create → note the **public IP**

### Open cloud firewall (required)

**Networking → VCN → your subnet → Security list → Add ingress rules:**

| Source       | Protocol | Dest port |
| ------------ | -------- | --------- |
| `0.0.0.0/0`  | TCP      | 80        |
| `0.0.0.0/0`  | TCP      | 443       |

---

## Step 2 — DuckDNS (free HTTPS hostname)

1. [duckdns.org](https://www.duckdns.org) → sign in → create subdomain e.g. `alextouvras`
2. Set IP to your VM **public IP**
3. Your site URL will be: `https://alextouvras.duckdns.org`

---

## Step 3 — SSH into the VM

From PowerShell on your PC:

```powershell
ssh ubuntu@YOUR_PUBLIC_IP
```

First connection: type `yes` if asked about host key.

---

## Step 4 — Bootstrap the server

On the VM (paste as one block):

```bash
git clone https://github.com/AlexTouvras/Orbit.git /tmp/orbit-setup
cd /tmp/orbit-setup
chmod +x deploy/bootstrap-vm.sh
sudo ./deploy/bootstrap-vm.sh
```

When it pauses for `.env.production`, paste the block from **Step 5**, save (`Ctrl+O`, Enter, `Ctrl+X`), press Enter.

---

## Step 5 — Production secrets

On the VM:

```bash
sudo -u orbit nano /opt/orbit/website/.env.production
```

Use (replace `STUDIO_PASSWORD` with your own strong password):

```env
STUDIO_PASSWORD=your-strong-password-here
STUDIO_SESSION_SECRET=PASTE_OPENSSL_HEX_32
CRON_SECRET=PASTE_ANOTHER_OPENSSL_HEX_32
NEXT_PUBLIC_SITE_URL=https://alextouvras.duckdns.org
GITHUB_TOKEN=
```

Generate hex secrets on the VM:

```bash
openssl rand -hex 32
```

Run twice — one for `STUDIO_SESSION_SECRET`, one for `CRON_SECRET`.

---

## Step 6 — Caddy (HTTPS)

```bash
sudo nano /etc/caddy/Caddyfile
```

Comment out `example.com { ... }`. Uncomment and set:

```
alextouvras.duckdns.org {
	encode zstd gzip
	reverse_proxy 127.0.0.1:3000
}
```

(Use your real DuckDNS name.)

```bash
sudo systemctl reload caddy
```

---

## Step 7 — Verify

```bash
curl -s http://127.0.0.1:3000 | head -c 200
systemctl status orbit-web --no-pager
systemctl list-timers orbit-news.timer
```

Open in browser: `https://alextouvras.duckdns.org`

- **Studio:** `https://alextouvras.duckdns.org/studio` (HTTPS required for login)

---

## Updates later

SSH in, then:

```bash
cd /opt/orbit/website
sudo -u orbit ./deploy/update.sh
```

---

## If the site won't load

1. **Both firewalls** — Oracle security list **and** VM iptables (bootstrap opens VM side)
2. **DNS** — DuckDNS IP matches VM public IP
3. **Service down** — `journalctl -u orbit-web -e`
4. **502 from Caddy** — app not running; check `systemctl status orbit-web`
