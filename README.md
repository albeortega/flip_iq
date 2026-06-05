# flip_iq
FlipIQ is a real estate investment analyzer that helps users evaluate property deals by estimating purchase costs, renovation expenses, resale value, and potential ROI.

## Deal Evaluation Formula

FlipIQ currently evaluates fix-and-flip deals with the 70% rule:

```text
Maximum offer = after-repair value x 70% - repair costs - holding/selling costs - profit buffer
```

Example:

| Item | Amount |
| --- | ---: |
| After-repair value | $250,000 |
| 70% rule value | $175,000 |
| Repairs | -$35,000 |
| Holding/selling costs | -$15,000 |
| Profit buffer | -$25,000 |
| Maximum offer | $100,000 |

## Run Locally

Run the API:

```bash
./gradlew bootRun
```

PostgreSQL is the only supported database. Start it when running database-backed features:

```bash
docker compose up -d
./gradlew bootRun --args='--spring.profiles.active=postgres'
```

Evaluate a deal:

```bash
curl -X POST http://localhost:8080/api/deals/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "propertyAddress": "123 Main Street",
    "afterRepairValue": 250000,
    "repairCosts": 35000,
    "holdingAndSellingCosts": 15000,
    "profitBuffer": 25000
  }'
```

Expected `maximumOffer`:

```json
100000.00
```

## Front End

The React front end lives in `frontend/` and uses Material UI components. Start the API first, then run the UI:

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` requests to `http://localhost:8080`, so the home page can call the Spring Boot deal evaluation endpoint during local development.

For Vercel deployments, set `VITE_API_BASE_URL` to the deployed API origin, for example `https://api.example.com`. The Vite dev proxy is only used locally.
