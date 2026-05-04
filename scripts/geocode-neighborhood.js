#!/usr/bin/env node
/**
 * geocode-neighborhood.js
 * MUS-CCS-MAPS-001 — One-time geocoding script
 *
 * Reads data/neighborhood.csv, calls Google Geocoding API for each address,
 * writes lat/lng/geocode_status back to the CSV.
 *
 * Idempotent: skips rows that already have lat/lng.
 * Cache: data/.geocode-cache.json stores raw API responses so re-runs are free.
 *
 * Usage:
 *   1. Get the Maps API key from GCP Secret Manager:
 *      KEY=$(gcloud secrets versions access latest --secret=GOOGLE_MAPS_API_KEY --project=claude-mcp-484718)
 *   2. Run:
 *      MAPS_API_KEY=$KEY node scripts/geocode-neighborhood.js
 *
 * Rate limit: 50 req/sec max — script batches in groups of 40 with 1s pause.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── Config ──────────────────────────────────────────────────────────────────
const MAPS_API_KEY = process.env.MAPS_API_KEY;
const CSV_PATH     = path.join(__dirname, '../data/neighborhood.csv');
const CACHE_PATH   = path.join(__dirname, '../data/.geocode-cache.json');
const COUNTY_SUFFIX = ', Polk County, IA';
const BATCH_SIZE   = 40;
const BATCH_DELAY  = 1200; // ms between batches (~33 req/sec, safe under 50/sec ceiling)

if (!MAPS_API_KEY) {
  console.error('ERROR: MAPS_API_KEY env var not set.');
  console.error('Get it via: KEY=$(gcloud secrets versions access latest --secret=GOOGLE_MAPS_API_KEY --project=claude-mcp-484718)');
  console.error('Then run:   MAPS_API_KEY=$KEY node scripts/geocode-neighborhood.js');
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data.slice(0, 200))); }
      });
    }).on('error', reject);
  });
}

// ─── CSV Parser (handles comment lines starting with #) ──────────────────────
function parseCSV(content) {
  const allLines = content.split('\n');
  const commentLines = [];
  const dataLines = [];

  for (const line of allLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      commentLines.push(line);
    } else if (trimmed) {
      dataLines.push(line);
    }
  }

  if (dataLines.length < 2) throw new Error('CSV has no data rows');

  const headers = dataLines[0].split(',').map(h => h.trim());
  const rows = dataLines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = vals[i] !== undefined ? vals[i] : ''; });
    return row;
  });

  return { commentLines, headers, rows };
}

function serializeCSV(commentLines, headers, rows) {
  const headerLine = headers.join(',');
  const dataLines = rows.map(row =>
    headers.map(h => {
      const val = row[h] !== undefined ? String(row[h]) : '';
      // Wrap in quotes if contains comma or quote
      if (val.includes(',') || val.includes('"')) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(',')
  );
  return [...commentLines, headerLine, ...dataLines].join('\n') + '\n';
}

// ─── Geocode single address ───────────────────────────────────────────────────
async function geocodeAddress(address, cache) {
  const cacheKey = address.toLowerCase().trim();

  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const query = encodeURIComponent(address + COUNTY_SUFFIX);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${MAPS_API_KEY}`;

  const data = await httpsGet(url);

  const result = {
    status: data.status,
    lat: null,
    lng: null,
  };

  if (data.status === 'OK' && data.results && data.results.length > 0) {
    const loc = data.results[0].geometry.location;
    result.lat = loc.lat;
    result.lng = loc.lng;
  }

  cache[cacheKey] = result;
  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('MUS-CCS-MAPS-001 — Geocoding neighborhood.csv');
  console.log('━'.repeat(50));

  // Load cache
  let cache = {};
  if (fs.existsSync(CACHE_PATH)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
      console.log(`Cache loaded: ${Object.keys(cache).length} cached addresses`);
    } catch (e) {
      console.warn('Cache unreadable, starting fresh');
    }
  }

  // Parse CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
  const { commentLines, headers, rows } = parseCSV(csvContent);

  // Ensure columns exist
  if (!headers.includes('lat')) headers.push('lat');
  if (!headers.includes('lng')) headers.push('lng');
  if (!headers.includes('geocode_status')) headers.push('geocode_status');

  // Filter rows that need geocoding
  const needsGeocode = rows.filter(r => !r.lat || r.lat === '' || r.geocode_status === 'failed');
  const alreadyDone  = rows.length - needsGeocode.length;

  console.log(`Total rows: ${rows.length}`);
  console.log(`Already geocoded: ${alreadyDone}`);
  console.log(`Need geocoding: ${needsGeocode.length}`);

  if (needsGeocode.length === 0) {
    console.log('\nAll rows already geocoded. Nothing to do.');
    process.exit(0);
  }

  // Build lookup map for row updates
  const rowMap = {};
  rows.forEach(r => { rowMap[r.id] = r; });

  let success = 0;
  let failed = 0;
  let skipped = 0;

  // Process in batches
  for (let i = 0; i < needsGeocode.length; i += BATCH_SIZE) {
    const batch = needsGeocode.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(needsGeocode.length / BATCH_SIZE);
    process.stdout.write(`\nBatch ${batchNum}/${totalBatches} (rows ${i + 1}–${Math.min(i + BATCH_SIZE, needsGeocode.length)})... `);

    for (const row of batch) {
      const address = row.address;
      if (!address) { skipped++; continue; }

      try {
        const geo = await geocodeAddress(address, cache);

        if (geo.status === 'OK' && geo.lat !== null) {
          rowMap[row.id].lat = geo.lat.toFixed(7);
          rowMap[row.id].lng = geo.lng.toFixed(7);
          rowMap[row.id].geocode_status = 'ok';
          success++;
          process.stdout.write('.');
        } else {
          rowMap[row.id].lat = '';
          rowMap[row.id].lng = '';
          rowMap[row.id].geocode_status = 'failed';
          failed++;
          console.warn(`\n  FAILED: ${address} — API status: ${geo.status}`);
        }
      } catch (err) {
        rowMap[row.id].lat = '';
        rowMap[row.id].lng = '';
        rowMap[row.id].geocode_status = 'failed';
        failed++;
        console.warn(`\n  ERROR: ${address} — ${err.message}`);
      }
    }

    // Save cache after every batch (crash-safe)
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

    // Rate-limit pause between batches
    if (i + BATCH_SIZE < needsGeocode.length) {
      await sleep(BATCH_DELAY);
    }
  }

  // Write updated CSV
  const updatedCSV = serializeCSV(commentLines, headers, rows);
  fs.writeFileSync(CSV_PATH, updatedCSV);

  console.log('\n\n' + '━'.repeat(50));
  console.log(`Geocoding complete:`);
  console.log(`  Success : ${success}`);
  console.log(`  Failed  : ${failed}`);
  console.log(`  Skipped : ${skipped}`);
  console.log(`  Cache   : ${Object.keys(cache).length} entries`);
  console.log(`\nCSV updated: ${CSV_PATH}`);
  console.log(`Cache saved: ${CACHE_PATH}`);

  if (failed > 0) {
    console.log(`\nNote: ${failed} addresses failed. Re-run to retry (idempotent).`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\nFATAL:', err.message);
  process.exit(1);
});
