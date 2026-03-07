# Dropstation TypeScript Backend

This service is the primary backend going forward for Dropstation.

The legacy PHP backend still exists during transition, but new backend implementation should land here first.

## Scope

Current direction:

- TypeScript backend is the main implementation target
- PHP backend remains available as a legacy backend during coexistence
- the first migrated slice is the runtime/device watering workflow

## Local Development

From `dropstation/backend-ts`:

1. Install dependencies:

```bash
npm install
```

2. Start the Dropstation MySQL and PHP stack if needed:

```bash
cd ..
docker compose up -d db web phpmyadmin
bash scripts/bootstrap-mysql8.sh
```

3. Run the TypeScript backend:

```bash
npm run dev
```

The service defaults to:

- `HOST=0.0.0.0`
- `PORT=3001`
- `DB_HOST=db`
- `DB_PORT=3306`
- `DB_NAME=dropstation`
- `DB_USER=root`
- `DB_PASSWORD=gotechnies`

## Validation

Basic checks:

```bash
npm run check
npm run test
```

Runtime endpoint shape:

```bash
curl "http://localhost:3001/api/device/v1/watering?device=1a382ff4-5099-4be1-9e48-71eb7c36db27"
```

## Coexistence with PHP

- PHP remains available as the legacy backend during transition
- TypeScript is the primary backend implementation target
- behavior can be compared against the PHP runtime while migration continues
- the long-term goal is to retire the PHP backend after the TypeScript backend covers the required workflows
