# Deploying Orbit to an Oracle Cloud Always Free Ubuntu VM

This guide walks you through hosting the site on a free **Oracle Cloud Ampere
(ARM) Ubuntu** VM using `next start` behind **Caddy** (automatic HTTPS), managed
by **systemd**. The app runs as an always-on Node server with a persistent,
writable `data/` directory — which is what the private Studio needs to save
`profile.json`, `published-projects.json`, and the news cache.

> Install path used throughout: **`/opt/orbit/website`**. App runs as a
> non-root **`orbit`** user on port **3000**, with Caddy in front on 80/443.

---

## How content reaches the server

The Studio writes JSON to `data/` at runtime. Those live files
(`data/profile.json`, `data/published-projects.json`, `data/news-cache.json`)
are gitignored, so they never reach the server through git.

To bootstrap the server with the content you already curated locally, the repo
commits point-in-time snapshots: **`data/profile.seed.json`** and
**`data/published-projects.seed.json`**. On its first run, `deploy/update.sh`
copies each `*.seed.json` to the matching live `*.json` **only if the live file
does not already exist** — so a redeploy never overwrites edits you made through
the Studio on the VM.

- **Editing on the server:** changes persist in `data/` on the VM across
  redeploys.
- **Pushing newer local content:** update the `.seed.json` files in the repo
  (or `scp` your live JSON up once, see [Updating content](#updating-content)).

---

## 1. Create the VM

1. In the Oracle Cloud console: **Compute → Instances → Create instance**.
2. **Image:** Canonical Ubuntu 22.04 or 24.04.
3. **Shape:** `VM.Standard.A1.Flex` (Ampere/ARM, Always Free). Give it a couple
   of OCPUs and a few GB of RAM — well within the free allowance.
4. **SSH keys:** upload your public key (e.g. the contents of
   `~/.ssh/id_ed25519.pub`). On Windows generate one with
   `ssh-keygen -t ed25519` in PowerShell if you don't have one.
5. Create the instance and note its **public IP**.
6. SSH in: `ssh ubuntu@<PUBLIC_IP>`.

### ⚠️ Open BOTH firewalls (the #1 thing people miss)

Oracle blocks inbound traffic in **two** independent places. You must open
ports **80** and **443** in both, or the site will be unreachable even though it
runs fine locally.

**(a) VCN Security List / NSG (cloud-side):**
- Console → **Networking → Virtual Cloud Networks → your VCN → Subnet →
  Security List** (or the instance's NSG).
- Add **Ingress Rules**: Source `0.0.0.0/0`, IP Protocol TCP, Destination port
  `80`, and another for port `443`.

**(b) Instance firewall (OS-side, on the VM):**
Ubuntu on Oracle ships with restrictive iptables rules (netfilter-persistent).
Open the ports and persist them:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

(If `ufw` is active instead, use `sudo ufw allow 80,443/tcp`.)

---

## 2. Install Node 22, git, and Caddy

```bash
sudo apt update && sudo apt -y upgrade

# Node 22 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git

# (Alternative: nvm)
#   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
#   nvm install 22
# If you use nvm, note the resulting npm path (run `which npm` as the orbit
# user) and update ExecStart/PATH in deploy/orbit-web.service accordingly.

# Caddy (official apt repo)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy

node -v   # expect v22.x
```

---

## 3. Create the `orbit` user and install the app

```bash
# Non-root service account
sudo useradd --system --create-home --shell /bin/bash orbit

# Install location
sudo mkdir -p /opt/orbit
sudo chown orbit:orbit /opt/orbit

# Clone as the orbit user (replace with your GitHub repo URL)
sudo -u orbit git clone https://github.com/AlexTouvras/Orbit.git /opt/orbit/website
cd /opt/orbit/website
```

### Create `.env.production` with real secrets

```bash
sudo -u orbit cp .env.example .env.production
sudo -u orbit nano .env.production
```

Fill in strong values (generate with `openssl rand -hex 32`):

- `STUDIO_PASSWORD` — your Studio login password
- `STUDIO_SESSION_SECRET` — random 32+ byte hex
- `CRON_SECRET` — random 32+ byte hex
- `NEXT_PUBLIC_SITE_URL` — your real HTTPS URL, e.g. `https://example.com`
- `GITHUB_TOKEN` — optional (raises GitHub API rate limit)

Lock it down: `sudo chmod 600 .env.production`.

---

## 4. Build and install the systemd services

First build (and seed content) with the deploy script:

```bash
cd /opt/orbit/website
chmod +x deploy/update.sh        # the file came from a Windows checkout
sudo -u orbit ORBIT_SERVICE=orbit-web ./deploy/update.sh
```

> The very first run will `git pull` (no-op), `npm ci`, `npm run build`, seed
> `data/*.json` from the `*.seed.json` snapshots, then try to restart
> `orbit-web` (which isn't installed yet — that's fine, install it next).

Install the unit files:

```bash
sudo cp deploy/orbit-web.service   /etc/systemd/system/
sudo cp deploy/orbit-news.service  /etc/systemd/system/
sudo cp deploy/orbit-news.timer    /etc/systemd/system/

# If `which npm` (as the orbit user) is NOT /usr/bin/npm (e.g. you used nvm),
# edit ExecStart and the PATH line in orbit-web.service to the real path first.

sudo systemctl daemon-reload
sudo systemctl enable --now orbit-web.service
sudo systemctl enable --now orbit-news.timer

# Verify
systemctl status orbit-web --no-pager
curl -s http://127.0.0.1:3000 | head -c 200   # should return HTML
systemctl list-timers orbit-news.timer
```

The news timer runs every 6 hours (`Persistent=true` catches missed runs). To
refresh news immediately: `sudo systemctl start orbit-news.service`.

---

## 5. Set up Caddy (automatic HTTPS)

Edit the Caddy config and point it at the app. A ready-made template lives at
`deploy/Caddyfile`.

```bash
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile
```

Choose ONE of the hostname blocks in the file:

- **Real domain (recommended):** at your DNS provider, create an **A record**
  pointing your domain at the VM's public IP. Then set the first block to your
  domain. Caddy fetches a Let's Encrypt cert automatically.
- **Free DuckDNS subdomain:** create one at <https://www.duckdns.org>, set its
  IP to the VM's public IP, and uncomment the `your-name.duckdns.org` block.
- **No domain yet:** uncomment the `:80` block to serve over plain HTTP by IP
  just to confirm things work. Note: the Studio session cookie is `Secure` in
  production, so **don't log into the Studio over plain HTTP** — wait until
  you're on HTTPS.

Reload Caddy and watch it provision the cert:

```bash
sudo systemctl reload caddy
sudo journalctl -u caddy -f
```

Visit `https://<your-domain>` — you should see the site.

---

## <a id="updating-content"></a>6. Updating the app later

SSH in and run the deploy script. It pulls, installs, builds, seeds-if-missing,
and restarts the service:

```bash
cd /opt/orbit/website
sudo -u orbit ./deploy/update.sh
```

### Updating content

- **Most edits:** just use the Studio at `https://<your-domain>/studio`. Changes
  are written to `data/` on the VM and **survive redeploys** (the seed step only
  fills in missing files, never overwrites).
- **Re-seed from local:** to ship a fresh batch of locally-curated content,
  update the committed `data/profile.seed.json` /
  `data/published-projects.seed.json` and push — but remember the seed only
  applies when the live file is absent. To force-replace the live content on the
  server, copy your local files up directly, e.g. from your Windows machine:

```powershell
scp .\data\profile.json            orbit@<PUBLIC_IP>:/opt/orbit/website/data/
scp .\data\published-projects.json orbit@<PUBLIC_IP>:/opt/orbit/website/data/
```

Then `sudo systemctl restart orbit-web`.

> The project scanner (Studio "scan") reads `~/.cursor/projects` and only works
> on your local Windows machine — it will not work on the server. That's
> expected; publish projects locally (or edit `published-projects.json`) and
> they reach the server via the seed/scp flow above.

---

## 7. Troubleshooting

- **Can't reach the site at all** → almost always a firewall. Check **both**
  the VCN Security List/NSG **and** the instance iptables (Step 1). Test from
  the VM itself: `curl -I http://127.0.0.1:3000` (app up?) and
  `sudo ss -tlnp | grep -E ':80|:443|:3000'`.
- **502 Bad Gateway from Caddy** → the app isn't running. Check
  `systemctl status orbit-web` and `journalctl -u orbit-web -e`. Common cause:
  wrong node/npm path in `ExecStart` (fix it, then `sudo systemctl daemon-reload
  && sudo systemctl restart orbit-web`).
- **HTTPS cert won't issue** → DNS must resolve to the VM and ports 80/443 must
  be open in both firewalls before Caddy can complete the ACME challenge. Watch
  `journalctl -u caddy -f`.
- **Studio login fails / logs you out immediately** → you're on plain HTTP. The
  session cookie is `Secure` in production and only sent over HTTPS. Use a
  domain/DuckDNS with HTTPS.
- **News never updates** → check the timer (`systemctl list-timers
  orbit-news.timer`) and run it once: `sudo systemctl start orbit-news.service;
  journalctl -u orbit-news -e`. Confirm `CRON_SECRET` matches the one the app
  loaded.
- **Permission denied writing data/** → ensure `data/` is owned by `orbit`:
  `sudo chown -R orbit:orbit /opt/orbit/website/data`.
- **`update.sh` aborts on `git pull`** → the checkout diverged. Inspect with
  `git status`; the script intentionally uses `--ff-only` to avoid surprise
  merges.
