# World of Argentum — Developer Tools

App interna de administración de contenido. **Solo localhost.**

## Arranque

```bash
corepack pnpm -C developer install
# Editar developer/.env (ver .env.example)
corepack pnpm -C developer dev
```

Abrir: **http://127.0.0.1:3200**

Login por defecto (local): usuario/contraseña de `DEVELOPER_ADMIN_*` en `.env`.

## Qué edita

Fuentes reales del repo (sin duplicar datos):

- `api/src/jsons/objs.json`, `npcs.json`, crafting, smelting, balance, spells
- `server/jsons/spells.json` (en sync al guardar spells)
- Lectura de `server/mapas_source` (editor visual = FASE 2)
- Gráficos vía `frontend/public/init/graficos_optimized.json` + `frontend/public/graphics`

Ver `ARCHITECTURE.md` para detalles y reinicios requeridos.

## Seguridad

- Escucha en `127.0.0.1:3200` únicamente
- No agregar a docker-compose / Caddy / dominio público
- Auth obligatoria (páginas + APIs)
- Passwords en bcrypt (`.data/admins.json`)
- Backups en `.backups/` (gitignored)
