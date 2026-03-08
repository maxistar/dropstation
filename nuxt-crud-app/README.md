# Dropstation Nuxt Admin

This application is the admin/UI client for Dropstation.

It no longer owns the migrated device and point backend flows directly. Those flows are now served by `dropstation/backend-ts`, and Nuxt consumes them over HTTP.

## Setup

Install dependencies:

```bash
yarn install
```

## Local Development

Start the supporting services first:

```bash
cd ..
docker compose up -d db web phpmyadmin
bash scripts/bootstrap-mysql8.sh
cd backend-ts
cp .env.example .env
npm install
npm run dev
```

Then start the Nuxt app:

```bash
export NUXT_PUBLIC_BACKEND_TS_BASE_URL=http://localhost:3001
cd ../nuxt-crud-app
yarn dev
```

Nuxt runs on:

- `http://localhost:3000`

## Runtime Config

- `NUXT_PUBLIC_BACKEND_TS_BASE_URL`
  - default: `http://localhost:3001`
  - points Nuxt to the running `backend-ts` service

## Validation

```bash
yarn vitest
```

The migrated device, point, and capacitor flows now depend on `backend-ts`. Remaining Nuxt-local SQL handlers are legacy-only and currently limited to not-yet-migrated areas such as places.
