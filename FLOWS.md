# Flows and how to trigger them

Every journey in the Haven & Pine demo, what it looks like, and how to switch it on. URLs below use the Docker address `http://localhost:8080`; with `npm run dev` use `http://localhost:5173` instead.

## Quick reference

| Flow | Trigger | What changes |
| --- | --- | --- |
| Standard booking | `/?flow=standard` (the default) | Search, Room, Package, Guest, Payment, each on its own page |
| A/B variant | `/?flow=checkout-guest` | The guest page is merged into checkout |
| Breakfast included | `/?flow=breakfast-included` | The package page is removed; Morning Ritual comes with every room |
| UI drift | `?ui=v2` (back with `?ui=v1`) | Buttons and form labels are renamed; pages and `data-test-id`s stay the same |
| Tax defect | `?bug=tax` (back with `?bug=none`) | The UI charges 21% tax instead of 12%; the API still charges 12% |
| Guest | Nothing to do | Standard prices |
| Member | Sign in from the header or the rooms page | 15% off every room, guest form prefilled |

The three flows can also be picked with the "Demo flow" switcher on the search card. The two switches have no on-screen control; they are set by URL only.

## How the switches behave

- A query parameter works on any page, and several combine: `/?flow=breakfast-included&ui=v2&bug=tax`.
- The app reads the parameter once and saves it in the tab's session storage. It then disappears from the address bar on the next page, but stays on for the rest of the journey.
- "Make another booking" keeps the flow, both switches and the signed-in member.
- To start clean, open a new tab (session storage is per tab) or set each value back explicitly.
- While `ui=v2` or `bug=tax` is on, a small badge in the bottom-left corner says so ("UI v2", "Bug: tax 21%"). The badge is `aria-hidden`, so a test agent reading the page does not see it.

## The booking journey

The standard flow, page by page:

| Step | Route | What happens |
| --- | --- | --- |
| Search | `/` | Choose destination, check-in and check-out in the calendar, rooms and guests per room, flexible dates, accessible room |
| Room | `/rooms` | Filter by maximum price (slider), breakfast included (checkbox), sort by price; select a room |
| Package | `/packages` | Pick one package and any extras |
| Guest | `/guest-information` | Lead guest details |
| Payment | `/checkout` | Card details in the payment iframe, optional notes file, terms, confirm |
| Confirmation | `/confirmation` | Booking reference, stay summary, total paid |
| My Booking | `/my-booking` | Full booking details and price breakdown |

The progress bar at the top follows the flow, so it shows five steps in the standard flow and four in the other two.

### Search

- The calendar shows two months side by side, starting with the current one, and only offers today and later; the previous and next buttons page up to 11 months ahead. Any date up to four weeks out is on screen without paging. Each day button's accessible name is its ISO date (`2026-10-05`), as is its test id (`search-checkin-day-2026-10-05`): Saffron records ISO dates as `{date+N}`, so a recording replays on any day.
- Choosing a check-in opens the check-out calendar straight away, starting on the check-in month, with every day up to check-in disabled.
- Rooms: 1 to 3. Each room has its own collapsible section with adults (1 to 4) and children (0 to 3); the totals add up across rooms.

### Rooms

| Room | Per night | Notes |
| --- | --- | --- |
| Garden Queen | €185 | Breakfast |
| Deluxe King | €245 | Breakfast |
| Pine Suite | €365 | Breakfast |
| Rooftop Loft | €410 | Sold out, the button is disabled |

The price slider runs from €180 to €420; moving it below a room's rate hides that room and updates "N rooms match your stay".

### Packages and extras

| Package | Per night |
| --- | --- |
| Simply Stay | Included |
| Morning Ritual | €28 |
| The Haven Retreat | €85 |

| Extra | Price | Most you can add |
| --- | --- | --- |
| Secure parking | €22 | 1 |
| Airport transfer | €65 each | 2 |
| Sparkling wine | €42 a bottle | 3 |

Ticking an extra adds one and shows + and - buttons; the + stops at the maximum. The continue button stays disabled until a package is picked.

### Payment

The card form lives in a same-origin iframe (`/payment-frame`). Validating the card there reports back to the checkout page.

| Card | Result |
| --- | --- |
| `4242 4242 4242 4242` | Approved |
| `4000 0000 0000 0002` | Declined |

Any `MM/YY` expiry and any three-digit CVV work. The optional notes upload accepts a `.md` or `.txt` file and sends its content with the booking.

## Flow variants

### Standard: `/?flow=standard`

Search, Room, Package, Guest, Payment. The package page says "Continue to guest information".

### A/B variant: `/?flow=checkout-guest`

Search, Room, Package, Checkout. There is no guest page: the guest form sits inside checkout above the payment section, the heading reads "Complete your booking", and a "Variant: guest details at checkout" badge shows. Opening `/guest-information` redirects to `/checkout`. This is a page merged into another, so a test recorded on the standard flow heals.

### Breakfast included: `/?flow=breakfast-included`

Search, Room, Guest, Payment. Selecting a room applies the Morning Ritual package and goes straight to the guest page; the rooms page shows a "Variant: Morning Ritual breakfast included with every room" badge and the summary says "Morning Ritual · breakfast included". This is a page removed from the flow.

## Demo switches

### UI drift: `?ui=v2`

Renames what a user reads, the way a release would, and nothing else. Pages, routes, headings and `data-test-id` values stay the same, so tests that click by visible name need to heal, and checks on headings still pass.

| Where | v1 (default) | v2 |
| --- | --- | --- |
| Search | Search available rooms | Check availability |
| Rooms | Select room | Book this room |
| Packages, standard flow | Continue to guest information | Next: your details |
| Packages, other flows | Continue to checkout | Next: checkout |
| Guest form | First name | Given name |
| Guest form | Last name | Family name |
| Guest form | Email | Email address |
| Guest page | Continue to payment | Review and pay |
| Card iframe | Validate card | Verify card |
| Checkout terms | I agree to the booking conditions and cancellation policy. | I accept the terms and cancellation policy. |
| Checkout | Confirm and pay | Complete booking |

The guest form labels change wherever the form appears, including inside checkout in the A/B variant.

### Tax defect: `?bug=tax`

The UI charges 21% tax instead of 12%. Every total on screen is wrong: the booking summary, confirmation and My Booking. The booking API is not affected and still charges 12%, so the booking goes through. A check on a total fails, which is the point: it is a real defect, not something to heal.

Example, Garden Queen for 2 nights with Morning Ritual and no extras:

| | Correct | With `?bug=tax` |
| --- | --- | --- |
| Guest | Taxes €51.12, total €477.12 | Taxes €89.46, total €515.46 |
| Member | Taxes €44.46, total €414.96 | Taxes €77.80, total €448.31 |

## Guest and member

Everyone can book as a guest; signing in is optional and can happen at any point.

- **Where:** the "Sign in" link in the header, or "Sign in for member prices" on the rooms page. After signing in you return to the page you came from; "Continue as guest" goes back without signing in.
- **Account:** `member@havenpine.test`. The password is the API's `DEMO_MEMBER_PASSWORD` environment variable, `pine-circle-2026` when it is not set. Keep it out of test text with `{env:DEMO_MEMBER_PASSWORD}`.
- **What changes when signed in:**
  - The header shows "Nora · Pine Circle" and a "Sign out" button.
  - Rooms show the old price crossed out next to the member price (Garden Queen €185 becomes €157.25).
  - The summary and My Booking add a "Member discount" line.
  - The guest form starts with the member's title, name and email filled in.
  - The booking is sent with the member's token and the API applies the same discount, so page and API totals match.
- **Sign out:** the header button signs out and returns to the search page; prices go back to guest prices at once.

## Negative paths

| Path | How to trigger | What you see |
| --- | --- | --- |
| No dates | Search without choosing check-in and check-out | "Choose a check-out date after your check-in date." |
| Sold out | Rooftop Loft on the rooms page | "Sold out" badge, disabled "Unavailable" button |
| No package | Try to continue on the package page | The continue button stays disabled |
| Missing guest details | Leave a required field empty and continue | "Complete all required guest details." |
| Card not validated | Confirm before validating the card | "Validate your card details in the secure payment form." |
| Incomplete card | Validate with a short number, bad expiry or no name | "Please enter complete, valid card details." inside the iframe |
| Declined card | `4000 0000 0000 0002`, then confirm | "Card ending 0002: declined", then "Payment declined. Try the demo success card instead." |
| Terms not accepted | Confirm without ticking the terms | "Accept the booking terms to continue." |
| Wrong notes file | Upload anything other than `.md` or `.txt` | "Choose a Markdown (.md) or text (.txt) file." |
| Wrong password | Sign in with a bad password | "The email or password is incorrect." |
| Expired member session | Sign in, restart the API, then confirm a booking | "Your member session has expired. Sign in again to keep member prices." |
| Deep link without a booking | Open `/rooms`, `/packages`, `/checkout`, `/confirmation` or `/my-booking` in a fresh tab | Redirected to the search page |

## After booking

- The confirmation page shows the booking reference (`HP-` plus the first three letters of the guest's last name plus `-2701`, for example `HP-LIN-2701`), the guest's email and the total paid.
- "My Booking" shows the full breakdown; "Back to confirmation" returns.
- The same booking can be fetched from the API with `GET /api/bookings/{reference}` for combined UI and API checks. Bookings live in API memory until it restarts.
- "Make another booking" clears the booking and keeps the flow, switches and member.

## API-only flows

The API runs behind the same host at `/api`; the full contract is at `/api/openapi.json`.

| Flow | Request |
| --- | --- |
| Health | `GET /api/health` |
| Catalog | `GET /api/rooms`, `/api/packages`, `/api/extras` |
| Guest quote | `POST /api/quotes` with search, room, package and extras |
| Member quote | `POST /api/auth/login` with `{ email, password }`, then `POST /api/quotes` with `Authorization: Bearer <token>` |
| Create a booking | `POST /api/bookings` (201 with a `Location` header); add the bearer token for member prices |
| Fetch a booking | `GET /api/bookings/{reference}`, 404 `BOOKING_NOT_FOUND` for an unknown one |
| Errors | Every error returns `{ error: { code, message, details, requestId } }`, for example `INVALID_DATES`, `ROOM_UNAVAILABLE`, `PAYMENT_NOT_APPROVED`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED` |
