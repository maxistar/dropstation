# Dropstation backend-ts deploy

Production compose file for `backend-ts`.

## Run on server

From repository root (`dropstation/`):

```bash
docker compose -f deploy/docker-compose.yml up -d
```

## Notes

- Exposes backend only on localhost: `127.0.0.1:3001`
- Uses image `dropstation-backend-ts:latest`
- Runtime variables are passed via environment (with defaults in compose)
- For production, set secrets/DB params via shell env or `.env` next to compose

## GitHub Actions auto-deploy

Workflow file: `.github/workflows/deploy-backend-ts.yml`

Triggers:
- push to `dev` branch (only when `backend-ts/**`, `deploy/**`, or workflow file changes)
- manual run (`workflow_dispatch`)

Required repository secrets:
- `DEPLOY_HOST` — server host/IP
- `DEPLOY_USER` — SSH user
- `DEPLOY_SSH_KEY` — private SSH key for deploy user
- `DEPLOY_PORT` (optional, default `22`)
- `DEPLOY_PATH` (optional, default `/opt/dropstation`)
