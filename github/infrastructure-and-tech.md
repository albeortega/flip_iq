# Frontend Infrastructure and Tech Stack

## Core Application

- Framework: React
- Language: TypeScript
- Build tool: Vite
- Component library: Material UI
- API style: JSON calls to the FlipIQ services API

## Local Development

- Install dependencies with `npm run frontend:install`
- Run the app with `npm run dev`
- Build the app with `npm run build`
- Local API proxy is configured in `frontend/vite.config.ts`

## Deployment

- Hosting target: Vercel
- Production build output: `frontend/dist`
- Backend API base URL: `VITE_API_BASE_URL`

## Backend

The backend Spring Boot API has moved to:

```text
https://github.com/albeortega/flip_iq_services
```
