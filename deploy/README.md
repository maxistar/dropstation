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
