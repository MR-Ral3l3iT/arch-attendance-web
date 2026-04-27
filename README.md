# attendance-web

Admin and Teacher web app for ARCHD Attendance (Next.js).

This repository is also the temporary home for cross-project docs and local infra references.

## Getting started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment

- `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`)
- `NEXT_PUBLIC_APP_NAME`

## Central docs and infra

- Product/task docs: `docs/`
- Local compose reference: `infra/docker-compose.yml`

## Related repositories
- `attendance-api` (NestJS backend)
- `attendance-app` (Flutter mobile)
