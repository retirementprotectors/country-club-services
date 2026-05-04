# Country Club Services CRM

## Initial neighborhood data — already in repo

Brooks' Country Club neighborhood is pre-loaded as a CSV at `../data/neighborhood.csv`:
- **444 residential properties** across Country Club Blvd, Lake Shore Dr, South Shore Dr, NW 132nd–141st Streets, and Lake Pointe Dr
- Source: Polk County Assessor public records (consolidated 2026-05-04)
- Schema: `id, address, household_name, phone, email, status, services_interested, notes, assessed_value, parcel, source_file`
- All 444 rows default to `status=not-contacted`

### How to load it on first run
1. Open `crm/index.html` in any modern browser
2. Click the **Import CSV** button (top-right)
3. Drop the file `../data/neighborhood.csv` (or open it from your computer)
4. The CRM stores all 444 rows in localStorage under key `ccs_crm_v1`
5. Refresh — your neighborhood is now searchable, sortable, and door-knock-ready

### Sorting tips for door-knock day
- **By assessed value (desc)** — biggest houses first if Brooks wants to start with the highest-paying potential
- **By street + house number** — efficient walking route
- **By status = `not-contacted`** — fresh prospects only

### Updating data later
- The `assessor` source data won't change much year-to-year — re-export from the county site annually
- Brooks' status updates and service history live in localStorage only (not re-imported on refresh)
- Use **Export CSV** before any major change for backup

---


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
