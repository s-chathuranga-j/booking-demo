# Haven & Pine booking demo

A full-stack hotel booking journey designed for browser, API, and AI-assisted test automation demonstrations.

The demo now includes a lightweight REST API so the same booking can be exercised through UI tests and direct API tests. API data is stored in memory and resets when the API process or container restarts.

## Run locally

Start the API in one terminal:

```bash
npm install
npm run dev:api
```

Start the UI in another terminal:

```bash
npm run dev
```

Open `http://localhost:5173`. The search calendar uses July 2026 for repeatable automation.

## Run with Docker

Build and start the production container:

```bash
docker compose up --build -d
```

Open `http://localhost:8080`. The container restarts automatically unless explicitly stopped.

### Booking flow variants

The home page includes a flow switcher for automation demonstrations:

- Standard: `http://localhost:8080/?flow=standard` — guest information has its own page before payment.
- A/B variant: `http://localhost:8080/?flow=checkout-guest` — guest information remains inside checkout.

The selected flow is saved in session storage for the rest of the booking journey.

## API testing

When running through Docker, the API is available through the same host at `http://localhost:8080/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API health |
| `GET` | `/api/rooms` | List room inventory |
| `GET` | `/api/packages` | List packages |
| `GET` | `/api/extras` | List optional extras |
| `POST` | `/api/quotes` | Validate selections and calculate a quote |
| `POST` | `/api/bookings` | Create a completed booking |
| `GET` | `/api/bookings/{reference}` | Retrieve a booking created during the current API session |
| `GET` | `/api/openapi.json` | Download the OpenAPI contract |

Example:

```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/rooms
```

Successful UI checkout now calls `POST /api/bookings`. The resulting booking reference can then be queried through `GET /api/bookings/{reference}`, which enables combined UI/API automation scenarios.

Useful commands:

```bash
# View logs
docker compose logs -f

# Stop and remove the container
docker compose down
```

## Demo payment cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any `MM/YY` expiry and any three-digit CVV.

The card form is hosted inside a same-origin iframe. No payment or personal data leaves the browser.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Automation selectors use stable, unique `data-test-id` values. Repeated content is keyed by domain identifiers rather than array positions.
