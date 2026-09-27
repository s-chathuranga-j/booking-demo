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

Open `http://localhost:5173`. The search calendar starts at today and only offers future dates, so tests choose dates relative to the run.

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
- Breakfast included: `http://localhost:8080/?flow=breakfast-included`: every room comes with the Morning Ritual breakfast package, so the package page is skipped and room selection goes straight to guest information.

The selected flow is saved in session storage for the rest of the booking journey.

### Demo controls

Two more switches, set by URL only so nothing on screen gives them away. Like the flow, each is saved in session storage until you switch it back.

- UI drift: `?ui=v2` renames buttons and form labels the way a release would: "Search available rooms" becomes "Check availability", "Select room" becomes "Book this room", "Continue to payment" becomes "Review and pay", "Confirm and pay" becomes "Complete booking", "First name" becomes "Given name", and so on. The `data-test-id` values do not change. `?ui=v1` switches back.
- A real defect: `?bug=tax` makes the UI charge 21% tax instead of 12%, so every total on screen is wrong while the booking API still charges 12%. `?bug=none` switches it off.

Combine them with the flow: `/?flow=breakfast-included&ui=v2`.

While either switch is on, a small badge sits in the bottom-left corner ("UI v2", "Bug: tax 21%") so a recording shows which mode is on. It is `aria-hidden`, so a test agent reading the page does not see it.

## Member sign-in (optional)

Everyone can book as a guest. Signing in from the header (or the "Sign in for member prices" link on the rooms page) shows member prices: 15% off every room, a "Member discount" line in the summary, and the lead guest's name and email filled in. The booking API applies the same discount, so UI and API totals agree.

- Email: `member@havenpine.test`
- Password: the `DEMO_MEMBER_PASSWORD` environment variable of the API, `pine-circle-2026` when it is not set.

Sessions live in API memory, so restarting the API signs everyone out; booking with an expired session returns an error instead of silently dropping the member price.

## API testing

When running through Docker, the API is available through the same host at `http://localhost:8080/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API health |
| `POST` | `/api/auth/login` | Sign in as the demo member; returns a bearer token |
| `GET` | `/api/rooms` | List room inventory |
| `GET` | `/api/packages` | List packages |
| `GET` | `/api/extras` | List optional extras |
| `POST` | `/api/quotes` | Validate selections and calculate a quote (member price with `Authorization: Bearer <token>`) |
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
