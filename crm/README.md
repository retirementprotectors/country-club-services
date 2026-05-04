# Country Club Services CRM

Browser-based neighborhood CRM for Brooks Millang. No backend, no login, no build step.

## Open It

Open `crm/index.html` in any browser. Works offline. All data lives in your browser's localStorage.

## What It Does

- Tracks every house in your territory: status, contact info, services, notes
- **Today's Route** — shows every house you should knock today (follow-up due or not yet contacted)
- **Door-knock mode** — one tap to log "Knocked, No Answer" / "Pitched, Thinking" / "Booked!" / "Declined" / "Do Not Knock"
- **Service history** — log every completed job with date, amount, and notes. Lifetime customer value calculated automatically.
- **Import CSV** — drop in your neighborhood list from Google Sheets or Excel
- **Export CSV** — full data export anytime

## Statuses (Pipeline)

| Status | What It Means |
|--------|--------------|
| Not Contacted | Haven't knocked yet |
| Knocked, No Answer | Nobody home — try again |
| Pitched, Thinking | They're interested, follow up |
| Booked | Job is scheduled |
| Active Customer | Paying, repeat customer |
| Declined | Not interested — respect it |
| Do Not Knock | Skip this house every time |

## Sample Data

`data/neighborhood-sample.csv` — 20 placeholder addresses (no real names). Replace with real streets before you go door-knocking.

## Schema

`data/neighborhood-schema.json` — full field definitions for every house record.

## Booking Link

The "Copy Booking Link" button copies `https://countryclubservices.com/book?address=...` — update the URL in the script once the booking page is live (search for `BOOKING_URL` in `crm/index.html`).

## Data Reset

To wipe all data: open browser DevTools → Application → Local Storage → delete key `ccs_crm_v1`.
