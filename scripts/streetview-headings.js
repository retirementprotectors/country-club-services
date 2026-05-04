#!/usr/bin/env node
/**
 * streetview-headings.js
 * MUS-CCS-FEAT-002 — Pre-compute smart Street View headings
 *
 * For each house: call Street View metadata API → bake `heading` into the CSV
 * so renderStreetView aims the camera AT the house (not down the road).
 *
 * Uses the FRONT-END Maps API key (from crm/config.js) with a spoofed Referer
 * header to satisfy the path-restricted referrer match. The server-side GSM
 * GOOGLE_MAPS_API_KEY does not have Street View Static API enabled, so we
 * tunnel through the front-end key's permissions for this one-time bake.
 *
 * Usage:
 *   node scripts/streetview-headings.js
 *
 * Idempotent: skips rows that already have heading. Re-run safe.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CRM_CONFIG_PATH = path.join(__dirname, '..', 'crm', 'config.js');
const cfgRaw = fs.readFileSync(CRM_CONFIG_PATH, 'utf-8');
const m = cfgRaw.match(/mapsApiKey:\s*['"]([^'"]+)['"]/);
if (!m || !m[1] || m[1].includes('TBD')) {
  console.error('FATAL: front-end Maps key not set in crm/config.js');
  process.exit(1);
}
const KEY = m[1];

const REFERER = 'https://retirementprotectors.github.io/country-club-services/crm/';

const CSV_PATH = path.join(__dirname, '..', 'data', 'neighborhood.csv');
const CACHE_PATH = path.join(__dirname, '..', 'data', '.streetview-cache.json');

function toRad(d) { return d * Math.PI / 180; }
function toDeg(r) { return r * 180 / Math.PI; }
function bearing(lat1, lng1, lat2, lng2) {
  const f1 = toRad(lat1), f2 = toRad(lat2);
  const dl = toRad(lng2 - lng1);
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return Math.round((toDeg(Math.atan2(y, x)) + 360) % 360);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Referer: REFERER } }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  // Force-purge stale cache (REQUEST_DENIED from prior server-key attempt)
  let cache = {};
  if (fs.existsSync(CACHE_PATH)) {
    const old = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    for (const [k, v] of Object.entries(old)) {
      if (v && v.status === 'OK') cache[k] = v;
    }
  }

  const lines = raw.split('\n');
  let headerIdx = lines.findIndex(l => l && !l.startsWith('#'));
  let headers = lines[headerIdx].split(',');
  const newCols = ['pano_lat', 'pano_lng', 'heading'];
  for (const c of newCols) if (!headers.includes(c)) headers.push(c);
  lines[headerIdx] = headers.join(',');

  const colIdx = (name) => headers.indexOf(name);
  const I_LAT = colIdx('lat');
  const I_LNG = colIdx('lng');
  const I_PANO_LAT = colIdx('pano_lat');
  const I_PANO_LNG = colIdx('pano_lng');
  const I_HEADING = colIdx('heading');
  const I_ID = colIdx('id');

  let success = 0, failed = 0, skipped = 0, cacheHits = 0;
  const total = lines.length - headerIdx - 1;
  console.log(`Smart Street View headings · ${total} rows · referer-spoofed front-end key\n`);

  for (let i = headerIdx + 1; i < lines.length; i++) {
    if (!lines[i] || lines[i].startsWith('#')) continue;
    let cells = lines[i].split(',');
    while (cells.length < headers.length) cells.push('');

    const id = cells[I_ID];
    const lat = parseFloat(cells[I_LAT]);
    const lng = parseFloat(cells[I_LNG]);

    // Skip rows with valid (numeric) heading already
    const existing = cells[I_HEADING];
    if (existing && /^[0-9]+$/.test(existing)) {
      skipped++;
      continue;
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      cells[I_HEADING] = 'no-coords';
      lines[i] = cells.join(',');
      failed++;
      continue;
    }

    let panoData = cache[id];
    if (panoData) {
      cacheHits++;
    } else {
      const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&radius=200&source=outdoor&key=${KEY}`;
      try {
        panoData = await fetchJson(url);
        if (panoData.status === 'OK') cache[id] = panoData;
      } catch (e) {
        cells[I_HEADING] = 'fetch-fail';
        lines[i] = cells.join(',');
        failed++;
        continue;
      }
    }

    if (panoData.status === 'OK' && panoData.location) {
      const pLat = panoData.location.lat;
      const pLng = panoData.location.lng;
      const hdg = bearing(pLat, pLng, lat, lng);
      cells[I_PANO_LAT] = String(pLat);
      cells[I_PANO_LNG] = String(pLng);
      cells[I_HEADING] = String(hdg);
      lines[i] = cells.join(',');
      success++;
    } else {
      cells[I_HEADING] = 'no-pano';
      lines[i] = cells.join(',');
      failed++;
    }

    if ((success + failed) % 40 === 0 && (success + failed) > 0) {
      process.stdout.write(`  ${success + failed}/${total}…`);
    }
    if (!cacheHits) await new Promise(r => setTimeout(r, 25));
  }

  console.log(`\n\nDone:  ${success} smart-aimed · ${failed} no-pano · ${skipped} skipped · ${cacheHits} cache hits`);

  fs.writeFileSync(CSV_PATH, lines.join('\n'));
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  console.log(`CSV: ${CSV_PATH}`);
  console.log(`Cache: ${CACHE_PATH}`);
}

main().catch(e => { console.error(e); process.exit(1); });
