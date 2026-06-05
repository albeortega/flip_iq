# flip_iq
FlipIQ is a real estate investment analyzer that helps users evaluate property deals by estimating purchase costs, renovation expenses, resale value, and potential ROI.

## Deal Evaluation Formula

FlipIQ currently evaluates fix-and-flip deals with the 70% rule:

```text
Maximum offer = after-repair value x 70% - rehab costs - holding costs - selling costs - profit buffer
```

Example:

| Item | Amount |
| --- | ---: |
| Purchase price | $90,000 |
| After-repair value | $250,000 |
| 70% rule value | $175,000 |
| Rehab costs | -$35,000 |
| Financing costs | -$8,000 |
| Holding costs | -$15,000 |
| Cost of sale | -$7,000 |
| Profit buffer | -$25,000 |
| Maximum offer | $93,000 |
| Projected profit at purchase price | $95,000 |

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
    "purchasePrice": 90000,
    "afterRepairValue": 250000,
    "rehabCosts": 35000,
    "financingCosts": 8000,
    "holdingCosts": 15000,
    "sellingCosts": 7000,
    "profitBuffer": 25000
  }'
```

Expected `maximumOffer`:

```json
93000.00
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
