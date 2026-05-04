// Country Club Services — front-end config
// mapsApiKey: browser-restricted Maps API key (Street View + Static + Embed only)
// HTTP referrer restriction: https://retirementprotectors.github.io/country-club-services/*
// Provisioned 2026-05-04 per JDM. Safe to commit — referrer restriction is the security boundary.

/**
 * CRM Maps Configuration
 * MUS-CCS-MAPS-001
 *
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to crm/config.js
 * 2. Replace the placeholder with a browser-restricted Maps API key.
 *
 * How to provision a browser-restricted key:
 *   a. Go to https://console.cloud.google.com/apis/credentials?project=claude-mcp-484718
 *   b. Create Credentials → API Key
 *   c. Under "Application restrictions" → select "HTTP referrers (websites)"
 *   d. Add: countryclubservices.com/* and localhost/* (for local testing)
 *   e. Under "API restrictions" → restrict to "Maps JavaScript API" + "Street View Static API"
 *   f. Copy the key value into config.js
 *
 * crm/config.js is gitignored — your key will never be committed.
 * crm/config.example.js IS committed — keep the placeholder here, never a real key.
 *
 * Re-geocoding (if the neighborhood CSV grows):
 *   KEY=$(gcloud secrets versions access latest --secret=GOOGLE_MAPS_API_KEY --project=claude-mcp-484718)
 *   MAPS_API_KEY=$KEY node scripts/geocode-neighborhood.js
 * The script is idempotent — it skips already-geocoded rows.
 */
window.CCS_CONFIG = {
  mapsApiKey: 'AIzaSyDVQRk-X_Vyb9dNxBzsxC2r20Aavk2RTMs',
};
