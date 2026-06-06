# flip_iq

FlipIQ is the React front end for the FlipIQ real estate investment analyzer.

The Spring Boot API now lives in:

```text
https://github.com/albeortega/flip_iq_services
```

## Run Locally

Install and run the front end:

```bash
npm run frontend:install
npm run dev
```

The app is served from `frontend/` with Vite.

For local API calls, start the backend service separately and keep the Vite proxy target in `frontend/vite.config.ts` pointed at the backend URL.

## Production API URL

Set this environment variable in Vercel:

```text
VITE_API_BASE_URL=https://your-backend-service-url
```

Do not include `/api` at the end. The front end calls:

```text
/api/deals/evaluate
```

After changing `VITE_API_BASE_URL`, redeploy the Vercel project because Vite reads this value at build time.

## Build

From the repo root:

```bash
npm run build
```
