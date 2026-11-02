# Hostinger KVM deploy

This deploy runs the full project on a single Hostinger KVM/VPS:

- PostgreSQL 18 with the initial `database/aoweb.sql` dump.
- API on the internal Docker network.
- Game WebSocket server on the internal Docker network.
- Next.js frontend.
- Caddy as public reverse proxy with automatic HTTPS.

## DNS

Create these `A` records pointing to the VPS public IP:

```txt
example.com      -> VPS_IP
api.example.com  -> VPS_IP
ws.example.com   -> VPS_IP
```

Use your real domain names in `deploy/.env`.

## First Deploy

On the VPS:

```bash
sudo mkdir -p /opt/woaoweb
sudo chown "$USER:$USER" /opt/woaoweb
git clone https://github.com/leb90/WoaoWeb /opt/woaoweb
cd /opt/woaoweb/deploy
cp .env.example .env
```

Edit `.env` and replace at least:

```txt
APP_DOMAIN
API_DOMAIN
WS_DOMAIN
ACME_EMAIL
POSTGRES_PASSWORD
TOKEN_AUTH
CORS_ORIGIN
```

Generate strong secrets with:

```bash
openssl rand -hex 32
```

Then start everything:

```bash
docker compose -f docker-compose.hostinger.yml --env-file .env up -d --build
```

Check status:

```bash
docker compose -f docker-compose.hostinger.yml --env-file .env ps
docker compose -f docker-compose.hostinger.yml --env-file .env logs -f api
docker compose -f docker-compose.hostinger.yml --env-file .env logs -f game-server
docker compose -f docker-compose.hostinger.yml --env-file .env logs -f frontend
```

## Updates

Manual:

```bash
cd /opt/woaoweb
git pull
cd deploy
docker compose -f docker-compose.hostinger.yml --env-file .env up -d --build
```

### Auto-deploy from GitHub (`main`)

On every push to `main`, GitHub Actions SSHs into the VPS and runs the update above.

1. On the VPS, create a deploy key (once):

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f /root/.ssh/github_deploy -N ""
cat /root/.ssh/github_deploy.pub >> /root/.ssh/authorized_keys
cat /root/.ssh/github_deploy
```

2. In the GitHub repo → **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|--------|--------|
| `VPS_HOST` | `76.13.171.142` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | full private key from `/root/.ssh/github_deploy` |

3. Keep `/opt/woaoweb/deploy/.env` only on the server (never commit it).

4. Workflow file: `.github/workflows/deploy-hostinger.yml`

## Mundo cerrado (beta)

`WORLD_ACCESS_ALLOWLIST` lista las cuentas (nombre o email, separados por coma) que pueden usar personajes y entrar al mundo. El resto ve un aviso que las lleva a `/arenas`.

- **Solo existe en producción.** Sin la variable (local, tests) el mundo queda abierto para todos, así que no hace falta configurar nada para desarrollar.
- **Se carga como secret** porque el repo es público: `gh secret set WORLD_ACCESS_ALLOWLIST --repo leb90/WoaoWeb --body "cuenta,mail@ejemplo.com"`. El deploy lo copia al `.env` del VPS; si falta, `docker compose` frena el deploy y producción sigue como estaba.
- **Para cambiar la lista:** actualizar el secret y volver a correr el deploy.
- **Para probar el aviso en local:** `WORLD_ACCESS_ALLOWLIST=otra-cuenta pnpm --dir api dev`.
- **Para abrir el mundo:** borrar la línea de `docker-compose.hostinger.yml` y desplegar.

## Database Backups

```bash
mkdir -p /opt/woaoweb/backups
docker compose -f /opt/woaoweb/deploy/docker-compose.hostinger.yml --env-file /opt/woaoweb/deploy/.env exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "/opt/woaoweb/backups/aoweb-$(date +%F-%H%M%S).sql"
```

Restore into an empty database volume by placing the desired dump at `database/aoweb.sql`
before the first `docker compose up`.
