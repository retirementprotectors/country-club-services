# Country Club Services

Brooks Millang's neighborhood service business — window washing, lawn / yardwork, and car detailing.

## What's in this repo

| Path | Purpose |
|------|---------|
| `index.html` | Public landing page (hero · services · about · how it works · trust) |
| `book.html` | Booking request form |
| `contact.html` | About Brooks + contact info |
| `services/window-washing.html` | Window washing detail page |
| `services/lawn-yardwork.html` | Lawn & yardwork detail page |
| `services/car-detailing.html` | Car detailing detail page |
| `assets/style.css` | Shared design system (tokens, layout, components) |
| `assets/wordmark.svg` | Typographic wordmark — typography only, no generated marks |
| `flyers/` | Print-ready door-knock flyers (in progress) |
| `crm/` | Door-knock CRM (in progress) |
| `data/` | Neighborhood-house database (in progress) |

---

## Brand Spec (Locked v1)

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary — Deep Forest Green | `#1B4332` | Headers, hero background, CTAs |
| Accent Gold | `#C8A35E` | Accents, dividers, hover states |
| Neutral Cream | `#F8F4ED` | Page background |
| Charcoal | `#1F1F1F` | Body text |

**Do not change these without JDM sign-off.** All colors are applied via CSS variables defined in `assets/style.css`.

### Typography

| Role | Font | Weight |
|------|------|--------|
| Display / Headings | Playfair Display | 500, 600, 700 |
| Body / UI | DM Sans | 300, 400, 500, 600 |

Both fonts are loaded from Google Fonts. No local font files needed.

### Wordmark

File: `assets/wordmark.svg` — typographic only. No logo mark, no shapes, no monogram.
- "COUNTRY CLUB" in Playfair Display 600
- "SERVICES" in DM Sans 500, tracked wide, in accent gold

### Tagline

> "Neighborhood-trusted. Window washing, lawn & yard, and car detailing."

---

## How to Update Prices

All pricing is marked `{{TBD per Brooks: pricing}}` in the three service pages. To update:

1. Open `services/window-washing.html`, `services/lawn-yardwork.html`, `services/car-detailing.html`
2. Find the text `{{TBD per Brooks: pricing}}`
3. Replace with the actual starting price (e.g. `$40`)
4. Save, commit, and push — GitHub Pages will update automatically

---

## How to Fill in Real Data

Search for `{{TBD` across all files to find all placeholders. Common ones:

| Placeholder | Where to fill it |
|-------------|-----------------|
| `{{TBD: name of neighborhood}}` | All pages (service area name) |
| `{{TBD: phone}}` / `{{TBD-phone}}` | `contact.html`, footers |
| `{{TBD: email}}` / `{{TBD-email}}` | `contact.html`, footers |
| `{{TBD: insurance status}}` | All footers |
| `{{X}}` | `index.html` hero (neighbor count) |
| `{{TBD: real testimonials}}` | `index.html` trust band |
| `{{TBD: photo of Brooks}}` | `index.html`, `contact.html` |
| `{{TBD: before/after photos}}` | All three service pages |
| `{{TBD per Brooks: pricing}}` | All three service pages |

---

## Booking Form — Wiring to a Backend

The booking form (`book.html`) currently saves submissions to `localStorage` as a JSON array under the key `ccs_bookings`. No backend required for v1.

When ready to wire up a backend:

1. Uncomment the `fetch()` call in `book.html`'s `<script>` block
2. Point it at `/api/leads/ccs-booking` (or whatever endpoint gets built)
3. Expected payload shape is documented in the `TODO` comment in the form script

---

## Deploy — GitHub Pages

### First-time setup (one-time, requires repo admin access)
1. Go to `https://github.com/retirementprotectors/country-club-services/settings/pages`
2. Under "Source": select **main branch**, folder **/ (root)**
3. Click Save
4. Site will be live at `https://retirementprotectors.github.io/country-club-services/`

### Every deploy after that
Push to `main` branch. GitHub Pages auto-publishes within ~1 minute.

```bash
git add -A
git commit -m "update: description of what changed"
git push origin main
```

### Custom domain (`countryclubservices.com` — TBD per JDM)
1. In repo Settings → Pages → Custom domain: enter `countryclubservices.com`
2. At your DNS registrar, add:
   - `A` record: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `retirementprotectors.github.io`
3. Enable "Enforce HTTPS" in Pages settings after DNS propagates (~24h)

---

## Quick Start (local preview)

This is a static site — no build step required.

```bash
# Option 1: open directly in browser
open index.html

# Option 2: serve locally (avoids any path issues)
npx serve .
# or
python3 -m http.server 8080
```

---

*Started summer 2025 — door-knock proven.*
