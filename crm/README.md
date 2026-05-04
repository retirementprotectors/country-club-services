# Country Club Services CRM

## Initial neighborhood data — already in repo

Brooks' Country Club neighborhood is pre-loaded as a CSV at `../data/neighborhood.csv`:
- **444 residential properties** across Country Club Blvd, Lake Shore Dr, South Shore Dr, NW 132nd–141st Streets, and Lake Pointe Dr
- Source: Polk County Assessor public records (consolidated 2026-05-04)
- Schema: `id, address, household_name, phone, email, status, services_interested, notes, assessed_value, parcel, source_file, lat, lng, geocode_status`
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

## Maps Setup (MUS-CCS-MAPS-001)

The CRM has 5 map features. Three work immediately with zero setup. Two need a browser-restricted Maps API key.

### Works right now (no key needed)
- **Map View tab** — Leaflet/OpenStreetMap, all 444 pins color-coded by status
- **Get Directions (📍 button)** — opens Google Maps turn-by-turn from current location to the house
- **Walking Route optimizer** — nearest-neighbor algorithm sorts today's stops by walking distance

### Needs a browser-restricted key
- **Street View thumbnail** in the house detail panel
- Re-geocoding if the neighborhood CSV grows

### How to provision the Maps API key
1. Go to [GCP Credentials](https://console.cloud.google.com/apis/credentials?project=claude-mcp-484718)
2. Create Credentials → API Key
3. Application restrictions → HTTP referrers → add `countryclubservices.com/*` and `localhost/*`
4. API restrictions → restrict to "Maps JavaScript API" and "Street View Static API"
5. Copy `crm/config.example.js` → `crm/config.js` (gitignored)
6. Replace `{{TBD: provision browser-restricted Maps key per JDM}}` with your key

### How to geocode the CSV (adds lat/lng to all 444 addresses)
```bash
# Get the server-side key from GCP Secret Manager (requires Secret Accessor role)
KEY=$(gcloud secrets versions access latest --secret=GOOGLE_MAPS_API_KEY --project=claude-mcp-484718)
MAPS_API_KEY=$KEY node scripts/geocode-neighborhood.js
```
The script is idempotent — re-run anytime if the CSV grows. It skips already-geocoded rows.
Geocoded CSV gets `lat`, `lng`, `geocode_status` columns. Re-import into the CRM after running.

## What It Does

- Tracks every house in your territory: status, contact info, services, notes
- **Map View** — all 444 houses on an interactive map, color-coded by status. Click any pin to open the house detail panel.
- **Today's Route** — shows every house you should knock today (follow-up due or not yet contacted)
- **Walking Route** — tap "Generate Walking Route" on the Today's Route tab to sort stops by nearest-neighbor distance from your current location
- **Get Directions (📍)** — every house row has a directions button. One tap → Google Maps turn-by-turn, no key needed.
- **Street View** — house detail panel shows a Street View thumbnail (requires Maps API key + geocoded lat/lng)
- **Door-knock mode** — one tap to log "Knocked, No Answer" / "Pitched, Thinking" / "Booked!" / "Declined" / "Do Not Knock"
- **Service history** — log every completed job with date, amount, and notes. Lifetime customer value calculated automatically.
- **Import CSV** — drop in your neighborhood list from Google Sheets or Excel
- **Export CSV** — full data export anytime (includes lat/lng)

## Statuses (Pipeline)

| Status | Map Marker | What It Means |
|--------|-----------|--------------|
| Not Contacted | Gray | Haven't knocked yet |
| Knocked, No Answer | Orange | Nobody home — try again |
| Pitched, Thinking | Purple | They're interested, follow up |
| Booked | Green | Job is scheduled |
| Active Customer | Dark Green | Paying, repeat customer |
| Declined | Red | Not interested — respect it |
| Do Not Knock | Charcoal | Skip this house every time |

## Sample Data

`data/neighborhood-sample.csv` — 20 placeholder addresses (no real names). Replace with real streets before you go door-knocking.

## Schema

`data/neighborhood-schema.json` — full field definitions for every house record.

## Booking Link

The "Copy Booking Link" button copies `https://countryclubservices.com/book?address=...` — update the URL in the script once the booking page is live (search for `BOOKING_URL` in `crm/index.html`).

## Data Reset

To wipe all data: open browser DevTools → Application → Local Storage → delete key `ccs_crm_v1`.
